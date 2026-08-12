"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { projects } from "./project-data";

const SCROLL_LOCK_MS = 850;
const ORBIT_STEP = 20;

export function ProjectsPage() {
  const activeIndexRef = useRef(0);
  const scrollLockedRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);
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

    const move = (direction: 1 | -1) => {
      if (scrollLockedRef.current) return;
      const nextIndex = Math.max(
        0,
        Math.min(projects.length - 1, activeIndexRef.current + direction),
      );
      if (nextIndex === activeIndexRef.current) return;

      scrollLockedRef.current = true;
      goToProject(nextIndex);
      lockTimer = setTimeout(() => {
        scrollLockedRef.current = false;
      }, SCROLL_LOCK_MS);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < 6) return;
      event.preventDefault();
      move(event.deltaY > 0 ? 1 : -1);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const start = touchStartRef.current;
      const end = event.changedTouches[0]?.clientY;
      touchStartRef.current = null;
      if (start == null || end == null || Math.abs(start - end) < 45) return;
      move(start > end ? 1 : -1);
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
      data-ready={orbitReady ? "true" : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h1 className="sr-only">Projects</h1>

      <div aria-hidden="true" className="project-orbit" style={orbitStyle}>
        {projects.map((project, index) => (
          <div
            className="project-orbit__holder"
            data-active={activeIndex === index ? "true" : undefined}
            key={project.slug}
            style={{ "--item-angle": `${index * ORBIT_STEP}deg` } as CSSProperties}
          >
            <div className="project-orbit__card project-orbit__card--primary">
              <span>{project.index}</span>
            </div>
            <div className="project-orbit__card project-orbit__card--secondary">
              <span>{project.organization}</span>
            </div>
          </div>
        ))}
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

      <section aria-live="polite" className="project-copy-stage">
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
            <p className="project-copy__description">{project.description}</p>
            <Link
              className="project-copy__cta"
              href={`/projects/${project.slug}`}
              tabIndex={activeIndex === index && copyReady ? 0 : -1}
            >
              프로젝트 보기 <span aria-hidden="true">↗</span>
            </Link>
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
