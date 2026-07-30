import { getMigrationSwitch } from "../admin-ops/migration-switch";
import { createD1RepositoryContentAdapter } from "./d1-repository-adapter";
import { createLegacyContentAdapter } from "./local-adapter";
import type { ContentAdapter } from "./types";

export async function createRuntimeContentAdapter(root: string): Promise<ContentAdapter> {
  if (getMigrationSwitch().mode === "d1r2") return createD1RepositoryContentAdapter();
  return createLegacyContentAdapter(root);
}
