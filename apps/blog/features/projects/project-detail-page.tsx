"use client";

import { Chip, ChipGroup } from "@hozui/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ProjectSections, RelatedPosts } from "./project-detail-body";
import { getProjectSections, getProjectToc } from "./project-content";
import type { ProjectCaseStudy } from "./project-data";

export function ProjectDetailPage({
  mode = "page",
  project,
}: {
  mode?: "modal" | "page";
  project: ProjectCaseStudy;
}) {
  const sections = getProjectSections(project);
  const toc = getProjectToc(sections);

  return (
    <main
      className={`mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28 ${mode === "modal" ? "pt-4 sm:pt-7" : "pt-10 sm:pt-14"}`}
    >
      {mode === "page" ? (
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground no-underline transition-colors hover:text-primary hover:no-underline"
          href={`/projects#${project.slug}`}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          프로젝트 목록
        </Link>
      ) : null}

      <article className={mode === "modal" ? "mt-2" : "mt-10"}>
        <header className="border-b border-border pb-10 sm:pb-14">
          <p className="text-sm font-semibold text-primary">Project Case Study</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {project.name}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">
            {project.description}
          </p>

          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="inline text-muted-foreground">Role</dt>
              <dd className="ml-3 inline font-semibold">{project.role}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">Period</dt>
              <dd className="ml-3 inline font-semibold">{project.period}</dd>
            </div>
            <div>
              <dt className="inline text-muted-foreground">Organization</dt>
              <dd className="ml-3 inline font-semibold">{project.organization}</dd>
            </div>
            {project.team ? (
              <div>
                <dt className="inline text-muted-foreground">Team</dt>
                <dd className="ml-3 inline font-semibold">{project.team}</dd>
              </div>
            ) : null}
          </dl>

          <ChipGroup className="mt-5 flex flex-wrap gap-1.5" aria-label="사용 기술">
            {project.technologies.map((technology) => (
              <Chip key={technology} label={technology} size="sm" tone="accent" />
            ))}
          </ChipGroup>

          {project.evidence?.length ? (
            <nav aria-label="프로젝트 검증 링크" className="mt-7 flex flex-wrap gap-3">
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
          <section
            aria-label="주요 성과"
            className="grid gap-8 border-b border-border py-10 sm:grid-cols-2 sm:py-12"
          >
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

        <nav aria-labelledby="project-toc-title" className="border-b border-border py-10">
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

        <ProjectSections sections={sections} />
        <RelatedPosts mode={mode} posts={project.relatedPosts} />
      </article>
    </main>
  );
}
