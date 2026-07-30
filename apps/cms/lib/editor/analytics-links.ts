import { createExternalConsoleLinks } from "@blog-platform/analytics";
import type { EditorDocument } from "@blog-platform/editor";

export function analyticsLinksForEditorDocument(document: EditorDocument) {
  if (document.frontmatter.status !== "published") {
    return { disabledReasons: ["Only published posts have public analytics links"] };
  }
  return createExternalConsoleLinks({
    siteUrl: "http://localhost:3000",
    postSlug: document.frontmatter.slug || document.id,
    config: { provider: "disabled" },
  });
}
