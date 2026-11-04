import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { projects } from "../project-data";
import { DesktopPortfolio } from "./desktop-portfolio";
it("shows all desktop icons without a duplicate lower catalogue and provides a no-script escape", () => {
  const html = renderToStaticMarkup(<DesktopPortfolio />);
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(html).not.toContain("작업 바탕화면.");
  expect(html).not.toContain("작은 아이디어를");
  expect(html).not.toContain("프로젝트 아이콘을 눌러서 열어보세요");
  expect(html).not.toContain('id="all-projects"');
  expect(html).not.toContain('href="#all-projects"');
  expect(html).not.toContain("desktop-all-projects");
  for (const project of projects) {
    expect(html).toContain(project.name);
    expect(html).toContain(`aria-label="${project.name} 프로젝트 열기"`);
  }
  for (const href of ["/", "/resume", "/blog"]) expect(html).toContain(`href="${href}"`);
  expect(html).not.toContain("<canvas");
  expect(html).not.toContain('preload="auto"');
  expect(html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1]).toContain('href="/projects"');
});
