import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScrollStory } from "./scroll-story";

describe("home story document", () => {
  it("provides a single primary heading and an accessible introduction", () => {
    const html = renderToStaticMarkup(<ScrollStory />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/<h2\b/g)).toHaveLength(2);
    expect(html).toContain('aria-label="호조리카 소개"');
    expect(html).toContain('aria-label="안녕하세요 호조리카입니다"');
  });
  it("provides ordinary destination links when JavaScript cannot run", () => {
    const html = renderToStaticMarkup(<ScrollStory />);
    const fallback = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1];
    for (const href of ["/resume", "/blog", "/projects"])
      expect(fallback).toContain(`href="${href}"`);
    expect(html).not.toContain('preload="auto"');
  });
});
