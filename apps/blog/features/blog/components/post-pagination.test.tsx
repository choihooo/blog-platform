import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostPagination } from "./post-pagination";

describe("crawlable pagination", () => {
  const hrefForPage = (page: number) => (page === 1 ? "/blog" : `/blog/page/${page}`);
  it("renders previous and next anchors in server HTML", () => {
    const html = renderToStaticMarkup(
      <PostPagination currentPage={13} totalPages={14} hrefForPage={hrefForPage} />,
    );
    expect(html).toContain('href="/blog/page/12"');
    expect(html).toContain('href="/blog/page/14"');
    expect(html).not.toContain("<form");
  });
  it("does not link outside the available range", () => {
    const html = renderToStaticMarkup(
      <PostPagination currentPage={1} totalPages={2} hrefForPage={hrefForPage} />,
    );
    expect(html).not.toContain('href="/blog/page/0"');
    expect(html).toContain('aria-disabled="true"');
    const last = renderToStaticMarkup(
      <PostPagination currentPage={2} totalPages={2} hrefForPage={hrefForPage} />,
    );
    expect(last).toContain('href="/blog"');
    expect(last).not.toContain('href="/blog/page/3"');
  });
});
