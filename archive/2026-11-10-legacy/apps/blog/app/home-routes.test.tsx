import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/blog/server/content-source", () => ({
  getSiteConfig: async () => ({ siteUrl: "https://hozorica.com", siteName: "호조리카" }),
}));

describe("production home", () => {
  it("renders the approved greeting with public SEO and no pixel scenery", async () => {
    const { default: Home, metadata } = await import("./page");
    const html = renderToStaticMarkup(await Home());
    expect(html).toContain('aria-label="안녕하세요 호조리카입니다"');
    expect(html).toContain('href="/about"');
    expect(html).toContain("application/ld+json");
    expect(html).toContain('"@type":"Person"');
    expect(html).not.toContain("/pixel/room-");
    expect(metadata.alternates).toMatchObject({ canonical: "/" });
    expect(metadata.robots).toBeUndefined();
  });
});
