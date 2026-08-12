"use client";

import { Chip, ChipGroup } from "@hozui/react";
import Image from "next/image";

type Achievement = {
  title: string;
  period: string;
  context: string;
  details: readonly string[];
  technologies: readonly string[];
  result?: string;
  thumbnail?: {
    alt: string;
    src: string;
  };
};

const workExperiences = [
  {
    company: "야근몬스터",
    role: "Frontend Engineer",
    period: "2026.03 ~ 2026.05 · 계약직",
    description:
      "AI 오케스트레이션 솔루션 조직에서 포렌식 에이전트 데스크톱 앱, 사내 UI Kit, agent workflow 도구의 프론트엔드 구조와 검증 UI를 구현했습니다.",
    achievements: [
      {
        title: "검색 결과 검증을 위한 Evidence UI 설계·구현",
        period: "2026.05",
        technologies: ["TypeScript", "Electron", "Qdrant"],
        context:
          "score 중심 결과만으로는 신뢰도 판단 근거가 부족해 실제 search hit 기반 출처와 근거를 먼저 확인하는 UI로 개선했습니다.",
        details: [
          "문서·이미지·오디오·영상 hit를 공통 Result 모델로 정규화했습니다.",
          "file metadata, snippet, STT segment를 Evidence 필드로 매핑했습니다.",
          "검증된 search payload만 renderer에 전달하도록 preload bridge 기준을 정리했습니다.",
        ],
      },
      {
        title: "React UI Kit과 component showcase 정리",
        period: "2026.03 ~ 2026.05",
        technologies: ["React", "i18n", "UI Kit"],
        context:
          "신규 수주와 PoC마다 반복되던 유사 UI 구현 및 다국어 처리 기준을 공통 구조로 정리했습니다.",
        details: [
          "props table, code example, state preview를 한곳에서 확인할 수 있게 했습니다.",
          "hardcoded text를 번역 key 기반으로 전환하고 locale prefix routing 기준을 맞췄습니다.",
        ],
      },
      {
        title: "절대좌표 기반 레거시 화면의 React 전환 기준 수립",
        period: "2026.03 ~ 2026.04",
        technologies: ["React", "Nexacro", "Playwright"],
        context:
          "반응형 기준이 없는 Nexacro absolute 화면을 React로 전환하기 위한 화면 단위 명세와 검증 기준을 만들었습니다.",
        details: [
          "layout, interaction, data state 기준을 분리해 동일 viewport에서 원본과 전환 화면을 비교했습니다.",
          "Playwright MCP 비교 검증으로 사용성과 재현도를 확인했습니다.",
        ],
      },
    ],
  },
  {
    company: "아이겐 코리아",
    role: "Frontend Engineer",
    period: "2025.03 ~ 2025.06 · 인턴",
    description:
      "AI·빅데이터 기반 고객사 어드민에서 API 기반 화면 구조, i18n 검증 자동화, TypeScript migration을 담당했습니다.",
    achievements: [
      {
        title: "API 응답 기반 센터 관리 화면 구조 개선",
        period: "2025.03 ~ 2025.04",
        technologies: ["React", "Recoil", "API"],
        context:
          "신규 센터 추가마다 코드 수정과 재배포가 필요했던 구조를 API 응답 기반 렌더링으로 전환했습니다.",
        details: [
          "센터별 하드코딩 분기를 제거해 운영 변경 시 수정 범위를 줄였습니다.",
          "Recoil selector와 LocalStorage cache로 조회·캐싱·반영 흐름을 분리했습니다.",
        ],
      },
      {
        title: "i18n 검증 자동화와 TypeScript migration",
        period: "2025.04 ~ 2025.06",
        technologies: ["TypeScript", "i18n", "AWS CI"],
        context: "런타임에서 노출되던 i18n 누락 key 문제를 배포 전 검증 단계로 이동했습니다.",
        details: [
          "배포 전 누락 key를 탐지해 번역 key가 UI에 노출되는 문제를 줄였습니다.",
          "TypeScript 3.9.5에서 5.8.3으로 단계적 migration을 진행했습니다.",
        ],
        result: "CI build log 기준 평균 빌드 시간 19% 단축",
      },
    ],
  },
] as const;

const sideProjects = [
  {
    name: "Kusting",
    meta: "운영 플랫폼 · 블로그 글쓰기 스터디",
    description:
      "글 제출, 일정 조율, 추천, 알림을 통합한 스터디 운영 플랫폼입니다. 개인화 추천과 운영 자동화 경험에 집중했습니다.",
    achievements: [
      {
        title: "embedding 기반 맞춤 추천과 추천 이유 UI 구현",
        period: "2026.04",
        technologies: ["Embedding", "pgvector", "OpenAI"],
        context:
          "태그 기반 추천의 개인화 한계를 개선하기 위해 사용자·큐레이션·게시글 embedding을 연결했습니다.",
        details: [
          "사용자 관심사와 게시글·큐레이션 데이터를 embedding pipeline으로 연결했습니다.",
          "추천 이유 UI를 함께 노출해 사용자가 추천 근거를 확인할 수 있게 했습니다.",
        ],
        result: "동일 노출 위치 기준 큐레이션 탭 CTR 약 15% 향상",
      },
      {
        title: "날짜 투표와 PWA push를 연결한 일정 참여 흐름 개선",
        period: "2026.02",
        technologies: ["Next.js", "Firebase", "PWA"],
        context: "일정 조율과 참여 알림이 분리되어 확정 일정을 놓치기 쉬운 문제를 개선했습니다.",
        details: ["Firebase Messaging 기반 PWA push로 일정 확정과 참여 알림을 제공했습니다."],
      },
    ],
  },
  {
    name: "거부기린",
    meta: "자세 교정 서비스 · 창업대회 검증",
    description:
      "웹캠 기반 자세 측정을 데스크톱에서 제공하는 자세 교정 서비스입니다. pose scoring, Tauri 배포, 상태별 피드백 UI를 구현했습니다.",
    achievements: [
      {
        title: "Tauri 데스크톱 앱 릴리스 파이프라인 정리",
        period: "2026.04 ~ 현재",
        technologies: ["Tauri", "Turborepo", "CI"],
        context:
          "컴퓨터비전 기반 데스크톱 제품을 실제 배포 가능한 형태로 운영하기 위한 검증 흐름을 정리했습니다.",
        details: [
          "signing, notarization, updater artifact, R2 upload, sidecar를 release 체크리스트로 정리했습니다.",
          "빌드 산출물과 업데이트 경로를 명시해 릴리스 실패 가능성을 낮췄습니다.",
        ],
      },
      {
        title: "웹캠 기반 자세 측정 엔진의 실행 구조 개선",
        period: "2026.04 ~ 현재",
        technologies: ["Webcam", "Pose", "Engine"],
        context:
          "pose landmark 기반 실시간 자세 판단 흐름을 안정적으로 실행하기 위한 상태 구조를 만들었습니다.",
        details: [
          "목, 어깨, 상체 landmark 기준 posture score와 상태별 피드백 기준을 구성했습니다.",
          "loading, camera unavailable, detecting, warning, normal 상태별 UI를 제공했습니다.",
        ],
      },
    ],
  },
] as const;

const activities = [
  [
    "한국대학생IT경영학회 24·30·32기 학회원, 31기 운영진",
    "2022.09 ~ 2025.12 · 프론트엔드 개발 및 프로젝트 기획·운영",
  ],
  ["CMC 19기 프론트엔드 개발자", "Turborepo 기반 React 웹앱, Expo WebView, 디자인 시스템 개발"],
  ["오픈소스 컨트리뷰션 아카데미 멘티", "Chromium 오픈소스 기여"],
  ["유데미 러닝크루 2기 리더", "2025.03 ~ 2025.04 · 학습 커뮤니티 운영"],
] as const;

const awards = [
  ["SUMTECH HACKATHON 2025 장려상", "2025.10.31 · Dream Track AI 진로 설계 서비스"],
  ["직행 기업 프로젝트 우수상", "2025.09.25 · 온보딩·추천 공고·메모 기능"],
  ["KT&G 상상유니브 아이디어톤 대상", "2024.12.14 · Siren Path 기술 PoC와 UX 플로우"],
] as const;

const skillGroups = [
  ["Core", ["Next.js", "React", "TypeScript", "TanStack Query", "Zustand"]],
  ["App / Platform", ["React Native", "Electron", "Tauri", "Expo"]],
  ["Testing / Architecture", ["Jest", "Vitest", "Storybook", "Monorepo"]],
  ["DevOps / Tooling", ["GitHub Actions", "Docker", "Figma"]],
] as const;

function SectionHeading({ children, eyebrow }: { children: string; eyebrow: string }) {
  return (
    <header className="mb-7 border-b border-border pb-4 sm:mb-9">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{children}</h2>
    </header>
  );
}

function TechChips({ items }: { items: readonly string[] }) {
  return (
    <ChipGroup className="flex flex-wrap gap-1.5" aria-label="사용 기술">
      {items.map((item) => (
        <Chip key={item} label={item} size="sm" tone="accent" />
      ))}
    </ChipGroup>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <article className="border-b border-border py-7 first:pt-0 last:border-b-0 last:pb-0">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h4 className="text-base font-semibold leading-6">{achievement.title}</h4>
          <TechChips items={achievement.technologies} />
        </div>
        <time className="shrink-0 text-xs leading-5 text-muted-foreground">
          {achievement.period}
        </time>
      </div>
      <div
        className={
          achievement.thumbnail ? "mt-5 grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]" : "mt-4"
        }
      >
        {achievement.thumbnail ? (
          <Image
            alt={achievement.thumbnail.alt}
            className="aspect-video w-full rounded-lg border border-border object-cover"
            height={720}
            src={achievement.thumbnail.src}
            width={1280}
          />
        ) : null}
        <div>
          <p className="text-sm leading-6 text-muted-foreground">{achievement.context}</p>
          <ul className="mt-3 space-y-1.5 pl-4 text-sm leading-6 text-muted-foreground">
            {achievement.details.map((detail) => (
              <li key={detail} className="list-disc pl-1 marker:text-primary">
                {detail}
              </li>
            ))}
          </ul>
          {achievement.result ? (
            <p className="mt-4 text-sm font-semibold leading-6 text-primary">
              <span aria-hidden="true">→ </span>
              {achievement.result}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CompactList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="divide-y divide-border">
      {items.map(([title, description]) => (
        <div key={title} className="py-4 first:pt-0 last:pb-0">
          <p className="text-sm font-semibold leading-6">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );
}

export function ResumePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16">
      <section className="border-b border-border pb-10 sm:pb-12">
        <header className="mb-7 border-b border-border pb-3">
          <p className="text-sm font-semibold">Introduce.</p>
        </header>
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
            <p className="text-sm font-semibold text-primary">Frontend Engineer</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">최호</h1>
            <div className="mt-6 max-w-3xl space-y-3 text-base leading-7 text-muted-foreground">
              <p>
                AI·데이터 기반 제품에서 검증 가능한 UI와 운영 가능한 프론트엔드 구조를 만듭니다.
              </p>
              <p>
                React와 TypeScript를 중심으로 검색 결과 검증 UI, i18n 자동화, 레거시 마이그레이션,
                추천 UX를 구현했습니다.
              </p>
              <p>제품 지표와 개발 생산성을 함께 개선하는 Product Engineer로 성장하고 있습니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-24">
        <SectionHeading eyebrow="Experience">Work Experience</SectionHeading>
        <div className="space-y-14">
          {workExperiences.map((experience) => (
            <article key={experience.company}>
              <header className="mb-2 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-6">
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
        <SectionHeading eyebrow="Selected Work">Side Projects</SectionHeading>
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
        <SectionHeading eyebrow="Background">Other Experience</SectionHeading>
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
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

      <section className="mt-16 grid gap-x-12 gap-y-10 border-t border-border pt-10 lg:grid-cols-[1.25fr_1fr]">
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
