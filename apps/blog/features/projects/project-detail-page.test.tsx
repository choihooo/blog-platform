import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { getProject } from "./project-data";
import { getProjectSections, getProjectToc } from "./project-content";
import { ProjectDetailPage } from "./project-detail-page";

it.each(["kusting", "afterimage"])(
  "keeps %s content and navigation inside the workspace document",
  (slug) => {
    const project = getProject(slug)!;
    const html = renderToStaticMarkup(<ProjectDetailPage project={project} />);
    expect(html).toContain('class="project-document"');
    expect(html).toContain('class="project-document-sheet"');
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain(project.name);
    expect(html).toContain(project.role);
    expect(html).not.toContain('href="/experiments/interactive-portfolio"');
    expect(html).toContain('href="/projects"');
    expect(html).toContain(`href="/projects#${slug}"`);
    for (const section of getProjectSections(project)) expect(html).toContain(`id="${section.id}"`);
    if (project.format !== "showcase")
      for (const item of getProjectToc(getProjectSections(project)))
        expect(html).toContain(`href="${item.href}"`);
    for (const item of project.evidence ?? [])
      expect(html).toContain(`href="${item.href.replaceAll("&", "&amp;")}"`);
  },
);
