import assert from "node:assert/strict";
import test from "node:test";
import { installAnalytics, trackEvent, getTrackedLink } from "./analytics.ts";

function browser(t, gtag) {
  const previous = globalThis.window;
  globalThis.window = { location: new URL("https://hozorica.com/blog/example?private=value#section"), dataLayer: [], ...(gtag ? { gtag } : {}) };
  t.after(() => { if (previous === undefined) delete globalThis.window; else globalThis.window = previous; });
  return globalThis.window;
}

test("events are inactive until installed and stop after the observer unmounts", t => {
  const calls = [];
  browser(t, (...args) => calls.push(args));
  assert.equal(trackEvent("search_open", {}), false);
  const uninstall = installAnalytics("G-EXAMPLE123");
  assert.equal(trackEvent("search_open", {}), true);
  uninstall();
  assert.equal(trackEvent("search_open", {}), false);
  assert.equal(calls.length, 1);
});

test("GA payloads use the original article path without query or hash and strip private fields", t => {
  const calls = [];
  browser(t, (...args) => calls.push(args));
  t.after(installAnalytics("G-EXAMPLE123"));
  trackEvent("comment_submit", { article_slug: "original", body: "private comment", nickname: "private nickname" }, "/blog/original?token=secret#part");
  assert.deepEqual(calls, [["event", "comment_submit", {
    article_slug: "original", page_path: "/blog/original", page_location: "https://hozorica.com/blog/original", send_to: "G-EXAMPLE123",
  }]]);
  trackEvent("blog_search", { query_length: 4, result_count: 0, search_term: "private query" });
  assert.equal(calls[1][2].result_count, 0);
  assert.doesNotMatch(JSON.stringify(calls), /private|token|secret/);
});

test("early events queue before the external GA script loads", t => {
  const page = browser(t);
  t.after(installAnalytics("G-EXAMPLE123"));
  trackEvent("article_like", { article_slug: "example", like_action: "unlike" });
  assert.equal(page.dataLayer.length, 1);
  assert.equal(Object.prototype.toString.call(page.dataLayer[0]), "[object Arguments]");
  assert.deepEqual(Array.from(page.dataLayer[0]).slice(0, 2), ["event", "article_like"]);
  assert.equal(page.dataLayer[0][2].like_action, "unlike");
});

test("blocked or throwing analytics never interrupts the user's action", t => {
  browser(t, () => { throw new Error("blocked"); });
  t.after(installAnalytics("G-EXAMPLE123"));
  assert.equal(trackEvent("code_copy", { copy_status: "success", code_language: "ts", code_index: 1 }), false);
});

test("invalid identifiers and server rendering cannot activate tracking", t => {
  const calls = [];
  browser(t, (...args) => calls.push(args));
  t.after(installAnalytics("bad-id"));
  assert.equal(trackEvent("search_open", {}), false);
  delete globalThis.window;
  assert.doesNotThrow(() => installAnalytics("G-EXAMPLE123")());
  assert.equal(trackEvent("search_open", {}), false);
  assert.deepEqual(calls, []);
});

test("contact classification covers nested links without sending destinations or matching lookalike domains", () => {
  assert.deepEqual(getTrackedLink("https://github.com/choihooo", "header"), { name: "github_click", params: { link_location: "header" } });
  assert.deepEqual(getTrackedLink("mailto:someone@example.com?subject=private", "footer"), { name: "email_click", params: { link_location: "footer" } });
  assert.equal(getTrackedLink("https://github.com.evil.test/a", "article"), null);
  assert.equal(getTrackedLink("/blog/example", "article"), null);
});
