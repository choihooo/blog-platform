import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { PostBodyRenderer } from "./post-body-renderer";
import type { EditorNode } from "@blog-platform/editor";

const context = {
  provider: "none",
  slug: "test",
  title: "Test",
  url: "/blog/test",
  siteUrl: "https://example.com",
  category: "test",
  tags: [],
};
it("renders grouped numbering, table cells, mixed marks and linked captions without raw Markdown", () => {
  const nodes: EditorNode[] = [
    { type: "orderedList", text: "first" },
    { type: "orderedList", text: "second" },
    {
      type: "paragraph",
      text: "Before bold after",
      content: [{ text: "Before " }, { text: "bold", marks: ["bold"] }, { text: " after" }],
    },
    {
      type: "table",
      rows: [
        [{ header: true, body: [{ type: "paragraph", text: "Region" }] }],
        [{ body: [{ type: "paragraph", text: "서울" }] }],
      ],
    },
    {
      type: "image",
      src: "/media/a.webp",
      alt: "Alt",
      href: "https://example.com",
      caption: "Source",
      captionContent: [{ text: "Source", marks: ["italic"] }],
    },
  ];
  const html = renderToStaticMarkup(<PostBodyRenderer analyticsContext={context} nodes={nodes} />);
  expect(html.match(/<ol(?:>| )/g)).toHaveLength(1);
  expect(html).toContain("Before <strong>bold</strong> after");
  expect(html).toContain("<th");
  expect(html).toContain("서울");
  expect(html).toContain("<figcaption><em>Source</em></figcaption>");
  expect(html).toContain('href="https://example.com"');
});

it("escapes literal code and refuses unsafe links even for stored JSON", () => {
  const html = renderToStaticMarkup(
    <PostBodyRenderer
      analyticsContext={context}
      nodes={[
        { type: "codeBlock", text: "return <App<T> />;\n\n  done();" },
        {
          type: "paragraph",
          text: "link",
          content: [{ text: "link", href: "javascript:alert(1)" }],
        },
      ]}
    />,
  );
  expect(html).toContain("&lt;App&lt;T&gt; /&gt;");
  expect(html).not.toContain('href="javascript:');
});

it("keeps internal links in the current tab and external links isolated", () => {
  const html = renderToStaticMarkup(
    <PostBodyRenderer
      analyticsContext={context}
      nodes={[
        {
          type: "paragraph",
          text: "",
          content: [
            { text: "Internal", href: "/blog/test" },
            { text: "External", href: "https://example.com" },
          ],
        },
      ]}
    />,
  );
  expect(html).toContain('<a href="/blog/test">Internal</a>');
  expect(html).toMatch(/href="https:\/\/example.com"[^>]*target="_blank"/);
});
