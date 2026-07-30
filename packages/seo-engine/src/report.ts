import { generateJsonLd } from "./json-ld.js";
import { generatePageMetadata } from "./metadata.js";
import { ogImageUrl, publicPostUrl } from "./subject.js";
import { scoreSeo } from "./score.js";
import type { SeoReport, SeoSubject } from "./types.js";

export function evaluateSeo(
  subject: SeoSubject,
  evaluatedAt = new Date().toISOString(),
): SeoReport {
  const result = scoreSeo(subject);
  const metadata = generatePageMetadata(subject);
  const warnings = result.checks.filter((item) => item.severity === "warning");
  const publicUrl = subject.slug ? publicPostUrl(subject.site, subject.slug) : undefined;
  const ogImage = subject.slug
    ? ogImageUrl(subject.site, subject.slug)
    : (metadata.openGraph.images[0] ?? subject.site.siteUrl);
  const status = result.blocking.length > 0 ? "blocking" : warnings.length > 0 ? "warning" : "pass";

  return {
    score: result.score,
    status,
    blockingIssues: result.blocking,
    warnings,
    passedChecks: result.checks.filter((item) => item.severity === "passed"),
    searchPreview: {
      title: metadata.title,
      description: metadata.description,
      url: metadata.canonical,
    },
    socialPreview: { title: metadata.title, description: metadata.description, image: ogImage },
    jsonLdPreview: generateJsonLd(subject),
    generatedUrls: { publicUrl, canonical: metadata.canonical, ogImage },
    evaluatedAt,
  };
}
