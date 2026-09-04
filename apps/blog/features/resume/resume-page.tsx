"use client";

import { Chip, ChipGroup } from "@hozui/react";
import Image from "next/image";

type Achievement = {
  title: string;
  period?: string;
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
      "AI 오케스트레이션 솔루션 조직에서 포렌식 에이전트 데스크톱 앱, 사내 UI Kit, agent workflow 도구의 프론트엔드 구조 및 검증 UI 구현",
    achievements: [
      {
        title: "AI 프론트엔드 수정 워크플로 개선",
        period: "2026.03 ~ 2026.05",
        technologies: ["Playwright", "Codex", "Claude"],
        context:
          "스크린샷 기반 AI 수정 시 DOM 식별 실패로 재지시가 반복되고, 독립 작업의 순차 실행으로 처리 시간과 비용이 누적되는 문제 분석",
        details: [
          "Playwright CLI로 DOM·HTML 정보를 제공해 수정 대상과 관련 코드를 연결하는 입력 구조 설계·구현",
          "카드 의존성 분리 및 독립 작업 병렬화, Codex·Claude에서 재사용 가능한 워크플로로 공통화",
        ],
        result: "처리 시간 중앙값 31.6% 단축 및 카드별 AI 비용 중앙값 35.4% 절감",
      },
      {
        title: "AI 기반 명세 자동화로 Nexacro 화면 유형 5종 전환 검증",
        period: "2026.03 ~ 2026.04",
        technologies: ["React", "Nexacro", "Playwright"],
        context:
          "컴포넌트·좌표·이벤트·데이터 필드를 React 구현 명세로 전환하는 절차가 없어 정보 누락과 전환 품질을 검증하기 어려운 문제 개선",
        details: [
          "Nexacro→React 마이그레이션 PoC의 원본 분석, 명세화, 구현 및 검증 워크플로 설계",
          "Playwright CLI로 원본 화면 정보를 추출해 AI 입력용 Markdown 명세로 구조화",
          "GitHub Spec Kit을 참고해 화면 구조, 기능 요구사항, AC, 고객사 코드 제약조건을 분리하고 명세에 반영",
          "고객사와 태블릿 핵심 정보 및 하위 화면 이동 기준 조율, 스크린샷 비교와 기능별 AC로 화면 유형 5종 검증",
        ],
        result:
          "UI 원천 데이터 수동 추출 100% 제거, 주요 화면 유형 5종 중 5종 전환 검증 및 명세 추출 성공률 100% 달성",
      },
      {
        title: "AI 검색 결과의 원본 검증을 위한 Evidence UI 설계·구현",
        period: "2026.05",
        technologies: ["TypeScript", "Electron", "Qdrant"],
        context:
          "기존 UI가 파일명과 관련도 score만 제공해 연구진이 검색 결과와 실제 증거의 일치 여부를 판단하기 어려운 문제 개선",
        details: [
          "AI 포렌식 데스크톱 프로젝트의 검색 결과 및 원본 검증 UI 설계·구현",
          "XAI·HCI 선행 연구 5편 검토, AI 결과→핵심 근거→원본 데이터 순서의 검증 정보 구조 설계",
          "문서 본문 일치 문장, 이미지 OCR 텍스트, 음성·영상 STT 발화 구간 제공 및 공통 파일 메타데이터 연결",
          "STT 세그먼트에 시작·종료 시각 포함, 선택 시 원본 미디어의 해당 타임스탬프로 이동하도록 구현",
        ],
        result:
          "문서·이미지·음성·영상 4종 모두 Evidence UI 적용, 음성·영상 2종의 탐색 범위를 전체 파일에서 관련 발화 구간으로 축소",
      },
    ],
  },
  {
    company: "아이겐 코리아",
    role: "Frontend Engineer",
    period: "2025.03 ~ 2025.06 · 인턴",
    description:
      "AI·빅데이터 기반 고객사 어드민의 API 기반 화면 구조, i18n 검증 자동화, TypeScript migration 담당",
    achievements: [
      {
        title: "API 기반 데이터 전환으로 운영 변경 절차 50% 축소",
        period: "2025.03 ~ 2025.04",
        technologies: ["React", "Recoil", "API"],
        context:
          "백엔드에 추가한 센터·클라이언트가 운영 화면에 반영되지 않는 문제의 원인 분석 및 프론트엔드 데이터 구조 전환",
        details: [
          "프론트엔드와 백엔드에서 동일한 enum을 각각 관리해 수정 누락 시 API와 운영 화면의 데이터가 불일치하는 원인 확인",
          "프론트엔드의 하드코딩 enum 제거, 백엔드 API 응답을 단일 데이터 기준으로 사용하도록 구조 변경",
          "로그인 시 센터 목록을 LocalStorage에 저장하고 화면별 가공 데이터는 기존 Recoil selector로 파생해 변경 범위 최소화",
          "백엔드 개발자와 프론트 수정·재배포 없이 신규 센터가 운영 화면에 반영되는지 검증",
        ],
        result: "추가 절차 4단계 → 2단계, 데이터 관리 지점 2곳 → 1곳, 프론트 수정·재배포 1회 → 0회",
      },
      {
        title: "i18n 검증 자동화로 노출 키 63건 제거",
        period: "2025.04 ~ 2025.06",
        technologies: ["TypeScript", "i18n", "AWS CI"],
        context:
          "수동 검증으로 한·중·일·영 리소스 누락을 배포 전에 차단하지 못해 사용자 화면에 i18n 키 63건이 노출되는 문제 개선",
        details: [
          "다국어 리소스 자동 검증 도입 제안, 오류 분석부터 스크립트 구현·CI 적용까지 전 과정 담당",
          "한국어 JSON을 기준으로 중첩 키 경로를 평탄화하고 언어별 누락·불일치 키를 자동 검출하는 스크립트 구현",
          "AWS CodePipeline pre_build 단계에서 누락 발견 시 배포를 차단하도록 개발팀 공통 CI 절차에 적용",
        ],
        result: "i18n 키 노출 63건 → 0건, 키별 검증 시간 20~30초 → 1초 이내로 단축",
      },
      {
        title: "TypeScript 마이그레이션으로 프로덕션 빌드 시간 19% 단축",
        period: "2025.04 ~ 2025.06",
        technologies: ["TypeScript", "React", "Migration"],
        context:
          "프로덕션 빌드에 평균 246.22초가 소요되고, any 타입으로 인해 잘못된 데이터가 실행 단계에서 발견되는 문제 개선",
        details: [
          "TypeScript 3.9.5→5.8.3 전환 후 컴파일러가 표시한 진단 500여 건을 공통 타입→API 응답→기능별 사용 코드 순으로 정리",
          "그래프 API 응답을 실제 데이터 구조에 맞는 인터페이스로 재정의하고 숫자 입력을 number로 제한해 any를 통한 타입 검사 우회 제거",
          "동일 조건에서 마이그레이션 전후의 프로덕션 빌드 시간과 7일간 런타임 오류 비교·검증",
        ],
        result:
          "평균 프로덕션 빌드 시간 246.22초 → 199.51초로 19% 단축, 런타임 오류 27건 → 10건으로 63% 감소",
      },
    ],
  },
] as const;

const sideProjects = [
  {
    name: "Kusting",
    meta: "운영 플랫폼 · 블로그 글쓰기 스터디",
    description:
      "글 제출, 일정 조율, 추천, 알림을 통합한 스터디 운영 플랫폼 · 개인화 추천 및 운영 자동화",
    achievements: [
      {
        title: "임베딩 기반 의미 추천으로 콘텐츠 CTR 15% 향상",
        period: "2026.04",
        technologies: ["Embedding", "PostgreSQL", "pgvector"],
        context:
          "태그가 다르지만 의미가 유사한 콘텐츠를 연결하지 못하는 기존 태그 추천의 한계 개선",
        details: [
          "내·외부 콘텐츠 임베딩 및 pgvector HNSW 검색 적용을 통한 의미 기반 큐레이션 구현",
          "사용자 관심사와 게시글·큐레이션 데이터 연결, 추천 이유 UI를 통한 추천 근거 제공",
          "동일 노출 위치에서 기존 태그 추천과 의미 기반 추천의 CTR 비교·검증",
        ],
        result: "동일 노출 위치 기준 기존 태그 추천 대비 콘텐츠 CTR 15% 향상",
      },
      {
        title: "콘텐츠 자동 수집으로 게시글 등록 누락 100% 제거",
        period: "2026.02",
        technologies: ["Crawling", "PWA", "Firebase"],
        context:
          "글 작성 후 Notion에 URL과 태그를 직접 등록하는 과정에서 일주일간 게시글 9건이 누락되고, 사용자가 직접 방문해야 새 글을 확인할 수 있는 문제 개선",
        details: [
          "큐스팅 운영자이자 프론트엔드 개발자로서 콘텐츠 누락·전달·탐색 문제 정의부터 기능 설계·구현까지 담당",
          "스터디원 블로그의 신규 글을 자동 수집·등록하는 크롤링 흐름 구축, 실제 작성 글과 등록 데이터를 일주일 단위로 대조",
          "PWA와 Firebase 푸시 알림 연결, 새 콘텐츠를 사용자에게 능동적으로 전달하는 운영 구조로 전환",
        ],
        result:
          "게시글 누락 9건 → 0건, 글 1건당 수동 등록 시간 약 38초 → 0초, 게시글당 평균 조회수 21회 달성",
      },
    ],
  },
  {
    name: "Comma",
    meta: "2026.06 ~ 2026.08 · 휴식 추천 서비스",
    description:
      "체크리스트 결과 기반 휴식 콘텐츠 추천 모바일 서비스 · React 웹 화면 및 React Native Bridge 연동 담당",
    achievements: [
      {
        title: "데이터 로딩 구조 개선으로 핵심 콘텐츠 표시 시간 41.1% 단축",
        period: "2026.06 ~ 2026.08",
        technologies: ["React", "React Query", "React Native"],
        context:
          "화면 FCP는 307.2ms였지만 진입 후 데이터 요청을 시작해 핵심 질문 표시에 2,333.2ms가 걸리는 문제 개선",
        details: [
          "React 웹 화면과 React Native Bridge 연동 및 체크리스트 데이터 로딩 구조 개선 담당",
          "FCP와 핵심 질문 표시 시점을 분리 측정해 초기 렌더링이 아닌 데이터 준비 구간을 병목으로 특정",
          "질문 데이터의 요청·로딩 상태를 React Query 기반으로 전환, 이전 화면에서 prefetch해 진입 전 캐시에 저장",
          "LTE 유사 환경에서 개선 전후의 핵심 질문 표시 시점을 동일 조건으로 비교·검증",
        ],
        result: "질문 표시 시간 2,333.2ms → 1,373.6ms로 41.1% 단축",
      },
    ],
  },
  {
    name: "거부기린",
    meta: "자세 교정 서비스 · 창업대회 검증",
    description:
      "웹캠 기반 데스크톱 자세 교정 서비스 · pose scoring, Tauri 배포, 상태별 피드백 UI 구현",
    achievements: [
      {
        title: "추론 파이프라인 분리로 창 상태별 결과 전달률 100% 유지",
        period: "2026.04 ~ 2026.08",
        technologies: ["Tauri", "Rust", "Python"],
        context:
          "Electron 앱을 백그라운드로 전환하거나 최소화하면 자세 추론이 느려지거나 중단되어 앱을 전면에 유지해야 하는 문제 개선",
        details: [
          "데스크톱 앱 전환, 자세 추론 파이프라인 재설계 및 창 상태별 성능 검증 담당",
          "Electron과 Tauri 실행 구조 비교, 화면과 자세 엔진의 실행 생명주기 분리를 위한 Tauri 전환",
          "React는 명령·결과 표시, Rust 네이티브 스레드는 반복 실행, Python sidecar는 카메라 캡처·MediaPipe 추론을 담당하도록 책임 분리",
          "고정 입력으로 포그라운드·백그라운드·최소화 상태를 각각 3회 교차 측정해 FPS, 추론 간격 P95, 중단 횟수 검증",
          "실시간 데모로 사용자 가치와 분석 과정을 전달해 큐시즘 밋업 프로젝트 대상 수상 및 U300 등 사업화 프로그램 선정",
        ],
        result:
          "고정 입력을 상태별 10분씩 3회 교차 측정해 결과 전달률 100% 유지, 평균 FPS 중앙값 1.41~2.22 및 최소화 시 정규화 CPU 사용률 1.19%p 감소",
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

function SectionHeading({ children }: { children: string }) {
  return (
    <header className="mb-7 border-b border-border pb-4 sm:mb-9">
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
    <article className="border-b border-border py-7 first:pt-0 last:border-b-0 last:pb-0 print:break-inside-avoid-page">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h4 className="text-base font-semibold leading-6">{achievement.title}</h4>
          <TechChips items={achievement.technologies} />
        </div>
        {achievement.period ? (
          <time className="shrink-0 text-xs leading-5 text-muted-foreground">
            {achievement.period}
          </time>
        ) : null}
      </div>
      <div
        className={
          achievement.thumbnail ? "mt-5 grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]" : "mt-2"
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
            <p className="text-sm font-semibold text-primary">Frontend Engineer</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">최호</h1>
            <div className="mt-6 max-w-3xl space-y-1 text-base leading-7 text-muted-foreground">
              <p>
                문제의 원인을 사용자 흐름과 데이터로 확인하고, 검증 가능한 프론트엔드 구조로
                개선하는 개발자 최호입니다.
              </p>
              <p>
                AI 검색 결과를 원본까지 추적할 수 있는 Evidence UI를 설계하고, i18n 검증 자동화로
                노출 오류 63건을 제거하는 등 사용자가 신뢰할 수 있는 제품과 안정적으로 운영되는
                환경을 만들어 왔습니다.
              </p>
              <p>
                또한 콘텐츠 CTR 15% 향상, 핵심 콘텐츠 표시 시간 41.1% 단축처럼 개선 결과를 실제 제품
                지표로 확인하며 개발합니다.
              </p>
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
