export type DesktopWindow = {
  id: string;
  minimized: boolean;
  maximized: boolean;
  x: number;
  y: number;
};
export type DesktopAction =
  | { type: "open" | "close" | "focus" | "minimize" | "maximize"; id: string }
  | { type: "move"; id: string; x: number; y: number };
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
        : { id: action.id, minimized: false, maximized: false, x: 0, y: 0 },
    ];
  if (!existing) return [...state];
  if (action.type === "focus") return [...state.filter((w) => w.id !== action.id), existing];
  return state.map((w) =>
    w.id !== action.id
      ? w
      : action.type === "move"
        ? { ...w, x: action.x, y: action.y }
        : action.type === "minimize"
          ? { ...w, minimized: true }
          : { ...w, maximized: !w.maximized },
  );
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
