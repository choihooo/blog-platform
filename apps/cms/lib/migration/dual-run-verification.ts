import { buildMediaMap } from "./map-media";

export type DualRunRecord = {
  slug: string;
  titleMatch: boolean;
  categoryMatch: boolean;
  tagsMatch: boolean;
  heroMatch: boolean;
  bodyMatch: boolean;
  isPublishedMatch: boolean;
  mismatchCount: number;
};

export type DualRunInputPost = {
  slug: string;
  title?: string;
  category?: string | null;
  tags?: string[];
  heroImageKey?: string | null;
  content?: string;
  summary?: string;
  isPublished?: boolean | 0 | 1;
};

export type DualRunResult = {
  legacyOnly: string[];
  d1Only: string[];
  matched: number;
  mismatched: number;
  mismatchRate: number;
  records: DualRunRecord[];
};

function norm(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function toArray(value: string[] | undefined) {
  return [...new Set((value ?? []).map((item) => norm(item)).filter(Boolean))].sort();
}

function isPublished(value?: boolean | 0 | 1) {
  return value === true || value === 1;
}

export function comparePosts(legacy: DualRunInputPost[], d1: DualRunInputPost[]): DualRunResult {
  const legacyBySlug = new Map(legacy.map((post) => [norm(post.slug), post]));
  const d1BySlug = new Map(d1.map((post) => [norm(post.slug), post]));

  const shared = [...legacyBySlug.keys()].filter((slug) => d1BySlug.has(slug));
  const records: DualRunRecord[] = [];

  for (const slug of shared) {
    const left = legacyBySlug.get(slug);
    const right = d1BySlug.get(slug);
    if (!left || !right) continue;

    const tagsMatch = JSON.stringify(toArray(left.tags)) === JSON.stringify(toArray(right.tags));
    const categoryMatch = norm(left.category) === norm(right.category);
    const heroMatch = norm(left.heroImageKey) === norm(right.heroImageKey);
    const bodyMatch = norm(left.content) === norm(right.content);
    const titleMatch = norm(left.title) === norm(right.title);
    const isPublishedMatch = isPublished(left.isPublished) === isPublished(right.isPublished);

    const mismatchCount = [
      !titleMatch,
      !categoryMatch,
      !tagsMatch,
      !heroMatch,
      !bodyMatch,
      !isPublishedMatch,
    ].filter(Boolean).length;

    records.push({
      slug,
      titleMatch,
      categoryMatch,
      tagsMatch,
      heroMatch,
      bodyMatch,
      isPublishedMatch,
      mismatchCount,
    });
  }

  const matched = records.filter((entry) => entry.mismatchCount === 0).length;
  const mismatched = records.length - matched;
  const legacyOnly = [...legacyBySlug.keys()].filter((slug) => !d1BySlug.has(slug));
  const d1Only = [...d1BySlug.keys()].filter((slug) => !legacyBySlug.has(slug));

  return {
    legacyOnly,
    d1Only,
    matched,
    mismatched,
    mismatchRate: records.length === 0 ? 0 : mismatched / records.length,
    records,
  };
}

export function mapMediaFailureItems(source: string, slug: string) {
  const mapped = buildMediaMap(slug, source);
  return mapped.failures;
}
