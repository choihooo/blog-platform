import config from "./kanana-model.json";

export const LOCAL_SPLIT_MODEL_URL = `/models/${config.directory}/${config.firstShard}`;
export const HOSTED_SPLIT_MODEL_URL = `${config.publicModelBaseUrl}/${config.directory}/${config.firstShard}`;

export function kananaModelUrl(mode: string | undefined, configuredUrl?: string): string {
  if (configuredUrl?.trim()) return configuredUrl.trim();
  // The original pinned single-file URL remains available as an explicit override.
  return mode === "development" ? LOCAL_SPLIT_MODEL_URL : HOSTED_SPLIT_MODEL_URL;
}

export const PARALLEL_MODEL_DOWNLOADS = config.parallelDownloads;
