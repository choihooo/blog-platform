import type { ContentSourceMode } from "./content-adapter.interface";
import type { ContentAdapter } from "./content-adapter.interface";
import { createD1R2ContentAdapter } from "./d1-r2-adapter";

export function resolveContentSourceMode(): ContentSourceMode {
  return "d1r2";
}

export function createContentAdapter(
  mode: ContentSourceMode = resolveContentSourceMode(),
): ContentAdapter {
  void mode;
  return createD1R2ContentAdapter();
}

export { createD1R2ContentAdapter } from "./d1-r2-adapter";
