import { editorDocumentToMdx, type EditorDocument } from "@blog-platform/editor";
import { analyzeMdx } from "@blog-platform/markdown";
import { createSeoSubject, evaluateSeo, type SeoReport } from "@blog-platform/seo-engine";

type EditorSeoSite = {
  siteName?: string;
  siteUrl?: string;
};

const fallbackSite = { siteName: "Ho's Blog", siteUrl: "https://blog.hozorica.com" };

export function seoReportForEditorDocument(
  document: EditorDocument,
  siteConfig: EditorSeoSite = {},
): SeoReport {
  const site = {
    siteName: siteConfig.siteName?.trim() || fallbackSite.siteName,
    siteUrl: siteConfig.siteUrl?.trim() || fallbackSite.siteUrl,
  };
  const serialized = editorDocumentToMdx(document);
  const body = serialized.ok
    ? serialized.body
    : document.body.map((node) => ("text" in node ? node.text : "")).join("\n");
  const analysis = analyzeMdx({ path: document.path ?? `${document.id}.mdx`, source: body });
  const subject = createSeoSubject({
    post: {
      path: document.path ?? `${document.id}.mdx`,
      status: document.frontmatter.status,
      title: document.frontmatter.title,
      slug: document.frontmatter.slug || document.id,
      excerpt: document.frontmatter.excerpt,
      coverImage: document.frontmatter.coverImage,
      author: document.frontmatter.author,
      publishedAt: document.frontmatter.publishedAt,
      updatedAt: document.frontmatter.updatedAt,
      category: document.frontmatter.category,
      tags: document.frontmatter.tags,
      body,
    },
    site,
    analysis: analysis.success
      ? {
          headings: analysis.data?.headings,
          toc: analysis.data?.toc,
          readingTime: analysis.data?.readingTime,
        }
      : undefined,
  });
  return evaluateSeo(subject);
}
