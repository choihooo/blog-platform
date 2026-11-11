import assert from "node:assert/strict";
import test from "node:test";
import { getArticleReadPercent, createArticleReadSession } from "./article-reading.ts";

test("depth is relative to the article body, clamped for short articles and restored positions", () => {
  assert.equal(getArticleReadPercent(1000, 2000, 900), 0);
  assert.equal(getArticleReadPercent(1000, 2000, 1500), 25);
  assert.equal(getArticleReadPercent(1000, 2000, 4000), 100);
  assert.equal(getArticleReadPercent(1000, 300, 1800), 100);
  assert.equal(getArticleReadPercent(1000, 0, 1800), 0);
  assert.equal(getArticleReadPercent(1000, 2000, NaN), 0);
});

function session() {
  let clock = 0;
  const events = [];
  const reading = createArticleReadSession("example", (name, params) => events.push({ name, params }), { now: () => clock, visitId: "visit-one" });
  return { reading, events, at(value) { clock = value; } };
}

test("jumping past several milestones sends each once and reverse scrolling does not repeat them", () => {
  const { reading, events } = session();
  reading.update(76, "middle");
  reading.update(30, "intro");
  reading.update(92, "ending");
  reading.update(92, "ending");
  assert.deepEqual(events.map(event => [event.name, event.params.percent_scrolled]), [
    ["article_read_progress", 25], ["article_read_progress", 50], ["article_read_progress", 75], ["article_read_progress", 90],
  ]);
  assert.ok(events.every(event => event.params.article_slug === "example" && event.params.article_visit_id === "visit-one"));
});

test("exit summaries distinguish greatest depth from last position and retain their sections", () => {
  const { reading, events, at } = session();
  reading.setActive(true);
  reading.update(92, "conclusion");
  reading.update(35, "setup");
  at(5200);
  reading.finish("route_change");
  assert.deepEqual(events.at(-1), { name: "article_read_summary", params: {
    article_slug: "example", article_visit_id: "visit-one", max_scroll_percent: 92, last_scroll_percent: 35,
    max_section: "conclusion", last_section: "setup", active_read_seconds: 5.2, summary_reason: "route_change", summary_sequence: 1,
  } });
  reading.update(100, "after-unmount");
  reading.finish("route_change");
  assert.equal(events.filter(event => event.name === "article_read_summary").length, 1);
});

test("hidden and off-article intervals do not add reading time, while resumed visits emit only new time", () => {
  const { reading, events, at } = session();
  at(5000);
  reading.setActive(true);
  reading.update(30, "intro");
  at(7000);
  reading.setActive(false);
  reading.summarize("tab_hidden");
  reading.summarize("page_exit");
  assert.equal(events.filter(event => event.name === "article_read_summary").length, 1);
  at(60000);
  reading.setActive(true);
  at(63000);
  reading.update(100, "end");
  reading.finish("route_change");
  const summaries = events.filter(event => event.name === "article_read_summary");
  assert.deepEqual(summaries.map(event => event.params.active_read_seconds), [2, 3]);
  assert.deepEqual(summaries.map(event => event.params.summary_sequence), [1, 2]);
  assert.equal(summaries.at(-1).params.max_scroll_percent, 100);
  assert.equal(events.filter(event => event.params.percent_scrolled === 100).length, 1);
});

test("separate visits reset milestones and keep invalid geometry out of summaries", () => {
  const first = session();
  const second = session();
  first.reading.update(25, "intro");
  second.reading.update(NaN, "invalid");
  second.reading.update(-30, "intro");
  second.reading.update(25, "intro");
  second.reading.update(120, "end");
  second.reading.finish("route_change");
  assert.equal(first.events.filter(event => event.params.percent_scrolled === 25).length, 1);
  assert.equal(second.events.filter(event => event.params.percent_scrolled === 25).length, 1);
  assert.equal(second.events.at(-1).params.last_scroll_percent, 100);
});
