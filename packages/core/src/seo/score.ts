import { canonicalUrl } from "./subject.js";
import type { SeoIssue, SeoSubject } from "./types.js";

function issue(
  code: string,
  message: string,
  field: string,
  severity: SeoIssue["severity"],
  points = 0,
): SeoIssue {
  return { code, message, field, severity, points };
}

export function scoreSeo(subject: SeoSubject) {
  const checks: SeoIssue[] = [];
  const add = (ok: boolean, code: string, message: string, field: string, points: number) => {
    checks.push(issue(code, message, field, ok ? "passed" : "warning", ok ? points : 0));
  };

  const h1Count = subject.headings.filter((h) => h.depth === 1).length;
  const h2Count = subject.headings.filter((h) => h.depth === 2).length;
  add(h1Count > 0, "h1-present", "H1 heading is present", "body", 15);
  add(h2Count >= 2, "h2-count", "At least two H2 headings are present", "body", 15);
  add(Boolean(subject.excerpt), "meta-description", "Meta description exists", "excerpt", 15);
  add(
    Boolean(subject.title && subject.slug),
    "open-graph",
    "Open Graph metadata can be generated",
    "metadata",
    15,
  );
  add(Boolean(canonicalUrl(subject)), "canonical-url", "Canonical URL exists", "canonicalUrl", 10);
  const titleLength = subject.title?.length ?? 0;
  add(
    titleLength >= 10 && titleLength <= 70,
    "title-length",
    "Title length is appropriate",
    "title",
    15,
  );
  add(
    subject.imageAltTexts.length === 0 ||
      subject.imageAltTexts.every((alt) => alt.trim().length > 0),
    "image-alt",
    "Images have alt text",
    "body",
    15,
  );

  const blocking: SeoIssue[] = [];
  if (!subject.title)
    blocking.push(issue("missing-title", "Title is required", "title", "blocking"));
  if (!subject.slug) blocking.push(issue("missing-slug", "Slug is required", "slug", "blocking"));
  if (!subject.body.trim())
    blocking.push(issue("missing-body", "Body is required", "body", "blocking"));
  try {
    new URL(canonicalUrl(subject));
  } catch {
    blocking.push(
      issue("invalid-canonical-url", "Canonical URL must be valid", "canonicalUrl", "blocking"),
    );
  }

  return {
    score: checks.reduce((sum, item) => sum + (item.points ?? 0), 0),
    checks,
    blocking,
  };
}
