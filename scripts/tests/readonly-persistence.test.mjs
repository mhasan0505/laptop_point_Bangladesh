import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";

import { pathToFileURL } from "node:url";

test("Read-only filesystem persistence acceptance test", () => {
  const scriptPath = path.resolve(process.cwd(), "scripts", "test-readonly-persistence.mjs");
  const registerPath = path.resolve(process.cwd(), "scripts", "lib", "register.mjs");

  const result = spawnSync(
    process.execPath,
    ["--import", pathToFileURL(registerPath).href, scriptPath],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: { ...process.env },
    }
  );

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
  }

  assert.equal(result.status, 0, "test-readonly-persistence.mjs should exit with code 0");
  assert.ok(result.stdout.includes("ALL 9/9 READ-ONLY PERSISTENCE TESTS PASSED"));
  assert.ok(result.stdout.includes("Cross-Instance Cache Coherence"));
});

