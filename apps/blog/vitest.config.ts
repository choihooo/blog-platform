import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@": path.dirname(fileURLToPath(import.meta.url)),
    },
  },
  test: {
    globals: false,
    include: ["{app,features,shared}/**/*.test.{ts,tsx}"],
    testTimeout: 15_000,
  },
});
