import Link from "next/link";
import type { CSSProperties } from "react";

import { projects } from "./project-data";

const PROJECT_CARD_ASSETS: Partial<
  Record<
    string,
    {
      primary: string;
      primaryMode?: "visual" | "logo";
      secondary: string;
      background?: string;
      foreground?: string;
    }
  >
> = {
  still: {
    primary: "/projects/still/card.jpg",
    primaryMode: "visual",
    secondary: "/projects/still/mobile.jpg",
  },
  afterimage: {
    primary: "/projects/afterimage/card.jpg",
    primaryMode: "visual",
    secondary: "/projects/afterimage/mobile.jpg",
  },
  "ai-workflow": {
    primary: "/projects/ai-workflow/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/ai-workflow/card-secondary-v2.jpg",
  },
  "nexacro-react-poc": {
    primary: "/projects/nexacro-react-poc/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/nexacro-react-poc/card-secondary-v2.jpg",
  },
  "forensic-agent": {
    primary: "/projects/forensic-agent/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/forensic-agent/card-secondary-v2.jpg",
  },
  "api-data-transition": {
    primary: "/projects/api-data-transition/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/api-data-transition/card-secondary-v2.jpg",
  },
  "i18n-validation": {
    primary: "/projects/i18n-validation/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/i18n-validation/card-secondary-v2.jpg",
  },
  "typescript-migration": {
    primary: "/projects/typescript-migration/card-primary-v2.jpg",
    primaryMode: "visual",
    secondary: "/projects/typescript-migration/card-secondary-v2.jpg",
  },
  kusting: {
    primary: "/projects/kusting/symbol.svg",
    primaryMode: "logo",
    background: "var(--background)",
    foreground: "#0066ff",
    secondary: "/projects/kusting/curation.png",
  },
  comma: {
    primary: "/projects/comma/brand-symbol.png",
    primaryMode: "logo",
    background: "var(--background)",
    foreground: "var(--foreground)",
    secondary: "/projects/comma/rest.png",
  },
  geobugirin: {
    primary: "/projects/geobugirin/symbol.svg",
    primaryMode: "logo",
    background: "var(--background)",
    foreground: "var(--foreground)",
    secondary: "/projects/geobugirin/onboarding.png",
  },
};

function getFeedImage(slug: string) {
  const assets = PROJECT_CARD_ASSETS[slug];
  if (!assets) return "/brand/no-thumbnail.webp";
  return assets.primaryMode ? assets.primary : assets.secondary;
}

function getFeedLabel(project: (typeof projects)[number]) {
  return project.organization === "개인 프로젝트" ? "Personal" : project.organization;
}

function ProjectGrid() {
  return (
    <section aria-label="프로젝트 피드" className="work-feed__grid">
      {projects.map((project, index) => {
        const assets = PROJECT_CARD_ASSETS[project.slug];
        const isLogo = assets?.primaryMode === "logo";
        return (
          <div className="work-feed__item scroll-mt-6" id={project.slug} key={project.slug}>
            <Link
              className="work-feed__tile"
              href={`/projects/${project.slug}`}
              prefetch={false}
              style={
                {
                  "--feed-index": index,
                  "--feed-brand-background": assets?.background,
                  "--feed-brand-foreground": assets?.foreground,
                } as CSSProperties
              }
            >
              {isLogo ? (
                <span className="work-feed__brand">
                  {project.slug === "comma" ? (
                    <span
                      aria-label="Comma 서비스 로고"
                      role="img"
                      className="work-feed__brand-logo work-feed__brand-logo--mask"
                      style={{ maskImage: `url(${getFeedImage(project.slug)})` }}
                    />
                  ) : (
                    <img
                      alt={`${project.name} 서비스 로고`}
                      className="work-feed__brand-logo"
                      decoding="async"
                      height="76"
                      loading="lazy"
                      src={getFeedImage(project.slug)}
                      width="76"
                    />
                  )}
                  <span className="work-feed__brand-name">{project.name}</span>
                </span>
              ) : (
                <img
                  alt={`${project.name} 프로젝트 미리보기`}
                  className="work-feed__tile-image"
                  decoding="async"
                  height="640"
                  loading={index < 3 ? "eager" : "lazy"}
                  src={getFeedImage(project.slug)}
                  width="640"
                />
              )}
              <span className="work-feed__tile-overlay">
                <span className="work-feed__tile-title">{project.name}</span>
                <span className="work-feed__tile-meta">
                  {getFeedLabel(project)} · {project.role}
                </span>
              </span>
            </Link>
          </div>
        );
      })}
    </section>
  );
}

export function ProjectsPage() {
  return (
    <main className="work-feed" aria-label="프로젝트 작업물">
      <Link className="mb-6 inline-flex text-sm text-muted-foreground hover:text-primary" href="/">
        ← 홈
      </Link>
      <header className="work-feed__profile">
        <div className="work-feed__avatar-wrap">
          <img
            alt="최호 프로필"
            className="work-feed__avatar"
            height="128"
            src="/resume/profile.png"
            width="128"
          />
        </div>

        <div className="work-feed__profile-content">
          <div className="work-feed__identity">
            <div>
              <p className="work-feed__eyebrow">WORK / HOZORICA</p>
              <h1>최호</h1>
              <p className="work-feed__handle">@hozorica</p>
            </div>
            <Link className="work-feed__profile-link" href="/resume">
              프로필 보기
            </Link>
          </div>

          <dl className="work-feed__stats">
            <div>
              <dt>작업물</dt>
              <dd>{projects.length}</dd>
            </div>
            <div>
              <dt>분야</dt>
              <dd>FE</dd>
            </div>
          </dl>

          <p className="work-feed__bio">
            복잡한 문제를 구조화하고, 오래 쓰이는 인터페이스를 만드는 프론트엔드 개발자입니다.
            <br />
            제품의 맥락과 사용자의 흐름을 함께 설계합니다.
          </p>
        </div>
      </header>

      <ProjectGrid />
    </main>
  );
}
