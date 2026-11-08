"use client";

import { Chip, ChipGroup } from "@hozui/react";
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";

import { ProjectSections, RelatedPosts } from "./project-detail-body";
import { getProjectSections, getProjectToc } from "./project-content";
import type { ProjectCaseStudy } from "@blog-platform/core/content/catalog";

export function ProjectDetailPage({ project }: { project: ProjectCaseStudy }) {
  const sections = getProjectSections(project);
  const toc = getProjectToc(sections);

  return (
    <main className="project-document">
      <article className="project-document-sheet">
        <div className="project-document-bar">
          <Link className="project-document-back" href="/projects">
            <ArrowLeft size={15} aria-hidden="true" />
            작업실
          </Link>
          <span className="project-document-filename">
            <FileText size={15} aria-hidden="true" />
            {project.name}
          </span>
          <Link className="project-document-index" href={`/projects#${project.slug}`}>
            프로젝트 목록
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
        <div className="project-document-body">
          <header className="project-document-header">
            <h1 className="project-document-title">{project.name}</h1>
            <p className="project-document-description">{project.description}</p>

            <dl className="project-document-meta">
              <div>
                <dt className="inline text-muted-foreground">Role</dt>
                <dd className="ml-3 inline font-semibold">{project.role}</dd>
              </div>
              {project.period ? (
                <div>
                  <dt className="inline text-muted-foreground">Period</dt>
                  <dd className="ml-3 inline font-semibold">{project.period}</dd>
                </div>
              ) : null}
              <div>
                <dt className="inline text-muted-foreground">
                  {project.format === "showcase" ? "Category" : "Organization"}
                </dt>
                <dd className="ml-3 inline font-semibold">{project.organization}</dd>
              </div>
              {project.team ? (
                <div>
                  <dt className="inline text-muted-foreground">Team</dt>
                  <dd className="ml-3 inline font-semibold">{project.team}</dd>
                </div>
              ) : null}
            </dl>

            {project.technologies.length > 0 ? (
              <ChipGroup className="mt-5 flex flex-wrap gap-1.5" aria-label="사용 기술">
                {project.technologies.map((technology) => (
                  <Chip key={technology} label={technology} size="sm" tone="accent" />
                ))}
              </ChipGroup>
            ) : null}

            {project.evidence?.length ? (
              <nav aria-label="프로젝트 검증 링크" className="project-document-evidence">
                {project.evidence.map((item) => (
                  <a
                    className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-semibold no-underline transition-colors hover:border-primary hover:text-primary hover:no-underline"
                    href={item.href}
                    key={item.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </a>
                ))}
              </nav>
            ) : null}
          </header>

          {project.metrics.length > 0 ? (
            <section aria-label="주요 성과" className="project-document-outcomes">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm font-medium">{metric.detail}</p>
                </div>
              ))}
            </section>
          ) : null}

          {project.format !== "showcase" ? (
            <nav aria-labelledby="project-toc-title" className="project-document-toc">
              <p
                className="text-xs font-semibold tracking-[0.18em] text-primary uppercase"
                id="project-toc-title"
              >
                Contents
              </p>
              <ol className="mt-6 max-w-3xl space-y-6">
                {toc.map((item, itemIndex) => (
                  <li key={item.href}>
                    <a
                      className="group flex items-baseline gap-4 text-sm font-semibold no-underline transition-colors hover:text-primary hover:no-underline active:translate-y-px"
                      href={item.href}
                    >
                      <span className="w-5 shrink-0 text-xs tabular-nums text-primary">
                        {String(itemIndex + 1).padStart(2, "0")}
                      </span>
                      <span>{item.label}</span>
                    </a>
                    {item.children.length > 0 ? (
                      <ol className="mt-3 ml-9 space-y-2 border-l border-border pl-5 text-xs text-muted-foreground">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <a
                              className="inline-block py-0.5 no-underline transition-colors hover:text-primary hover:no-underline active:translate-y-px"
                              href={child.href}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <ProjectSections sections={sections} />
          <RelatedPosts posts={project.relatedPosts} />
        </div>
      </article>
    </main>
  );
}
