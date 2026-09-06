import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("pixel room integration contracts", () => {
  it("replaces only the home experience and preserves SEO", () => {
    const home = read("../../app/page.tsx");
    expect(home).toContain("<PixelRoom />");
    expect(home).toContain("personJsonLd(site)");
    expect(home).toContain('canonical: "/"');
  });
  it("links hotspots to existing routes without placeholder modals", () => {
    const room = read("./pixel-room.tsx");
    for (const href of ["/projects", "/blog", "/resume"]) {
      expect(room).toContain(`href="${href}"`);
    }
    expect(room).not.toContain("RoomModal");
    expect(room).toContain("prefers-reduced-motion");
  });
  it("ships all scene images and keeps styles scoped", () => {
    const room = read("./pixel-room.tsx");
    const images = [...room.matchAll(/"(\/pixel\/[^" ]+\.png)"/g)];
    expect(images.length).toBeGreaterThanOrEqual(6);
    for (const [, image] of images) {
      expect(existsSync(fileURLToPath(new URL(`../../public${image}`, import.meta.url)))).toBe(
        true,
      );
    }
    expect(read("./pixel-room.css")).toContain(".pixel-room-page {");
    expect(read("./pixel-room.css")).toContain("@keyframes chat-ai-shimmer");
  });
  it("does not ship a missing experimental model or replace content-page header", () => {
    expect(read("./portfolio-chat.tsx")).not.toContain("/models/");
    expect(read("../navigation/home-aware-shell.tsx")).toContain('pathname !== "/"');
  });
});
