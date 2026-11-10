import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MainHeader } from "./main-header";

describe("shared main header", () => {
  it("uses real page destinations and marks the active portfolio", () => {
    const html = renderToStaticMarkup(<MainHeader active="work" />);
    for (const href of ["/", "/about", "/blog", "/projects"])
      expect(html).toContain(`href="${href}"`);
    for (const label of ["HOZORICA", "About", "Blog", "Portfolio"]) expect(html).toContain(label);
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain("<button");
  });
  it("keeps home scene navigation as buttons rather than navigating away", () => {
    const html = renderToStaticMarkup(
      <MainHeader active="blog" className="story-header" onNavigate={() => {}} onHome={() => {}} />,
    );
    expect(html.match(/<button\b/g)).toHaveLength(3);
    expect(html).toContain('aria-label="장면 이동"');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('href="/"');
  });
});
