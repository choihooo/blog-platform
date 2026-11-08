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
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from "react";
import { projects } from "@blog-platform/core/content/catalog";
import {
  desktopProjects,
  projectPoster,
  projectPreviews,
  windowTitle,
  projectIdFromHash,
} from "./desktop-data";
import { ProjectWindowSummary } from "./project-window-summary";
import { MainHeader } from "../../navigation/main-header";
import {
  clampPosition,
  desktopReducer,
  getWindowRect,
  resizeWindow,
  type DesktopWindow,
  type ResizeEdge,
  type WindowRect,
} from "./desktop-state";

type Point = { x: number; y: number };
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
const iconPlacements = [
  { x: 0.08, y: 0.12, rotation: -4 },
  { x: 0.235, y: 0.27, rotation: 3 },
  { x: 0.72, y: 0.11, rotation: -2 },
  { x: 0.87, y: 0.28, rotation: 5 },
  { x: 0.055, y: 0.49, rotation: -3 },
  { x: 0.24, y: 0.6, rotation: -5 },
  { x: 0.76, y: 0.45, rotation: 3 },
  { x: 0.865, y: 0.7, rotation: -3 },
  { x: 0.095, y: 0.79, rotation: 4 },
  { x: 0.28, y: 0.85, rotation: -2 },
  { x: 0.7, y: 0.79, rotation: 3 },
];

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
  const [windows, dispatch] = useReducer(desktopReducer, []);
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [space, setSpace] = useState({ width: 1280, height: 740 });
  const workspace = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    kind: "icon" | "window" | "resize";
    id: string;
    px: number;
    py: number;
    x: number;
    y: number;
    moved: boolean;
    width: number;
    height: number;
    edge?: ResizeEdge;
  } | null>(null);
  const suppressClick = useRef<string | null>(null);
  const focusReturn = useRef<HTMLElement | null>(null);
  const pendingFocus = useRef<{ kind: "dock" | "launcher"; id: string } | null>(null);
  const active = windows.filter((w) => !w.minimized).at(-1)?.id;
  const windowBounds = { width: space.width, height: space.height - 92 };
  useEffect(() => {
    const restore = () => {
      const id = projectIdFromHash(window.location.hash);
      if (!id) return;
      const width = workspace.current?.clientWidth ?? 1280;
      dispatch({ type: "open", id, x: (width - Math.min(720, width - 32)) / 2, y: 38 });
    };
    restore();
    window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, []);
  useEffect(() => {
    const el = workspace.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSpace({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!active) return;
    const dialog = workspace.current?.querySelector<HTMLElement>(`[data-window="${active}"]`);
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus({ preventScroll: true });
  }, [active]);
  useEffect(() => {
    const pending = pendingFocus.current;
    if (!pending) return;
    pendingFocus.current = null;
    const selector =
      pending.kind === "dock"
        ? `[data-dock-window="${pending.id}"]`
        : `[data-shortcut="${pending.id}"]`;
    const target = workspace.current?.querySelector<HTMLElement>(selector);
    (
      target ||
      (focusReturn.current?.isConnected ? focusReturn.current : null) ||
      workspace.current?.querySelector<HTMLElement>(".desktop-dock a")
    )?.focus({ preventScroll: true });
  }, [windows]);
  const open = (id: string) => {
    focusReturn.current = document.activeElement as HTMLElement;
    const width = Math.min(720, space.width - 32);
    dispatch({
      type: "open",
      id,
      x: (space.width - width) / 2 + windows.length * 18,
      y: 38 + windows.length * 12,
    });
  };
  const close = (id: string) => {
    pendingFocus.current = { kind: "launcher", id };
    dispatch({ type: "close", id });
  };
  const minimize = (id: string) => {
    pendingFocus.current = { kind: "dock", id };
    dispatch({ type: "minimize", id });
  };
  const windowPosition = (item: DesktopWindow) => getWindowRect(item, windowBounds);
  const iconPosition = (id: string, index: number) => {
    const saved = positions[id];
    const place = iconPlacements[index % iconPlacements.length]!;
    return clampPosition(
      saved?.x ?? place.x * space.width,
      saved?.y ?? place.y * (space.height - 150),
      space.width,
      space.height - 110,
      100,
      100,
    );
  };
  function startDrag(
    event: ReactPointerEvent<HTMLElement>,
    kind: "icon" | "window",
    id: string,
    point: Point & Partial<Pick<WindowRect, "width" | "height">>,
  ) {
    if (
      event.button !== 0 ||
      (kind === "icon" && (space.width < 760 || space.height < 450)) ||
      (kind === "window" && (event.target as HTMLElement).closest("button,a"))
    )
      return;
    if (kind === "window") dispatch({ type: "focus", id });
    if (kind === "icon") suppressClick.current = null;
    drag.current = {
      kind,
      id,
      px: event.clientX,
      py: event.clientY,
      x: point.x,
      y: point.y,
      moved: false,
      width: point.width ?? 100,
      height: point.height ?? 100,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveDrag(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.px,
      dy = event.clientY - current.py;
    if (Math.hypot(dx, dy) < 5 && !current.moved) return;
    current.moved = true;
    if (current.kind === "resize") {
      const rect = resizeWindow(current, dx, dy, current.edge!, windowBounds);
      dispatch({ type: "resize", id: current.id, ...rect });
      return;
    }
    const point = clampPosition(
      current.x + dx,
      current.y + dy,
      space.width,
      space.height - (current.kind === "window" ? 92 : 110),
      current.width,
      current.height,
    );
    if (current.kind === "window") dispatch({ type: "move", id: current.id, ...point });
    else setPositions((prev) => ({ ...prev, [current.id]: point }));
  }
  function endDrag() {
    if (drag.current?.moved && drag.current.kind === "icon")
      suppressClick.current = drag.current.id;
    drag.current = null;
  }
  function startResize(
    event: ReactPointerEvent<HTMLButtonElement>,
    id: string,
    edge: ResizeEdge,
    rect: WindowRect,
  ) {
    if (event.button !== 0) return;
    event.stopPropagation();
    dispatch({ type: "focus", id });
    drag.current = {
      kind: "resize",
      id,
      px: event.clientX,
      py: event.clientY,
      ...rect,
      edge,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

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
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onClick={() => {
                  if (suppressClick.current === project.slug) {
                    suppressClick.current = null;
                    return;
                  }
                  open(project.slug);
                }}
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
        <button className="desktop-reset" onClick={() => setPositions({})}>
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
                  onPointerCancel={() => {
                    drag.current = null;
                  }}
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
                      onPointerCancel={() => {
                        drag.current = null;
                      }}
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
