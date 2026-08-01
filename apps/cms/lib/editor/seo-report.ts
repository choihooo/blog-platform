import {
  analyzeEditorNodes,
  textFromEditorNodes,
  type EditorDocument,
} from "@blog-platform/editor";
import { createSeoSubject, evaluateSeo, type SeoReport } from "@blog-platform/seo-engine";

type EditorSeoSite = {
  siteName?: string;
  siteUrl?: string;
};

const fallbackSite = { siteName: "Hozorica", siteUrl: "https://blog.hozorica.com" };

export function seoReportForEditorDocument(
  document: EditorDocument,
  siteConfig: EditorSeoSite = {},
): SeoReport {
  const site = {
    siteName: siteConfig.siteName?.trim() || fallbackSite.siteName,
    siteUrl: siteConfig.siteUrl?.trim() || fallbackSite.siteUrl,
  };
  const body = textFromEditorNodes(document.body);
  const analysis = analyzeEditorNodes(document.body);
  const subject = createSeoSubject({
    post: {
      path: document.path ?? `db/posts/${document.id}`,
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
    analysis: {
      headings: analysis.headings,
      toc: analysis.headings,
      readingTime: analysis.readingTime,
    },
  });
  return evaluateSeo(subject);
}
