import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    include: ["lib/**/*.test.ts"],
  },
});
