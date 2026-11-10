import assert from "node:assert/strict";
import test from "node:test";
import { getPostMetadata, getSiteConfig, getSitemapEntries } from "./site.ts";

const env = { SITE_URL: "https://hozorica.com", SITE_INDEXABLE: "true", VERCEL_ENV: "production" };

test("only explicitly enabled production can be indexed", () => {
  assert.equal(getSiteConfig(env).indexable, true);
  assert.equal(getSiteConfig({ ...env, VERCEL_ENV: "preview" }).indexable, false);
  assert.equal(getSiteConfig({ ...env, SITE_INDEXABLE: undefined }).indexable, false);
  assert.equal(getSiteConfig({}).indexable, false);
});

test("hosted builds require a valid HTTPS root URL without credentials", () => {
  for (const SITE_URL of [undefined, "bad", "http://hozorica.com", "https://user:pass@hozorica.com", "https://hozorica.com/wrong", "https://hozorica.com/?token=secret"]) {
    assert.throws(() => getSiteConfig({ ...env, SITE_URL }), /SITE_URL/);
  }
  assert.equal(getSiteConfig(env).url.href, "https://hozorica.com/");
});

test("post canonical and sharing metadata point to the production origin", () => {
  const meta = getPostMetadata({ title: "첫 글", description: "소개", date: "2026-11-10" }, "first-post", env);
  assert.equal(meta.alternates.canonical, "https://hozorica.com/blog/first-post");
  assert.equal(meta.openGraph.url, meta.alternates.canonical);
  assert.equal(meta.openGraph.type, "article");
  assert.equal(meta.openGraph.images[0].url, "https://hozorica.com/opengraph-image.png");
});

test("sitemap contains only public pages and stays empty when indexing is disabled", () => {
  const posts = [{ slug: "first-post", date: "2026-11-10" }, { slug: "demo", date: "2025-01-01", demo: true }, { slug: "_drafts", date: "2025-01-01" }];
  assert.deepEqual(getSitemapEntries(posts, env).map(p => p.url), ["https://hozorica.com/", "https://hozorica.com/blog/first-post"]);
  assert.deepEqual(getSitemapEntries(posts, { ...env, VERCEL_ENV: "preview" }), []);
  assert.deepEqual(getSitemapEntries(posts, { ...env, SITE_INDEXABLE: "false" }), []);
});
