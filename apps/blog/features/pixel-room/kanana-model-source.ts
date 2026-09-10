import config from "./kanana-model.json";

export const HOSTED_SPLIT_MODEL_URL = `${config.publicModelBaseUrl}/${config.directory}/${config.firstShard}`;

export function kananaModelUrl(mode: string | undefined, configuredUrl?: string): string {
  void mode;
  if (configuredUrl?.trim()) return configuredUrl.trim();
  return HOSTED_SPLIT_MODEL_URL;
}

export const PARALLEL_MODEL_DOWNLOADS = config.parallelDownloads;
