import { createD1RepositoryContentAdapter } from "./d1-repository-adapter";
import type { ContentAdapter } from "./types";

export async function createRuntimeContentAdapter(root: string): Promise<ContentAdapter> {
  void root;
  return createD1RepositoryContentAdapter();
}
