import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { client } from "./sanity.client";

// @ts-expect-error - The stubbed client doesn't match the modern client interface
const builder = createImageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
