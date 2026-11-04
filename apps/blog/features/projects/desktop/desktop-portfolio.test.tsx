import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { projects } from "../project-data";
import { DesktopPortfolio } from "./desktop-portfolio";
it("retains real navigation and every project without JavaScript", () => {
  const html = renderToStaticMarkup(<DesktopPortfolio />);
  expect(html.match(/<h1\b/g)).toHaveLength(1);
  expect(html).toContain('id="all-projects"');
  for (const project of projects) {
    expect(html).toContain(`href="/projects/${project.slug}"`);
    expect(html).toContain(project.name);
  }
  for (const href of ["/", "/resume", "/blog"]) expect(html).toContain(`href="${href}"`);
  expect(html).not.toContain("<canvas");
  expect(html).not.toContain('preload="auto"');
});
