import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import {
  computeDbHostFingerprint,
  getAllowedFingerprints,
  verifyStagingGuard,
  assertStagingDatabase,
} from "../lib/staging-guard.mjs";

test("staging-guard unit tests", async (t) => {
  // Test helper: creates an ephemeral HTTP server
  function createMockServer(handler) {
    return new Promise((resolve) => {
      const server = http.createServer(handler);
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        const url = `http://127.0.0.1:${port}`;
        resolve({ server, url });
      });
    });
  }

  await t.test("1. computeDbHostFingerprint digests hostname correctly without credentials", () => {
    const fp1 = computeDbHostFingerprint("postgresql://user:pass@staging-db.internal:5432/mydb?sslmode=disable");
    const fp2 = computeDbHostFingerprint("staging-db.internal");
    assert.ok(fp1.length === 64, "SHA-256 fingerprint must be 64 hex characters");
    assert.equal(fp1, fp2, "Fingerprint of full URL must match fingerprint of isolated hostname");

    // Case-insensitivity check
    const fp3 = computeDbHostFingerprint("STAGING-DB.INTERNAL");
    assert.equal(fp1, fp3, "Fingerprint must be case-insensitive");
  });

  await t.test("2. match: server database fingerprint matches allow-list (passes)", async () => {
    const targetHost = "my-staging-postgres.local";
    const targetFp = computeDbHostFingerprint(targetHost);

    const { server, url } = await createMockServer((req, res) => {
      if (req.url === "/api/admin/health/db") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, fingerprint: targetFp }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    try {
      // Test match via allowedHost
      const resultHost = await verifyStagingGuard({
        serverUrl: url,
        allowedHost: targetHost,
        dbUrl: `postgresql://user:pass@${targetHost}:5432/db`,
      });
      assert.equal(resultHost.ok, true);
      assert.equal(resultHost.fingerprint, targetFp);

      // Test match via allowedFingerprint directly
      const resultFp = await verifyStagingGuard({
        serverUrl: url,
        allowedFingerprint: targetFp,
        dbUrl: `postgresql://user:pass@${targetHost}:5432/db`,
      });
      assert.equal(resultFp.ok, true);
      assert.equal(resultFp.fingerprint, targetFp);
    } finally {
      server.close();
    }
  });

  await t.test("3. mismatch: server database fingerprint does NOT match allow-list (refuses)", async () => {
    const productionFp = computeDbHostFingerprint("ep-production-db.neon.tech");

    const { server, url } = await createMockServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, fingerprint: productionFp }));
    });

    try {
      await assert.rejects(
        async () => {
          await verifyStagingGuard({
            serverUrl: url,
            allowedHost: "my-staging-postgres.local",
            dbUrl: "postgresql://localhost:55432/staging",
          });
        },
        (err) => {
          assert.equal(err.code, "FINGERPRINT_MISMATCH");
          assert.match(err.message, /FINGERPRINT_MISMATCH/);
          return true;
        }
      );

      // Also assert that assertStagingDatabase throws when throwOnError: true
      await assert.rejects(
        async () => {
          await assertStagingDatabase({
            serverUrl: url,
            allowedHost: "my-staging-postgres.local",
            throwOnError: true,
          });
        },
        (err) => err.code === "FINGERPRINT_MISMATCH"
      );
    } finally {
      server.close();
    }
  });

  await t.test("4. missing allow-list: neither STAGING_DB_FINGERPRINT nor STAGING_DB_HOST configured (refuses)", async () => {
    // Save original env
    const origFp = process.env.STAGING_DB_FINGERPRINT;
    const origHost = process.env.STAGING_DB_HOST;
    delete process.env.STAGING_DB_FINGERPRINT;
    delete process.env.STAGING_DB_HOST;

    try {
      await assert.rejects(
        async () => {
          await verifyStagingGuard({
            serverUrl: "http://127.0.0.1:3000",
            allowedFingerprint: "",
            allowedHost: "",
            dbUrl: "postgresql://localhost:5432/db",
          });
        },
        (err) => {
          assert.equal(err.code, "MISSING_ALLOW_LIST");
          assert.match(err.message, /MISSING_ALLOW_LIST/);
          return true;
        }
      );
    } finally {
      if (origFp !== undefined) process.env.STAGING_DB_FINGERPRINT = origFp;
      if (origHost !== undefined) process.env.STAGING_DB_HOST = origHost;
    }
  });

  await t.test("5. unreachable server: cannot connect to server (refuses)", async () => {
    // Point to a guaranteed unused port on localhost
    const deadUrl = "http://127.0.0.1:59998";

    await assert.rejects(
      async () => {
        await verifyStagingGuard({
          serverUrl: deadUrl,
          allowedHost: "localhost",
          timeoutMs: 1500,
        });
      },
      (err) => {
        assert.equal(err.code, "SERVER_UNREACHABLE");
        assert.match(err.message, /SERVER_UNREACHABLE/);
        return true;
      }
    );
  });
});
