// Legacy endpoint kept for backwards compatibility. It previously duplicated
// the upload logic without validation and wrote to /public/products/uploads.
// All uploads now go through the single hardened handler.
export { POST } from "../../upload/route";
export const runtime = "nodejs";
