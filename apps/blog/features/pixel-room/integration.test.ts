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
  it("shows the site header on content pages and keeps the room headerless", () => {
    expect(read("./portfolio-chat.tsx")).not.toContain("/models/");
    const shell = read("../navigation/home-aware-shell.tsx");
    expect(shell).not.toContain('pathname.startsWith("/projects")');
    expect(shell).not.toContain('pathname.startsWith("/blog")');
    expect(shell).toContain('pathname.startsWith("/resume")');
  });
  it("uses a full page navigation for the desktop Projects header link", () => {
    const navigation = read("../navigation/desktop-navigation.tsx");
    expect(navigation).toContain('item.href === "/projects" ? (');
    expect(navigation).toContain('<a');
  });
  it("opens About and Work without a window entrance animation", () => {
    const styles = read("../../app/globals.css");
    expect(styles).not.toContain("animation: work-feed-backdrop-in");
    expect(styles).not.toContain("animation: work-feed-modal-in");
    expect(styles).not.toContain("animation: project-modal-in 300ms");
    expect(styles).toContain(".work-feed-backdrop");
    expect(styles).toContain(".resume-modal-backdrop");
    expect(styles).toContain(".hods-modal__dialog.resume-modal");
    expect(styles).toContain("transform: translate(-50%, -50%);");
  });
});
