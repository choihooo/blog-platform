"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  FolderOpen,
  House,
  Maximize2,
  Minus,
  RotateCcw,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { projects } from "@blog-platform/core/content/catalog";
import {
  desktopProjects,
  projectPoster,
  projectPreviews,
  windowTitle,
  iconPlacements,
} from "./desktop-data";
import { ProjectWindowSummary } from "./project-window-summary";
import { useDesktopWorkspace } from "./use-desktop-workspace";
import { MainHeader } from "../../navigation/main-header";
import { resizeWindow, type ResizeEdge } from "./desktop-state";

const resizeEdges: readonly ResizeEdge[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
const resizeEdgeLabels: Record<ResizeEdge, string> = {
  n: "위쪽",
  ne: "오른쪽 위",
  e: "오른쪽",
  se: "오른쪽 아래",
  s: "아래쪽",
  sw: "왼쪽 아래",
  w: "왼쪽",
  nw: "왼쪽 위",
};
function ProjectPreview({ id, active }: { id: string; active: boolean }) {
  const media = projectPreviews[id];
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (active && visible && !document.hidden && !motion.matches) void el.play().catch(() => {});
      else el.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = !!entry && entry.intersectionRatio >= 0.1;
        update();
      },
      { threshold: [0, 0.1] },
    );
    observer.observe(el);
    update();
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", update);
    return () => {
      el.pause();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", update);
    };
  }, [active]);
  return media ? (
    <video
      ref={video}
      aria-label={`${windowTitle(id)} 시연 영상`}
      className="desktop-project-media"
      src={media.src}
      poster={media.poster}
      muted
      playsInline
      loop
      controls
      preload="metadata"
    />
  ) : (
    <img
      className="desktop-project-media"
      src={projectPoster(id)}
      alt={`${windowTitle(id)} 프로젝트 화면`}
      width={1200}
      height={750}
    />
  );
}

function ProjectList({ onOpen }: { onOpen?: (id: string) => void }) {
  return (
    <div className="desktop-project-list">
      {projects.map((project) => (
        <article key={project.slug}>
          {onOpen ? (
            <button className="desktop-list-preview" onClick={() => onOpen(project.slug)}>
              <img
                src={projectPoster(project.slug)}
                alt=""
                loading="lazy"
                width={180}
                height={120}
              />
              <span>{project.name}</span>
            </button>
          ) : (
            <Link
              className="desktop-list-preview"
              href={`/projects/${project.slug}`}
              prefetch={false}
            >
              <img
                src={projectPoster(project.slug)}
                alt=""
                loading="lazy"
                width={180}
                height={120}
              />
              <span>{project.name}</span>
            </Link>
          )}
          <p>{project.role}</p>
          <Link href={`/projects/${project.slug}`} prefetch={false}>
            자세히 보기 <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}

function WindowBody({
  id,
  active,
  onOpen,
}: {
  id: string;
  active: boolean;
  onOpen: (id: string) => void;
}) {
  if (id === "projects")
    return (
      <>
        <h2>만들어 온 작업들.</h2>
        <p className="desktop-window-intro">
          프로젝트를 열어보거나, 자세한 문제 해결 과정을 읽어보세요.
        </p>
        <ProjectList onOpen={onOpen} />
      </>
    );
  if (id === "about")
    return (
      <div className="desktop-about">
        <img src="/resume/profile.png" width={120} height={120} alt="호조리카 프로필" />
        <h2>
          안녕하세요,
          <br />
          호조리카입니다.
        </h2>
        <p>
          복잡한 문제를 구조화하고, 오래 쓰이는 인터페이스를 만드는 프론트엔드 개발자 최호입니다.
        </p>
        <p>제품의 맥락과 사용자의 흐름을 함께 설계합니다.</p>
        <Link className="desktop-detail-link" href="/resume">
          소개 더 읽기 <ArrowUpRight size={18} />
        </Link>
        <Link href="/blog">
          블로그 구경하기 <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  const project = projects.find((p) => p.slug === id);
  if (!project) return null;
  return (
    <ProjectWindowSummary project={project}>
      <ProjectPreview id={id} active={active} />
    </ProjectWindowSummary>
  );
}

export function DesktopPortfolio() {
  const {
    workspaceRef: workspace,
    windows,
    active,
    dispatch,
    open,
    close,
    minimize,
    openShortcut,
    clearPositions,
    windowPosition,
    iconPosition,
    startDrag,
    moveDrag,
    endDrag,
    cancelDrag,
    startResize,
    windowBounds,
  } = useDesktopWorkspace();
  return (
    <main className="desktop-portfolio">
      <MainHeader active="work" />
      <div
        className="desktop-space"
        ref={workspace}
        onKeyDown={(event) => {
          if (event.key === "Escape" && active) {
            event.stopPropagation();
            close(active);
          }
        }}
      >
        <h1 className="desktop-visually-hidden">호조리카 프로젝트 작업실</h1>
        <span className="desktop-wallpaper-word" aria-hidden="true">
          HOZORICA
        </span>
        <img
          className="desktop-character"
          src="/brand/scroll-story/working.png"
          alt=""
          width={1312}
          height={1199}
          draggable={false}
        />
        <div className="desktop-shortcuts" aria-label="전체 프로젝트">
          {desktopProjects.map((project, index) => {
            const point = iconPosition(project.slug, index);
            return (
              <button
                key={project.slug}
                className={`desktop-shortcut desktop-shortcut--${index}`}
                data-shortcut={project.slug}
                style={
                  {
                    left: point.x,
                    top: point.y,
                    "--desktop-file-rotation": `${iconPlacements[index % iconPlacements.length]!.rotation}deg`,
                  } as CSSProperties
                }
                aria-label={`${project.name} 프로젝트 열기`}
                title={project.name}
                onPointerDown={(e) => startDrag(e, "icon", project.slug, point)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={cancelDrag}
                onClick={() => openShortcut(project.slug)}
              >
                <span className="desktop-file">
                  <img
                    src={projectPoster(project.slug)}
                    alt=""
                    width={112}
                    height={78}
                    draggable={false}
                  />
                  <span className="desktop-file-edge" />
                </span>
                <span className="desktop-shortcut-name">{project.name}</span>
              </button>
            );
          })}
        </div>
        <button className="desktop-reset" onClick={clearPositions}>
          <RotateCcw size={13} /> 아이콘 정리
        </button>
        {windows
          .filter((w) => !w.minimized)
          .map((item) => {
            const point = windowPosition(item),
              isActive = item.id === active;
            return (
              <section
                className={`desktop-window ${item.maximized ? "is-maximized" : ""}`}
                key={item.id}
                data-window={item.id}
                data-active={isActive || undefined}
                role="dialog"
                aria-modal="false"
                aria-labelledby={`window-title-${item.id}`}
                tabIndex={-1}
                style={{
                  left: point.x,
                  top: point.y,
                  width: point.width,
                  height: point.height,
                  zIndex: 20 + windows.indexOf(item),
                }}
                onPointerDown={() => {
                  if (!isActive) dispatch({ type: "focus", id: item.id });
                }}
                onFocusCapture={() => {
                  if (!isActive) dispatch({ type: "focus", id: item.id });
                }}
              >
                <div
                  className="desktop-window-bar"
                  onPointerDown={(e) => {
                    if (!item.maximized) startDrag(e, "window", item.id, point);
                  }}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={cancelDrag}
                >
                  <div className="desktop-window-controls">
                    <button
                      className="window-close"
                      aria-label={`${windowTitle(item.id)} 닫기`}
                      onClick={() => close(item.id)}
                    >
                      <X size={12} />
                    </button>
                    <button
                      className="window-minimize"
                      aria-label={`${windowTitle(item.id)} 최소화`}
                      onClick={() => minimize(item.id)}
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      className="window-maximize"
                      aria-label={`${windowTitle(item.id)} 크기 전환`}
                      onClick={() => dispatch({ type: "maximize", id: item.id })}
                    >
                      <Maximize2 size={10} />
                    </button>
                  </div>
                  <span id={`window-title-${item.id}`}>{windowTitle(item.id)}</span>
                  <span className="desktop-window-bar-space" />
                </div>
                <div className="desktop-window-content">
                  <WindowBody id={item.id} active={isActive} onOpen={open} />
                </div>
                {!item.maximized &&
                  resizeEdges.map((edge) => (
                    <button
                      key={edge}
                      className={`desktop-resize-handle desktop-resize-${edge}`}
                      data-resize-edge={edge}
                      aria-label={`${windowTitle(item.id)} 창 ${resizeEdgeLabels[edge]} 크기 조절`}
                      tabIndex={edge === "se" ? 0 : -1}
                      title="드래그해서 창 크기 조절 · 방향키로 조절"
                      onPointerDown={(event) => startResize(event, item.id, edge, point)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={cancelDrag}
                      onKeyDown={(event) => {
                        if (
                          !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
                        )
                          return;
                        event.preventDefault();
                        const step = event.shiftKey ? 40 : 16;
                        dispatch({
                          type: "resize",
                          id: item.id,
                          ...resizeWindow(
                            point,
                            event.key === "ArrowLeft"
                              ? -step
                              : event.key === "ArrowRight"
                                ? step
                                : 0,
                            event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0,
                            edge,
                            windowBounds,
                          ),
                        });
                      }}
                    />
                  ))}
              </section>
            );
          })}
        <nav className="desktop-dock" aria-label="작업실 Dock">
          <Link href="/" aria-label="홈">
            <House />
          </Link>
          <button
            onClick={() => open("about")}
            aria-label="소개 열기"
            data-dock-window="about"
            data-open={windows.some((w) => w.id === "about") || undefined}
          >
            <UserRound />
          </button>
          <button
            className="desktop-dock-projects"
            onClick={() => open("projects")}
            aria-label="모든 프로젝트 열기"
            data-dock-window="projects"
            data-open={windows.some((w) => w.id === "projects") || undefined}
          >
            <FolderOpen />
          </button>
          <Link href="/blog" aria-label="블로그">
            <BookOpen />
          </Link>
          {windows
            .filter((w) => w.id !== "about" && w.id !== "projects")
            .map((w) => (
              <button
                className="desktop-dock-running"
                key={w.id}
                aria-label={`${windowTitle(w.id)} 창 복원`}
                data-dock-window={w.id}
                title={windowTitle(w.id)}
                onClick={() => open(w.id)}
                data-open
              >
                <img src={projectPoster(w.id)} width={44} height={36} alt="" />
              </button>
            ))}
        </nav>
      </div>
      <noscript>
        <nav aria-label="프로젝트 목록" className="desktop-noscript-projects">
          <h2>프로젝트 목록</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.slug}>
                <Link href={`/projects/${project.slug}`}>{project.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </noscript>
    </main>
  );
}
