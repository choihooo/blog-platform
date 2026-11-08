import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { getProject } from "@blog-platform/core/content/catalog";
import { getProjectSections } from "../project-content";
import { ProjectWindowSummary } from "./project-window-summary";

it("shows source-backed context, technologies, metric conditions and linked work", () => {
  const project = getProject("kusting")!;
  const html = renderToStaticMarkup(
    <ProjectWindowSummary project={project}>
      <img alt="시연" src="/preview.jpg" />
    </ProjectWindowSummary>,
  );
  expect(html).toContain(project.role);
  expect(html).toContain(project.team!);
  for (const tech of project.technologies) expect(html).toContain(tech);
  for (const metric of project.metrics) {
    expect(html).toContain(metric.value);
    expect(html).toContain(metric.label);
    expect(html).toContain(metric.detail);
  }
  for (const section of getProjectSections(project).slice(0, 3))
    expect(html).toContain(`href="/projects/kusting#${section.id}"`);
  for (const post of project.relatedPosts ?? [])
    expect(html).toContain(`href="/blog/${post.slug}"`);
  expect(html.indexOf('href="/projects/kusting"')).toBeLessThan(html.indexOf('src="/preview.jpg"'));
});
it("omits empty sections for publishing showcases and keeps the real site link", () => {
  const project = getProject("afterimage")!;
  const html = renderToStaticMarkup(
    <ProjectWindowSummary project={project}>
      <span>미리보기</span>
    </ProjectWindowSummary>,
  );
  expect(html).not.toContain('aria-label="사용 기술"');
  expect(html).not.toContain('aria-label="주요 성과"');
  expect(html).toContain('href="https://afterimage.hozorica.com/"');
  expect(html).toContain('href="/projects/afterimage#experience"');
});
