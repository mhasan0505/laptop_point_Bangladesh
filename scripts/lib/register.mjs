import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./scripts/lib/esm-alias-loader.mjs", pathToFileURL("./"));
