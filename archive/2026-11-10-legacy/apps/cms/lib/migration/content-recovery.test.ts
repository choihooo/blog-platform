import { expect, it } from "vitest";
import {
  buildRecoveredContent,
  contentUpdateStatement,
  assertRecoveryState,
} from "../../../../scripts/migration/content-recovery";

it("restores original JSX, table cells and wrapped media without changing post identity", () => {
  const result = buildRecoveredContent({
    html: '<html><body><nav>Ignore</nav><div class="tt_article_useless_p_margin"><h1>Title</h1><pre><code>function App&lt;T&gt;() {\n\n  return &lt;App /&gt;;\n}\n</code></pre><table><tr><th>A</th></tr><tr><td>B</td></tr></table><figure><span><img src="https://source.example/a.png"></span><figcaption>Caption</figcaption></figure></div><footer>Ignore</footer></body></html>',
    mapImage: (src) => (src === "https://source.example/a.png" ? "/media/a.webp" : undefined),
  });
  const nodes = JSON.parse(result).nodes;
  expect(nodes).toMatchObject([
    { type: "heading", text: "Title" },
    { type: "codeBlock", text: "function App<T>() {\n\n  return <App />;\n}\n" },
    {
      type: "table",
      rows: [[{ header: true, body: [{ text: "A" }] }], [{ body: [{ text: "B" }] }]],
    },
    { type: "image", src: "/media/a.webp", caption: "Caption" },
  ]);
  expect(result).not.toContain("Ignore");
});

it("refuses missing media mappings and stale content; supports no-op retry and guarded rollback", () => {
  expect(() =>
    buildRecoveredContent({
      html: '<div class="tt_article_useless_p_margin"><img src="https://source.example/missing.png"></div>',
      mapImage: () => undefined,
    }),
  ).toThrow(/mapping/i);
  expect(assertRecoveryState("before", "before", "after")).toBe("apply");
  expect(assertRecoveryState("after", "before", "after")).toBe("already-applied");
  expect(() => assertRecoveryState("edited later", "before", "after")).toThrow(/changed/i);
  const sql = contentUpdateStatement({
    id: "id",
    slug: "slug",
    before: "before",
    after: "after",
    updatedAt: "time",
  });
  expect(sql.sql).toContain("content = ?");
  expect(sql.sql.split("WHERE")[0]).not.toMatch(/updated_at\s*=/);
  expect(sql.params).toEqual(["after", "id", "slug", "before", "time"]);
});
