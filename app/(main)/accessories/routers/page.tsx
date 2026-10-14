import { permanentRedirect } from "next/navigation";

// Legacy URL; the old page was an empty placeholder.
export default function RoutersRedirect() {
  permanentRedirect("/accessories?category=routers-networking");
}
