import { revalidatePath } from "next/cache";
import { emitCatalogEvent } from "./events";

export async function triggerCatalogBackgroundJobs(productId: string) {
  // Kick off lightweight async tasks without blocking request lifecycle.
  setTimeout(() => {
    void emitCatalogEvent({
      type: "catalog.reindex.requested",
      productId,
      payload: { source: "background-job" },
    });
  }, 0);

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${productId}`);
}
