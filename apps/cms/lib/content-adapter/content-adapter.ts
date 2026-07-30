import type { ContentSourceMode } from "./content-adapter.interface";
import type { ContentAdapter } from "./content-adapter.interface";
import { createD1R2ContentAdapter } from "./d1-r2-adapter";
import { createGitHubFallbackContentAdapter } from "./github-fallback-adapter";
import { getMigrationSwitch } from "../admin-ops/migration-switch";

export function resolveContentSourceMode(): ContentSourceMode {
  return getMigrationSwitch().mode;
}

export function createContentAdapter(
  mode: ContentSourceMode = resolveContentSourceMode(),
): ContentAdapter {
  if (mode === "d1r2") return createD1R2ContentAdapter();
  return createGitHubFallbackContentAdapter();
}

export { createD1R2ContentAdapter } from "./d1-r2-adapter";
export { createGitHubFallbackContentAdapter } from "./github-fallback-adapter";
