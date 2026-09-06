import { mkdir, copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const entry = require.resolve("@wllama/wllama/esm/index.js");
const target = new URL("../public/wasm/", import.meta.url);
await mkdir(target, { recursive: true });
await copyFile(join(dirname(entry), "wasm/wllama.wasm"), new URL("wllama.wasm", target));
