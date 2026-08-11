"use client";

import { Chip, ChipGroup } from "@hozui/react";
import Image from "next/image";
import Link from "next/link";

import type { ProjectCaseStudy } from "./project-data";

export function ProjectDetailPage({ project }: { project: ProjectCaseStudy }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-14">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground no-underline transition-colors hover:text-primary hover:no-underline"
        href="/projects"
      >
        <span aria-hidden="true">←</span>
        프로젝트 목록
      </Link>

      <article className="mt-10">
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
              <dt className="inline text-muted-foreground">Team</dt>
              <dd className="ml-3 inline font-semibold">{project.organization}</dd>
            </div>
          </dl>

          <ChipGroup className="mt-5 flex flex-wrap gap-1.5" aria-label="사용 기술">
            {project.technologies.map((technology) => (
              <Chip key={technology} label={technology} size="sm" tone="accent" />
            ))}
          </ChipGroup>
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

        <div className="divide-y divide-border">
          {project.stories.map((story) => (
            <section className="py-12 sm:py-16" key={story.title}>
              <header className="mb-8 border-b border-border pb-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                  {story.eyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {story.title}
                </h2>
              </header>

              <div
                className={
                  story.image
                    ? "grid gap-7 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start"
                    : "max-w-3xl"
                }
              >
                {story.image ? (
                  <figure>
                    <Image
                      alt={story.image.alt}
                      className="aspect-video w-full rounded-lg border border-border object-cover"
                      height={720}
                      priority
                      src={story.image.src}
                      width={1280}
                    />
                    <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
                      {story.image.caption}
                    </figcaption>
                  </figure>
                ) : null}

                <div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">Problem</h3>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">
                      {story.problem}
                    </p>
                  </div>
                  <div className="mt-7">
                    <h3 className="text-sm font-semibold text-primary">Approach</h3>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">
                      {story.approach}
                    </p>
                  </div>
                  <div className="mt-7 border-l-2 border-primary pl-4">
                    <h3 className="text-sm font-semibold">Result</h3>
                    <p className="mt-2 text-base font-semibold leading-7">{story.result}</p>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
