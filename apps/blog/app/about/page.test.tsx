import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("@/features/blog/server/content-source", () => ({
  getSiteConfig: async () => ({
    siteUrl: "https://hozorica.com",
    defaultAuthor: "호조리카",
    defaultAuthorName: "최호",
    description: "호조리카의 블로그",
  }),
}));

it("gives About its own canonical, social metadata and ProfilePage identity", async () => {
  const { default: Page, metadata } = await import("./page");
  expect(metadata.alternates).toMatchObject({ canonical: "/about" });
  expect(metadata.openGraph).toMatchObject({ url: "/about" });
  expect(metadata.robots).toBeUndefined();
  const html = renderToStaticMarkup(await Page());
  expect(html).toContain('"@type":"ProfilePage"');
  expect(html).toContain('"url":"https://hozorica.com/about"');
  expect(html).toContain('href="https://github.com/choihooo"');
});
