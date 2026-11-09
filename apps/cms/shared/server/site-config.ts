import {
  loadSiteConfig as loadCoreSiteConfig,
  normalizeSiteConfig,
} from "@blog-platform/core/storage";
import bundledSiteConfig from "../../../../content/site.json";
export {
  defaultSiteConfig,
  normalizeSiteConfig,
  siteConfigPath,
} from "@blog-platform/core/storage";
export type { SiteConfig } from "@blog-platform/core/storage";
export function bundledSiteConfigFallback() {
  return normalizeSiteConfig(bundledSiteConfig);
}
export function loadSiteConfig(root?: string) {
  return loadCoreSiteConfig({ root, bundled: bundledSiteConfig });
}
