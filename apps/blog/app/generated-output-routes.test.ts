import { expect, test } from "vitest";

test("generated output route modules export GET handlers", async () => {
  const rss = await import("./rss.xml/route");
  const sitemap = await import("./sitemap.xml/route");
  const robots = await import("./robots.txt/route");
  const og = await import("./og/[slug]/route");

  expect(typeof rss.GET).toBe("function");
  expect(typeof sitemap.GET).toBe("function");
  expect(typeof robots.GET).toBe("function");
  expect(typeof og.GET).toBe("function");
});
