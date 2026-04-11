type CatalogEvent = {
  type:
    | "product.created"
    | "product.updated"
    | "product.deleted"
    | "product.restored"
    | "product.rolled_back"
    | "catalog.reindex.requested"
    | "catalog.reindex.completed";
  productId?: string;
  role?: string;
  payload?: unknown;
  timestamp?: string;
};

function getWebhookUrls(): string[] {
  const raw = process.env.CATALOG_WEBHOOK_URLS || "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function emitCatalogEvent(event: CatalogEvent) {
  const urls = getWebhookUrls();
  if (urls.length === 0) {
    return;
  }

  const body = JSON.stringify({
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  });

  await Promise.allSettled(
    urls.map(async (url) => {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    }),
  );
}

export function logCatalogError(scope: string, error: unknown) {
  console.error(`[catalog:${scope}]`, error);

  const alertWebhook = process.env.CATALOG_ALERT_WEBHOOK_URL;
  if (!alertWebhook) {
    return;
  }

  const message =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);

  void fetch(alertWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "catalog.error",
      scope,
      message,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // no-op: alert webhook failures should not fail API responses
  });
}
