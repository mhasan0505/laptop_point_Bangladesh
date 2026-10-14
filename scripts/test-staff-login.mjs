import fs from "fs";
import {
  getClientIp,
  isGlobalEmailCapExceeded,
  recordFailedLogin,
  resetLoginRateLimit,
} from "../lib/rate-limit.ts";
import {
  computePasswordFingerprint,
  createTrustedDeviceToken,
  verifyTrustedDeviceToken,
} from "../lib/admin-auth.ts";

// Load .env.local if not already exported in the shell environment
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

if (!process.env.ADMIN_PASSWORD) {
  console.error("ERROR: ADMIN_PASSWORD is unset. Please configure ADMIN_PASSWORD in your environment or .env.local before running this test.");
  process.exit(1);
}

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

function extractCookies(response) {
  const setCookies = response.headers.getSetCookie
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];

  const cookiePairs = [];
  let trustedDeviceCookie = "";
  let sessionCookie = "";

  for (const sc of setCookies) {
    if (!sc) continue;
    const firstPart = sc.split(";")[0].trim();
    cookiePairs.push(firstPart);
    if (firstPart.startsWith("trusted_device=")) {
      trustedDeviceCookie = firstPart;
    }
    if (firstPart.startsWith("admin_session=")) {
      sessionCookie = firstPart;
    }
  }

  return {
    allCookies: cookiePairs.join("; "),
    trustedDeviceCookie,
    sessionCookie,
  };
}

async function run() {
  console.log("=== Testing Staff Login, Freshness, Trusted Device & Rate Limiting ===");
  let passed = 0;
  let total = 10;

  // 1. Owner Login via env credentials (issues admin_session & trusted_device cookies)
  console.log("\n[Test 1] Logging in as Primary Owner via env credentials...");
  const ownerRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@laptoppointbd.com",
      password: process.env.ADMIN_PASSWORD,
    }),
  });

  const ownerData = await ownerRes.json();
  console.log("Owner login status:", ownerRes.status);
  const ownerCookies = extractCookies(ownerRes);

  if (
    ownerRes.status === 200 &&
    ownerData.user?.role === "owner" &&
    ownerCookies.trustedDeviceCookie.length > 0 &&
    ownerCookies.sessionCookie.length > 0
  ) {
    console.log("PASS: Owner login succeeded with role 'owner' and received trusted_device cookie!");
    passed++;
  } else {
    console.error("FAIL: Owner login failed or missing cookies:", ownerData, ownerCookies);
  }

  // 2. Create staff user (role: manager)
  console.log("\n[Test 2] Creating staff user (role: manager)...");
  const testStaffEmail = "staff.hardening.test@laptoppointbd.com";
  const testStaffPass = "SecureManagerPass123!";

  // Pre-cleanup in case a previous interrupted run left a lingering user
  const listUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
    headers: { Cookie: ownerCookies.allCookies },
  });
  if (listUsersRes.status === 200) {
    const listData = await listUsersRes.json();
    const existing = listData.users?.find(
      (u) => u.email.toLowerCase() === testStaffEmail.toLowerCase()
    );
    if (existing) {
      console.log("Cleaning up lingering test staff user:", existing.id);
      await fetch(`${BASE_URL}/api/admin/users/${existing.id}`, {
        method: "DELETE",
        headers: { Cookie: ownerCookies.allCookies },
      });
    }
  }

  const createRes = await fetch(`${BASE_URL}/api/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: ownerCookies.allCookies,
    },
    body: JSON.stringify({
      name: "Hardening Test Manager",
      email: testStaffEmail,
      role: "manager",
      password: testStaffPass,
    }),
  });

  const createData = await createRes.json();
  console.log("Create staff status:", createRes.status);
  const staffUserId = createData.user?.id;

  if (createRes.status === 200 && staffUserId) {
    console.log("PASS: Staff user created with id:", staffUserId);
    passed++;
  } else {
    console.error("FAIL: Failed to create staff user:", createData);
  }

  // 3. Login as staff user and get session & trusted_device cookies
  console.log("\n[Test 3] Logging in as staff user...");
  const staffLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testStaffEmail,
      password: testStaffPass,
    }),
  });

  const staffLoginData = await staffLoginRes.json();
  console.log("Staff login status:", staffLoginRes.status);
  const staffCookies = extractCookies(staffLoginRes);

  if (
    staffLoginRes.status === 200 &&
    staffLoginData.user?.role === "manager" &&
    staffCookies.trustedDeviceCookie.length > 0
  ) {
    console.log("PASS: Staff user logged in successfully with role 'manager' and received trusted_device cookie!");
    passed++;
  } else {
    console.error("FAIL: Staff login failed:", staffLoginData);
  }

  // 4. Demoted staff gets 403
  console.log("\n[Test 4] Demoting staff user to 'support' and testing role freshness (expecting 403)...");
  const demoteRes = await fetch(`${BASE_URL}/api/admin/users/${staffUserId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: ownerCookies.allCookies,
    },
    body: JSON.stringify({ role: "support" }),
  });
  console.log("Demote PATCH status:", demoteRes.status);

  const jobsRes = await fetch(`${BASE_URL}/api/admin/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: staffCookies.sessionCookie,
    },
    body: JSON.stringify({ action: "expire_deals" }),
  });

  const jobsData = await jobsRes.json();
  console.log("Staff hitting manager-only route status (expected 403):", jobsRes.status);

  if (jobsRes.status === 403) {
    console.log("PASS: Demoted staff holding old 'manager' cookie was rejected with HTTP 403 Forbidden!");
    passed++;
  } else {
    console.error("FAIL: Expected 403 for demoted staff but got:", jobsRes.status, jobsData);
  }

  // 5. Deactivated staff gets 401 on next request
  console.log("\n[Test 5] Deactivating staff user and testing session revocation (expecting 401)...");
  const deactivateRes = await fetch(`${BASE_URL}/api/admin/users/${staffUserId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: ownerCookies.allCookies,
    },
    body: JSON.stringify({ active: false }),
  });
  console.log("Deactivate PATCH status:", deactivateRes.status);

  const nextReqRes = await fetch(`${BASE_URL}/api/admin/jobs`, {
    headers: {
      Cookie: staffCookies.sessionCookie,
    },
  });

  const nextReqData = await nextReqRes.json();
  console.log("Deactivated staff access status (expected 401):", nextReqRes.status);

  if (nextReqRes.status === 401) {
    console.log("PASS: Deactivated staff holding active cookie was immediately rejected with HTTP 401 Unauthorized!");
    passed++;
  } else {
    console.error("FAIL: Expected 401 for deactivated staff but got:", nextReqRes.status, nextReqData);
  }

  // 6. Assertion (a): With TRUSTED_PROXY unset, rotating X-Forwarded-For / x-vercel-forwarded-for does NOT reset counters
  console.log("\n[Test 6] Assertion (a): With TRUSTED_PROXY unset, rotating headers does NOT reset counters (5 failures -> 429 on 6th)...");
  const targetEmail = "admin@laptoppointbd.com";
  let got429 = false;
  let retryAfterHeader = null;
  const timings = [];

  for (let i = 1; i <= 6; i++) {
    const t0 = Date.now();
    const wrongRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Rotate various forwarding headers to simulate attacker IP spoofing
        ...(i % 2 === 0
          ? { "x-vercel-forwarded-for": `198.51.100.${i}` }
          : { "X-Forwarded-For": `client-spoof, 198.51.100.${i}` }),
      },
      body: JSON.stringify({
        email: targetEmail,
        password: `AttackerGuess_${i}`,
      }),
    });
    const elapsed = Date.now() - t0;
    timings.push(elapsed);

    console.log(`Attempt ${i} status: ${wrongRes.status} (${elapsed}ms)`);
    if (wrongRes.status === 429) {
      got429 = true;
      retryAfterHeader = wrongRes.headers.get("retry-after");
      const errBody = await wrongRes.json();
      console.log("429 response received:", errBody, "Retry-After:", retryAfterHeader);
      break;
    }
  }

  // Progressive delay check: later attempts with failures take longer
  const progressiveDelayObserved = timings.length > 2 && timings[timings.length - 2] >= 200;
  console.log("Progressive delay observed:", progressiveDelayObserved, timings);

  if (got429) {
    console.log("PASS: Rotating forwarding headers did NOT reset counters when TRUSTED_PROXY is unset; received 429!");
    passed++;
  } else {
    console.error("FAIL: Did not receive 429 on 6th attempt with rotated headers.");
  }

  // 7. Assertion (b): After the cap is hit, correct password WITHOUT trusted cookie yields 429
  console.log("\n[Test 7] Assertion (b): Submitting CORRECT password WITHOUT trusted device cookie after lockout...");
  const correctNoCookieRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": "198.51.100.99",
    },
    body: JSON.stringify({
      email: targetEmail,
      password: process.env.ADMIN_PASSWORD,
    }),
  });

  const correctNoCookieData = await correctNoCookieRes.json();
  console.log("Correct password WITHOUT cookie status (expected 429):", correctNoCookieRes.status);
  console.log("Response body:", correctNoCookieData);

  if (correctNoCookieRes.status === 429) {
    console.log("PASS: Account is locked; submitting correct password without trusted cookie was rejected with HTTP 429 before checking credentials!");
    passed++;
  } else {
    console.error("FAIL: Expected 429 for request without trusted cookie, got:", correctNoCookieRes.status);
  }

  // 8. Assertion (c): With a trusted device cookie, correct password yields 200
  console.log("\n[Test 8] Assertion (c): Submitting CORRECT password WITH valid trusted device cookie...");
  const correctWithCookieRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: ownerCookies.trustedDeviceCookie,
      "X-Forwarded-For": "198.51.100.99",
    },
    body: JSON.stringify({
      email: targetEmail,
      password: process.env.ADMIN_PASSWORD,
    }),
  });

  const correctWithCookieData = await correctWithCookieRes.json();
  console.log("Correct password WITH cookie status (expected 200):", correctWithCookieRes.status);
  console.log("Response body:", correctWithCookieData);

  const freshCookies = extractCookies(correctWithCookieRes);

  if (correctWithCookieRes.status === 200 && correctWithCookieData.user?.role === "owner") {
    console.log("PASS: Trusted device cookie successfully bypassed the lock and logged in with HTTP 200!");
    passed++;
  } else {
    console.error("FAIL: Expected 200 with trusted cookie, got:", correctWithCookieRes.status, correctWithCookieData);
  }

  // 9. Failures from trusted device still count and receive 401
  console.log("\n[Test 9] Submitting WRONG password WITH trusted device cookie (failures still count)...");
  const wrongWithCookieRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: freshCookies.trustedDeviceCookie || ownerCookies.trustedDeviceCookie,
    },
    body: JSON.stringify({
      email: targetEmail,
      password: "WrongPasswordWithTrustedCookie123!",
    }),
  });

  console.log("Wrong password WITH cookie status (expected 401):", wrongWithCookieRes.status);

  if (wrongWithCookieRes.status === 401) {
    console.log("PASS: Request with trusted cookie bypassed 429 gate and was verified normally; invalid credentials yielded 401!");
    passed++;
  } else {
    console.error("FAIL: Expected 401 for wrong password with trusted cookie, got:", wrongWithCookieRes.status);
  }

  // 10. Unit verification of TRUSTED_PROXY header resolution, 10-attempt global cap, and revocation
  console.log("\n[Test 10] Unit verification of TRUSTED_PROXY resolution, 10-attempt global cap, and password fingerprint revocation...");
  let unitSuccess = true;

  // (a) TRUSTED_PROXY unset
  const oldProxyEnv = process.env.TRUSTED_PROXY;
  delete process.env.TRUSTED_PROXY;
  const mockReqUnset = new Request("http://localhost", {
    headers: {
      "x-forwarded-for": "1.1.1.1, 2.2.2.2",
      "x-vercel-forwarded-for": "3.3.3.3",
      "cf-connecting-ip": "4.4.4.4",
    },
  });
  if (getClientIp(mockReqUnset) !== "unknown") {
    console.error("Unit FAIL: TRUSTED_PROXY unset did not return 'unknown'");
    unitSuccess = false;
  }

  // (b) TRUSTED_PROXY=vercel
  process.env.TRUSTED_PROXY = "vercel";
  const mockReqVercel = new Request("http://localhost", {
    headers: {
      "x-forwarded-for": "1.1.1.1",
      "x-vercel-forwarded-for": "3.3.3.3",
    },
  });
  if (getClientIp(mockReqVercel) !== "3.3.3.3") {
    console.error("Unit FAIL: TRUSTED_PROXY=vercel did not read x-vercel-forwarded-for");
    unitSuccess = false;
  }

  // (c) TRUSTED_PROXY=cloudflare
  process.env.TRUSTED_PROXY = "cloudflare";
  const mockReqCf = new Request("http://localhost", {
    headers: {
      "x-forwarded-for": "1.1.1.1",
      "cf-connecting-ip": "4.4.4.4",
    },
  });
  if (getClientIp(mockReqCf) !== "4.4.4.4") {
    console.error("Unit FAIL: TRUSTED_PROXY=cloudflare did not read cf-connecting-ip");
    unitSuccess = false;
  }

  // (d) TRUSTED_PROXY=xff
  process.env.TRUSTED_PROXY = "xff";
  const mockReqXff = new Request("http://localhost", {
    headers: {
      "x-forwarded-for": "1.1.1.1, 5.5.5.5",
    },
  });
  if (getClientIp(mockReqXff) !== "5.5.5.5") {
    console.error("Unit FAIL: TRUSTED_PROXY=xff did not read last entry of x-forwarded-for");
    unitSuccess = false;
  }

  // Restore environment
  if (oldProxyEnv !== undefined) {
    process.env.TRUSTED_PROXY = oldProxyEnv;
  } else {
    delete process.env.TRUSTED_PROXY;
  }

  // (e) 10-attempt global email cap
  const testGlobalEmail = "test-global-cap@laptoppointbd.com";
  for (let k = 1; k <= 9; k++) {
    recordFailedLogin(`10.0.0.${k}`, testGlobalEmail);
  }
  if (isGlobalEmailCapExceeded(testGlobalEmail).exceeded !== false) {
    console.error("Unit FAIL: 9 failures should not exceed the 10-attempt global email cap");
    unitSuccess = false;
  }
  recordFailedLogin("10.0.0.10", testGlobalEmail); // 10th failure
  if (isGlobalEmailCapExceeded(testGlobalEmail).exceeded !== true) {
    console.error("Unit FAIL: 10 failures did not trigger isGlobalEmailCapExceeded");
    unitSuccess = false;
  }

  // (f) Trusted device revocation on password change
  const origPass = "InitialPassword123!";
  const origFp = await computePasswordFingerprint(origPass);
  const token = await createTrustedDeviceToken("usr-owner-1", origFp);

  const validWithOrigFp = await verifyTrustedDeviceToken(token, "usr-owner-1", origFp);
  const changedPass = "ChangedPassword456!";
  const newFp = await computePasswordFingerprint(changedPass);
  const validWithNewFp = await verifyTrustedDeviceToken(token, "usr-owner-1", newFp);

  if (!validWithOrigFp || validWithNewFp) {
    console.error("Unit FAIL: Trusted device cookie revocation via password fingerprint failed:", {
      validWithOrigFp,
      validWithNewFp,
    });
    unitSuccess = false;
  }

  if (unitSuccess) {
    console.log("PASS: Unit checks for TRUSTED_PROXY, 10-attempt cap, and fingerprint revocation all verified!");
    passed++;
  }

  // Cleanup: Delete the test staff user
  if (staffUserId) {
    console.log("\n[Cleanup] Removing test staff user...");
    const cleanupCookie = freshCookies.allCookies || ownerCookies.allCookies;
    const delRes = await fetch(`${BASE_URL}/api/admin/users/${staffUserId}`, {
      method: "DELETE",
      headers: {
        Cookie: cleanupCookie,
      },
    });
    console.log("Delete staff user status:", delRes.status);
  }

  console.log(`\n=== Staff Login & Hardening Test Summary: ${passed}/${total} Passed ===`);
  if (passed !== total) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
