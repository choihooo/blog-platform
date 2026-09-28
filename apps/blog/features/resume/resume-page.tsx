"use client";

import Image from "next/image";

import { workExperiences, sideProjects, activities, awards, skillGroups } from "./resume-data";
import { profile } from "./profile-data";
import { AchievementCard, CompactList, SectionHeading, TechChips } from "./resume-components";

export function ResumePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16 print:pt-4">
      <section className="border-b border-border pb-10 sm:pb-12">
        <div className="grid gap-8 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-start">
          <div className="flex flex-col items-start gap-5">
            <Image
              alt="최호 프로필 사진"
              className="size-[116px] shrink-0 rounded-full object-cover"
              height={116}
              priority
              src="/resume/profile.png"
              width={116}
            />
            <nav aria-label="연락처" className="grid gap-2 text-xs leading-5">
              <a
                className="break-all text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href="mailto:hochoi8621@gmail.com"
              >
                hochoi8621@gmail.com
              </a>
              <a
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href="https://blog.hozorica.com"
              >
                blog.hozorica.com
              </a>
              <a
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href="https://github.com/choihooo"
              >
                github.com/choihooo
              </a>
            </nav>
          </div>
          <div className="pt-1">
            <p className="text-sm font-semibold text-primary">{profile.role}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {profile.name}
            </h1>
            <div className="mt-6 max-w-3xl space-y-1 text-base leading-7 text-muted-foreground">
              {profile.introduction.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mt-16 sm:mt-24">
        <SectionHeading>Work Experience</SectionHeading>
        <div className="space-y-14">
          {workExperiences.map((experience) => (
            <article key={experience.company}>
              <header className="mb-2 grid gap-y-1 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-x-6">
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {experience.company}{" "}
                  <span className="text-muted-foreground">· {experience.role}</span>
                </h3>
                <time className="text-sm text-muted-foreground">{experience.period}</time>
                <p className="text-sm leading-6 text-muted-foreground sm:col-span-2">
                  {experience.description}
                </p>
              </header>
              <div>
                {experience.achievements.map((achievement) => (
                  <AchievementCard key={achievement.title} achievement={achievement} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-16 sm:mt-24">
        <SectionHeading>Side Projects</SectionHeading>
        <div className="space-y-12">
          {sideProjects.map((project) => (
            <article key={project.name}>
              <header className="mb-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{project.meta}</p>
                </div>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>
              </header>
              <div>
                {project.achievements.map((achievement) => (
                  <AchievementCard key={achievement.title} achievement={achievement} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mt-16 sm:mt-24">
        <SectionHeading>Other Experience</SectionHeading>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2 print:grid-cols-2">
          <article>
            <h3 className="mb-5 text-lg font-semibold">Activities</h3>
            <CompactList items={activities} />
          </article>
          <article>
            <h3 className="mb-5 text-lg font-semibold">Awards</h3>
            <CompactList items={awards} />
          </article>
        </div>
      </section>
      <section className="mt-16 grid gap-x-12 gap-y-10 border-t border-border pt-10 lg:grid-cols-2 print:grid-cols-2">
        <article>
          <h3 className="mb-5 text-lg font-semibold">Skills</h3>
          <div className="space-y-5">
            {skillGroups.map(([label, skills]) => (
              <div key={label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {label}
                </p>
                <TechChips items={skills} />
              </div>
            ))}
          </div>
        </article>
        <div className="grid gap-5">
          <article>
            <h3 className="mb-5 text-lg font-semibold">Education</h3>
            <CompactList
              items={[
                ["한국공학대학교", "2024.03 ~ 2026.02 · 컴퓨터공학부 소프트웨어전공"],
                ["공주대학교", "2020.03 ~ 2024.02 · 컴퓨터공학부 컴퓨터공학전공"],
              ]}
            />
          </article>
          <article className="border-t border-border pt-5">
            <h3 className="mb-5 text-lg font-semibold">Certification</h3>
            <CompactList
              items={[
                ["ADsP", "2026.06.05"],
                ["SQLD", "2025.06.27"],
              ]}
            />
          </article>
        </div>
      </section>
    </main>
  );
}
