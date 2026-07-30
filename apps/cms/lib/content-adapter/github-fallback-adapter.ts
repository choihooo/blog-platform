import type { ContentAdapter } from "./content-adapter.interface";
import { createD1R2ContentAdapter } from "./d1-r2-adapter";

// Compatibility bridge for the migration-era ContentAdapter contract.
// Without a D1 binding, createD1R2ContentAdapter falls back to the current
// markdown content source for reads while preserving explicit write failures.
export function createGitHubFallbackContentAdapter(): ContentAdapter {
  return createD1R2ContentAdapter();
}
