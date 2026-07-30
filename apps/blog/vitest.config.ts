import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    include: ["app/**/*.test.{ts,tsx}", "lib/**/*.test.ts"],
    testTimeout: 15_000,
  },
});
