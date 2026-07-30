import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(appDirectory, "../.."),
  outputFileTracingIncludes: {
    "/*": ["../../content/site.json"],
  },
};

export default nextConfig;
