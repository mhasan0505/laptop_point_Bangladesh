import { permanentRedirect } from "next/navigation";

// Legacy URL kept for existing links and search results.
export default function ChargerAdapterRedirect() {
  permanentRedirect("/accessories?category=chargers-adapters");
}
