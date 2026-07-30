import { createExternalConsoleLinks } from "@blog-platform/analytics";
import type { EditorDocument } from "@blog-platform/editor";

export function analyticsLinksForEditorDocument(
  document: EditorDocument,
  site: {
    siteUrl?: string;
    analytics?: {
      provider?: string;
      ga4PropertyId?: string;
      searchConsoleProperty?: string;
    };
  } = {},
) {
  return createExternalConsoleLinks({
    siteUrl: site.siteUrl ?? "",
    postSlug: document.frontmatter.slug,
    postStatus: document.frontmatter.status,
    config: {
      provider: site.analytics?.provider ?? "disabled",
      ga4PropertyId: site.analytics?.ga4PropertyId,
      searchConsoleProperty: site.analytics?.searchConsoleProperty,
    },
  });
}
