"use client";

import { Chip, ChipGroup } from "@hozui/react";
import Link from "next/link";

import { projects } from "./project-data";

export function ProjectsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16">
      <header className="pb-10 sm:pb-14">
        <p className="text-sm font-semibold text-primary">Selected Work</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Projects</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          제품과 운영 과정에서 발견한 문제를 기술로 풀어낸 프로젝트입니다. 프로젝트를 선택하면 문제,
          접근 방식과 결과를 정리한 상세 기록으로 이동합니다.
        </p>
      </header>

      <section aria-labelledby="project-index-title">
        <h2 className="sr-only" id="project-index-title">
          프로젝트 목록
        </h2>
        <ol className="border-y border-border">
          {projects.map((project) => (
            <li className="border-t border-border first:border-t-0" key={project.slug}>
              <Link
                className="group grid gap-3 px-1 py-6 no-underline transition-colors hover:bg-muted/40 hover:no-underline active:bg-muted sm:grid-cols-[2.5rem_minmax(0,1fr)_10rem_auto] sm:items-start sm:px-5"
                href={`/projects/${project.slug}`}
              >
                <span className="text-xs font-semibold text-primary">{project.index}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary sm:text-xl">
                      {project.name}
                    </h3>
                    <ChipGroup
                      aria-label={`${project.name} 사용 기술`}
                      className="flex flex-wrap gap-1.5"
                    >
                      {project.technologies.slice(0, 4).map((technology) => (
                        <Chip key={technology} label={technology} size="sm" tone="neutral" />
                      ))}
                    </ChipGroup>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {project.description}
                  </p>
                </div>
                <p className="text-xs leading-5 text-muted-foreground sm:text-right">
                  {project.meta}
                </p>
                <span
                  aria-hidden="true"
                  className="hidden transition-transform group-hover:translate-x-1 sm:block"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
