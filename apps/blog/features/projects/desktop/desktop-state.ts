export type DesktopWindow = {
  id: string;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type DesktopAction =
  | { type: "open"; id: string; x?: number; y?: number }
  | { type: "close" | "focus" | "minimize" | "maximize"; id: string }
  | { type: "move"; id: string; x: number; y: number }
  | { type: "resize"; id: string; x: number; y: number; width: number; height: number };
export function desktopReducer(
  state: readonly DesktopWindow[],
  action: DesktopAction,
): DesktopWindow[] {
  const existing = state.find((w) => w.id === action.id);
  if (action.type === "close") return state.filter((w) => w.id !== action.id);
  if (action.type === "open")
    return [
      ...state.filter((w) => w.id !== action.id),
      existing
        ? { ...existing, minimized: false }
        : {
            id: action.id,
            minimized: false,
            maximized: false,
            x: action.x ?? 0,
            y: action.y ?? 0,
            width: 720,
            height: 560,
          },
    ];
  if (!existing) return [...state];
  if (action.type === "focus") return [...state.filter((w) => w.id !== action.id), existing];
  return state.map((w) =>
    w.id !== action.id
      ? w
      : action.type === "move"
        ? { ...w, x: action.x, y: action.y }
        : action.type === "resize"
          ? { ...w, x: action.x, y: action.y, width: action.width, height: action.height }
          : action.type === "minimize"
            ? { ...w, minimized: true }
            : { ...w, maximized: !w.maximized },
  );
}

export type WindowRect = { x: number; y: number; width: number; height: number };
export type WorkspaceSize = { width: number; height: number };
export type ResizeEdge = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
export function getWindowRect(item: WindowRect, space: WorkspaceSize): WindowRect {
  const width = Math.min(item.width, space.width - 32),
    height = Math.min(item.height, space.height - 32);
  const point = clampPosition(item.x, item.y, space.width, space.height, width, height);
  return { ...point, width, height };
}
export function resizeWindow(
  rect: WindowRect,
  dx: number,
  dy: number,
  edge: ResizeEdge,
  bounds: WorkspaceSize,
): WindowRect {
  const minWidth = Math.min(320, bounds.width - 32),
    minHeight = Math.min(220, bounds.height - 32);
  const limit = (n: number, a: number, b: number) => Math.max(a, Math.min(n, b));
  let left = rect.x,
    top = rect.y,
    right = rect.x + rect.width,
    bottom = rect.y + rect.height;
  if (edge.includes("w")) left = limit(left + dx, 16, right - minWidth);
  if (edge.includes("e")) right = limit(right + dx, left + minWidth, bounds.width - 16);
  if (edge.includes("n")) top = limit(top + dy, 16, bottom - minHeight);
  if (edge.includes("s")) bottom = limit(bottom + dy, top + minHeight, bounds.height - 16);
  return { x: left, y: top, width: right - left, height: bottom - top };
}
export function clampPosition(
  x: number,
  y: number,
  workspaceWidth: number,
  workspaceHeight: number,
  width: number,
  height: number,
) {
  return {
    x: Math.max(16, Math.min(x, workspaceWidth - width - 16)),
    y: Math.max(16, Math.min(y, workspaceHeight - height - 16)),
  };
}
