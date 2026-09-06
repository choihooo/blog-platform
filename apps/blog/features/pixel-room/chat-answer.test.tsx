import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChatAnswer } from "./chat-answer";

describe("readable chat answers", () => {
  it("renders comparison data as an accessible table", () => {
    const html = renderToStaticMarkup(
      createElement(ChatAnswer, {
        text: "| 프로젝트 | 역할 |\n| --- | --- |\n| Nexacro | Frontend |",
      }),
    );
    expect(html).toContain("<table>");
    expect(html).toContain('scope="col"');
    expect(html).toContain('aria-label="답변 비교표"');
    expect(html).toContain("<td>Nexacro</td>");
  });
  it("renders safe source links without accepting executable URLs", () => {
    const html = renderToStaticMarkup(
      createElement(ChatAnswer, {
        text: "[이력서](/resume) [코드](https://github.com/choihooo/blog-platform) [bad](javascript:alert) [bad](//evil.test)",
      }),
    );
    expect(html).toContain('href="/resume"');
    expect(html).toContain('href="https://github.com/choihooo/blog-platform"');
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('href="//evil');
  });
  it("renders factual sections as headings and separate list items", () => {
    const html = renderToStaticMarkup(
      createElement(ChatAnswer, {
        text: "공개 이력입니다.\n\n## 활동\n- CMC · React 개발\n- 커뮤니티 · 2025.03 ~ 2025.04",
      }),
    );
    expect(html).toContain("<h3>활동</h3>");
    expect(html.match(/<li>/g)).toHaveLength(2);
    expect(html).not.toContain("##");
    expect(html).toContain("2025.03 ~ 2025.04");
  });
  it("renders authoritative article titles as links with separate summaries", () => {
    const html = renderToStaticMarkup(
      createElement(ChatAnswer, {
        text: "legacy text",
        articles: [
          {
            source: { title: "AI UI 설계", url: "/blog/ai-ui", text: "LONG EXCERPT", score: 1 },
            summary: "AI 신뢰를 다룬 글이에요.",
          },
        ],
      }),
    );
    expect(html).toContain('href="/blog/ai-ui"');
    expect(html).toContain("<ol");
    expect(html).toContain("<p>AI 신뢰를 다룬 글이에요.</p>");
    expect(html).not.toContain("LONG EXCERPT");
    expect(html).not.toContain("legacy text");
  });
  it("escapes generated HTML and handles partial streaming", () => {
    expect(
      renderToStaticMarkup(createElement(ChatAnswer, { text: "<script>alert(1)</script>" })),
    ).not.toContain("<script>");
    expect(renderToStaticMarkup(createElement(ChatAnswer, { text: "" }))).toContain("답변을 준비");
  });
});
