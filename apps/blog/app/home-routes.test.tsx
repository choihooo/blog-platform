import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/blog/server/content-source", () => ({
  getSiteConfig: async () => ({ siteUrl: "https://hozorica.com", siteName: "호조리카" }),
}));
vi.mock("next/navigation", () => ({
  permanentRedirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

describe("home migration routes", () => {
  it("renders the approved greeting with public SEO and no pixel scenery", async () => {
    const { default: Home, metadata } = await import("./page");
    const html = renderToStaticMarkup(await Home());
    expect(html).toContain('aria-label="안녕하세요 호조리카입니다"');
    expect(html).toContain('href="/resume"');
    expect(html).toContain("application/ld+json");
    expect(html).toContain('"@type":"Person"');
    expect(html).not.toContain("/pixel/room-");
    expect(metadata.alternates).toMatchObject({ canonical: "/" });
    expect(metadata.robots).toBeUndefined();
  });
  it("redirects the old prototype to the canonical home", async () => {
    const { default: Preview } = await import("./experiments/scroll-story/page");
    expect(() => Preview()).toThrow("redirect:/");
  });
  it("keeps the pixel room available as a noindex archive", async () => {
    const { default: Archive, metadata } = await import("./experiments/pixel-room/page");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(renderToStaticMarkup(<Archive />)).toContain("/pixel/room-base-fixed.png");
  });
});
