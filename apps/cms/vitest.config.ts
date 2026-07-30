import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    include: ["app/**/*.test.tsx", "components/**/*.test.{ts,tsx}", "lib/**/*.test.ts"],
    testTimeout: 15000,
  },
});
