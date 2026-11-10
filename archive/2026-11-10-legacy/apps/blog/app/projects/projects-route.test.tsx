import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { projects } from "@blog-platform/core/content/catalog";

describe("desktop portfolio production routes", () => {
  it("renders the approved desktop at its indexable canonical URL", async () => {
    const { default: Page, metadata } = await import("./page");
    const html = renderToStaticMarkup(<Page />);
    expect(html).toContain('class="desktop-portfolio"');
    for (const project of projects)
      expect(html).toContain(`aria-label="${project.name} 프로젝트 열기"`);
    expect(html.match(/<header\b/g)).toHaveLength(1);
    expect(metadata.alternates).toMatchObject({ canonical: "/projects" });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });
});
