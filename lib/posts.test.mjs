import assert from "node:assert/strict";
import test from "node:test";
import { validatePostMeta, validatePostCanonical } from "./post-metadata.ts";

const valid = { title: " 첫 글 ", description: " 실제 글 소개 ", date: "2024-02-29" };

test("valid metadata is trimmed and leap dates remain valid", () => {
  assert.deepEqual(validatePostMeta(valid, "first-post"), { title: "첫 글", description: "실제 글 소개", date: "2024-02-29" });
});

test("missing fields and non-calendar dates fail with the offending slug", () => {
  for (const value of [null, [], {}, { ...valid, title: " " }, { ...valid, description: 42 }, { ...valid, date: "2025-02-29" }, { ...valid, date: "2026-13-01" }, { ...valid, date: "2026-1-01" }]) {
    assert.throws(() => validatePostMeta(value, "bad-post"), /bad-post/);
  }
});

test("demo articles cannot be accidentally promoted to public content", () => {
  assert.throws(() => validatePostMeta({ ...valid, demo: true }, "demo-post"), /demo-post/);
  assert.throws(() => validatePostMeta(valid, "../unsafe"), /slug/);
});

test("published metadata must point to its own slug, never a forgotten template slug", () => {
  const site = new URL("https://hozorica.com");
  assert.doesNotThrow(() => validatePostCanonical("https://hozorica.com/blog/first-post", "first-post", site));
  for (const canonical of [undefined, "/blog/new-post", "https://preview.example/blog/first-post"]) {
    assert.throws(() => validatePostCanonical(canonical, "first-post", site), /first-post/);
  }
});
