import assert from "node:assert/strict";
import test from "node:test";
import { enhanceArticle } from "./article-tools.mjs";

const heading = (text, depth = 2, properties = {}) => ({
  type: "element", tagName: `h${depth}`, properties,
  children: [{ type: "text", value: text }],
});
const root = (...children) => ({ type: "root", children });

test("Korean and inline code headings become linked, uniquely identified sections", () => {
  const first = heading("한글 제목!");
  first.children.push({ type: "element", tagName: "code", properties: {}, children: [{ type: "text", value: " useState" }] });
  const second = heading("한글 제목! useState", 3);
  const tree = root({ type: "mdxJsxFlowElement", name: "PostHeader", children: [] }, first, second);
  enhanceArticle(tree);
  assert.equal(first.properties.id, "한글-제목-usestate");
  assert.equal(second.properties.id, "한글-제목-usestate-1");
  const nav = tree.children[1];
  assert.equal(nav.tagName, "nav");
  const items = nav.children[0].children[1].children;
  assert.equal(items[0].children[0].properties.href, `#${encodeURIComponent(first.properties.id)}`);
  assert.equal(items[0].children[0].children[0].value, "한글 제목! useState");
  assert.deepEqual(items[1].properties.className, ["article-toc-subitem"]);
});

test("existing IDs, unrelated anchors, empty headings and duplicate IDs do not collide", () => {
  const anchor = { type: "element", tagName: "div", properties: { id: "intro" }, children: [] };
  const first = heading("First", 2, { id: "intro" });
  const second = heading("Second", 2, { id: "intro" });
  const third = heading("!!!");
  const fourth = heading("???");
  const tree = root(anchor, first, second, third, fourth);
  enhanceArticle(tree);
  assert.deepEqual([first, second, third, fourth].map(h => h.properties.id), ["intro-1", "intro-2", "section", "section-1"]);
});

test("demo headings are excluded and short articles get no empty table of contents", () => {
  const demoHeading = heading("Demo heading");
  const demo = { type: "element", tagName: "div", properties: { className: ["not-prose"] }, children: [demoHeading] };
  const tree = root(heading("Article title", 1), demo, heading("Only section"));
  enhanceArticle(tree);
  assert.equal(tree.children.length, 3);
  assert.equal(demoHeading.properties.id, undefined);
  assert.equal(tree.children[2].properties.id, "only-section");
});
