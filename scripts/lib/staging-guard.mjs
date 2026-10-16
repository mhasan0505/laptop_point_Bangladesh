/**
 * Staging Database Guard for Write-Capable Test Scripts.
 * Enforces strict isolation: refuses to run writes against non-staging / remote development databases.
 */

export function assertStagingDatabase(options = {}) {
  const dbUrl = process.env.DATABASE_URL || "";
  const stagingHost = process.env.STAGING_DB_HOST || "";
  const allowWrite = process.env.TEST_ALLOW_WRITE === "1";

  if (!dbUrl) {
    if (options.allowNoDb) return;
    console.error("SAFETY REFUSAL: DATABASE_URL is not set.");
    process.exit(1);
  }

  let parsedHost = "";
  try {
    const url = new URL(dbUrl);
    parsedHost = url.hostname;
  } catch (err) {
    console.error("SAFETY REFUSAL: Could not parse DATABASE_URL:", err.message);
    process.exit(1);
  }

  // Explicit protection: Detect the remote development/production database
  if (parsedHost.includes("ep-wild-fog") || parsedHost.includes("laptop_point_bangladesh")) {
    console.error(
      `\n❌ SAFETY REFUSAL: DATABASE_URL points to remote database (${parsedHost}).` +
      `\nWrites are strictly prohibited against this environment.` +
      `\nTo run write-capable tests, configure a local or staging database and set STAGING_DB_HOST in .env.test.`
    );
    process.exit(1);
  }

  // If writes are requested, verify against STAGING_DB_HOST
  if (options.requireWrite || allowWrite) {
    if (!stagingHost) {
      console.error(
        `\n❌ SAFETY REFUSAL: STAGING_DB_HOST environment variable is not defined.` +
        `\nWrite-capable tests require an explicit STAGING_DB_HOST allow-list.` +
        `\nSee .env.test.example for setup instructions.`
      );
      process.exit(1);
    }

    const isMatch = parsedHost === stagingHost ||
      ((stagingHost === "localhost" || stagingHost === "127.0.0.1") && (parsedHost === "localhost" || parsedHost === "127.0.0.1"));

    if (!isMatch) {
      console.error(
        `\n❌ SAFETY REFUSAL: Database host "${parsedHost}" does NOT match allowed STAGING_DB_HOST "${stagingHost}".` +
        `\nAborting execution to protect database integrity.`
      );
      process.exit(1);
    }
  }
}
