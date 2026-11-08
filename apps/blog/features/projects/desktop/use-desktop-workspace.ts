"use client";
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { iconPlacements, projectIdFromHash } from "./desktop-data";
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
export function useDesktopWorkspace() {
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

  function openShortcut(id: string) {
    if (suppressClick.current === id) {
      suppressClick.current = null;
      return;
    }
    open(id);
  }
  function cancelDrag() {
    drag.current = null;
  }
  function clearPositions() {
    setPositions({});
  }
  return {
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
  };
}
