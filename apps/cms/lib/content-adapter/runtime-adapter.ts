import { createD1RepositoryContentAdapter } from "./d1-repository-adapter";
import { createLocalContentAdapter } from "./local-adapter";
import type { ContentAdapter } from "./types";

function r2UploadConfigured() {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    (process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) &&
    (process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) &&
    (process.env.R2_BUCKET || process.env.CLOUDFLARE_R2_BUCKET),
  );
}

export async function createRuntimeContentAdapter(root: string): Promise<ContentAdapter> {
  if (process.env.NODE_ENV === "development" && !r2UploadConfigured()) {
    return createLocalContentAdapter(root);
  }
  return createD1RepositoryContentAdapter();
}
