import assert from "node:assert/strict";
import { test } from "node:test";

test("generated output route modules export GET handlers", async () => {
  const rss = await import("./rss.xml/route");
  const sitemap = await import("./sitemap.xml/route");
  const robots = await import("./robots.txt/route");
  const og = await import("./og/[slug]/route");

  assert.equal(typeof rss.GET, "function");
  assert.equal(typeof sitemap.GET, "function");
  assert.equal(typeof robots.GET, "function");
  assert.equal(typeof og.GET, "function");
});
