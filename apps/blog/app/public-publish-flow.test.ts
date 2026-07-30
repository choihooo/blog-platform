import assert from "node:assert/strict";
import { test } from "node:test";

test("public publish flow files are importable", async () => {
  const content = await import("../lib/content");
  const home = await import("./page");
  const post = await import("./posts/[slug]/page");

  assert.equal(typeof content.getPublishedPosts, "function");
  assert.equal(typeof home.default, "function");
  assert.equal(typeof post.default, "function");
});
