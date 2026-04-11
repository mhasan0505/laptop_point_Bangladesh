const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const adminCookie = process.env.ADMIN_COOKIE;

if (!adminCookie) {
  console.error(
    "Missing ADMIN_COOKIE env. Example: admin_authenticated=true; admin_role=owner",
  );
  process.exit(1);
}

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookie,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    // no-op
  }

  return { status: response.status, body };
}

async function run() {
  const list = await request("/api/admin/products");
  console.log("GET /api/admin/products ->", list.status);
  if (list.status >= 400) {
    throw new Error("products list failed");
  }

  const reindex = await request("/api/admin/products/reindex", {
    method: "POST",
    body: "{}",
  });
  console.log("POST /api/admin/products/reindex ->", reindex.status);
  if (reindex.status >= 400) {
    throw new Error("reindex failed");
  }

  console.log("Catalog API smoke test passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
