import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup"],
    include: [
      "app/**/*.test.{ts,tsx}",
      "components/**/*.test.{ts,tsx}",
      "lib/**/*.test.ts",
      "features/**/*.test.{ts,tsx}",
      "shared/**/*.test.{ts,tsx}",
    ],
    testTimeout: 15000,
  },
});
