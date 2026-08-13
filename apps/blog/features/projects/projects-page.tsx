"use client";

import { Button } from "@hozui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { projects } from "./project-data";

const SCROLL_LOCK_MS = 850;
const ORBIT_STEP = 20;

const PROJECT_CARD_ASSETS: Partial<
  Record<string, { primary: string; primaryMode?: "visual"; secondary: string }>
> = {
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
    secondary: "/projects/kusting/curation.png",
  },
  comma: {
    primary: "/projects/comma/logo.png",
    secondary: "/projects/comma/rest.png",
  },
  geobugirin: {
    primary: "/projects/geobugirin/symbol.svg",
    secondary: "/projects/geobugirin/onboarding.png",
  },
};

export function ProjectsPage() {
  const router = useRouter();
  const activeIndexRef = useRef(0);
  const scrollLockedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyReady, setCopyReady] = useState(false);
  const [orbitReady, setOrbitReady] = useState(false);

  const goToProject = (index: number) => {
    const nextIndex = Math.max(0, Math.min(projects.length - 1, index));
    if (nextIndex === activeIndexRef.current) return;
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    let lockTimer: ReturnType<typeof setTimeout> | undefined;

    const deferScrollUnlock = () => {
      clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        scrollLockedRef.current = false;
      }, SCROLL_LOCK_MS);
    };

    const move = (direction: 1 | -1) => {
      if (scrollLockedRef.current) return;
      const nextIndex = Math.max(
        0,
        Math.min(projects.length - 1, activeIndexRef.current + direction),
      );
      if (nextIndex === activeIndexRef.current) return;

      scrollLockedRef.current = true;
      goToProject(nextIndex);
      deferScrollUnlock();
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      if (document.querySelector(".hods-modal__dialog")) return;
      if (
        event.target instanceof Element &&
        event.target.closest(".hods-modal__overlay, .hods-modal__dialog")
      ) {
        return;
      }
      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(dominantDelta) < 6) return;
      event.preventDefault();

      if (scrollLockedRef.current) {
        deferScrollUnlock();
        return;
      }

      move(dominantDelta > 0 ? 1 : -1);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (document.querySelector(".hods-modal__dialog")) {
        touchStartRef.current = null;
        return;
      }
      if (
        event.target instanceof Element &&
        event.target.closest(".hods-modal__overlay, .hods-modal__dialog")
      ) {
        touchStartRef.current = null;
        return;
      }
      const touch = event.touches[0];
      touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const start = touchStartRef.current;
      const touch = event.changedTouches[0];
      touchStartRef.current = null;
      if (!start || !touch) return;

      const deltaX = start.x - touch.clientX;
      const deltaY = start.y - touch.clientY;
      const dominantDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      if (Math.abs(dominantDelta) < 45) return;
      move(dominantDelta > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      clearTimeout(lockTimer);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    setCopyReady(false);
    const copyTimer = window.setTimeout(() => setCopyReady(true), 1980);
    return () => window.clearTimeout(copyTimer);
  }, [activeIndex]);

  useEffect(() => {
    const restoreFromHash = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      const restoredIndex = projects.findIndex((project) => project.slug === slug);
      if (restoredIndex >= 0) {
        activeIndexRef.current = restoredIndex;
        setActiveIndex(restoredIndex);
      }
    };

    restoreFromHash();
    window.addEventListener("hashchange", restoreFromHash);

    const readyFrame = window.requestAnimationFrame(() => setOrbitReady(true));
    return () => {
      window.cancelAnimationFrame(readyFrame);
      window.removeEventListener("hashchange", restoreFromHash);
    };
  }, []);

  useEffect(() => {
    if (!orbitReady) return;
    window.history.replaceState(null, "", `/projects#${projects[activeIndex]!.slug}`);
  }, [activeIndex, orbitReady]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target instanceof HTMLElement && event.target.closest("a, button")) return;
    if (["ArrowDown", "PageDown"].includes(event.key)) {
      event.preventDefault();
      goToProject(activeIndexRef.current + 1);
    }
    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      goToProject(activeIndexRef.current - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      goToProject(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goToProject(projects.length - 1);
    }
  };

  const orbitStyle = {
    "--orbit-rotation": `${activeIndex * -ORBIT_STEP}deg`,
  } as CSSProperties;
  const activeProject = projects[activeIndex]!;

  return (
    <main
      aria-label="프로젝트"
      className="project-showcase"
      data-project={activeProject.slug}
      data-ready={orbitReady ? "true" : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1 className="sr-only">Projects</h1>

      <div aria-hidden="true" className="project-orbit" style={orbitStyle}>
        {projects.map((project, index) => {
          const cardAssets = PROJECT_CARD_ASSETS[project.slug];

          return (
            <div
              className="project-orbit__holder"
              data-active={activeIndex === index ? "true" : undefined}
              data-project={project.slug}
              key={project.slug}
              style={{ "--item-angle": `${index * ORBIT_STEP}deg` } as CSSProperties}
            >
              <div className="project-orbit__card project-orbit__card--primary">
                {cardAssets ? (
                  // Native image tags keep these repository assets independent from Next image transforms.
                  <img
                    alt=""
                    className={`project-orbit__image project-orbit__image--${cardAssets.primaryMode ?? "logo"}`}
                    decoding="async"
                    src={cardAssets.primary}
                  />
                ) : (
                  <span>{project.index}</span>
                )}
              </div>
              <div className="project-orbit__card project-orbit__card--secondary">
                {cardAssets ? (
                  <img
                    alt=""
                    className="project-orbit__image project-orbit__image--visual"
                    decoding="async"
                    src={cardAssets.secondary}
                  />
                ) : (
                  <span>{project.organization}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <nav aria-label="프로젝트 빠른 이동" className="project-showcase__rail">
        <span aria-live="polite" className="project-showcase__count">
          {String(activeIndex + 1).padStart(2, "0")}
          <span aria-hidden="true"> / </span>
          <span className="sr-only">번째 프로젝트, 전체 </span>
          {String(projects.length).padStart(2, "0")}
        </span>
        <div className="project-showcase__dots">
          {projects.map((project, index) => (
            <button
              aria-current={activeIndex === index ? "true" : undefined}
              aria-label={`${project.name}으로 이동`}
              className="project-showcase__dot"
              key={project.slug}
              onClick={() => goToProject(index)}
              type="button"
            />
          ))}
        </div>
      </nav>

      <div className="project-showcase__topline" aria-hidden="true">
        <p>Selected work</p>
        <p>Scroll to rotate</p>
      </div>

      <section
        aria-live="polite"
        className="project-copy-stage"
        data-visible={copyReady ? "true" : undefined}
      >
        {projects.map((project, index) => (
          <article
            aria-hidden={activeIndex !== index || !copyReady}
            className="project-copy"
            data-active={activeIndex === index ? "true" : undefined}
            data-visible={activeIndex === index && copyReady ? "true" : undefined}
            key={project.slug}
          >
            <p className="project-copy__meta">{project.period} · {project.role}</p>
            <Link
              className="project-copy__title"
              href={`/projects/${project.slug}`}
              tabIndex={activeIndex === index && copyReady ? 0 : -1}
            >
              {project.name}
            </Link>
            <Button
              className="project-copy__cta"
              label="프로젝트 보기"
              onClick={() => router.push(`/projects/${project.slug}`)}
              size="md"
              tabIndex={activeIndex === index && copyReady ? 0 : -1}
              trailingIcon={
                <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
                  <path d="M6 14 14 6m-6 0h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                </svg>
              }
              type="button"
              variant="primary"
            />
          </article>
        ))}
      </section>

      <footer className="project-showcase__footer" data-visible={copyReady ? "true" : undefined}>
        <ul aria-label={`${activeProject.name} 사용 기술`} className="project-showcase__tech">
          {activeProject.technologies.slice(0, 5).map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <p aria-hidden="true">Scroll <span>↓</span></p>
      </footer>
    </main>
  );
}
