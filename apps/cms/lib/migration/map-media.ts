import { randomUUID } from "node:crypto";

export type MediaKind = "hero" | "body" | "og" | "pdf" | "attachment";

export type MediaMapStatus = "pending" | "uploaded" | "mapped" | "failed" | "skipped";

export type MediaMappingInput = {
  sourceUrl: string;
  canonicalPostSlug: string;
  kind?: MediaKind;
  width?: number;
  height?: number;
  fallbackKind?: MediaKind;
};

export type MediaMappingRecord = {
  sourceUrl: string;
  canonicalPostSlug: string;
  targetR2Key: string;
  r2Url: string;
  kind: MediaKind;
  width: number | null;
  height: number | null;
  status: MediaMapStatus;
  notes: string;
};

export type MediaMappingReport = {
  postSlug: string;
  mappings: MediaMappingRecord[];
  failures: string[];
};

const SUPABASE_PUBLIC_RE = /https?:\/\/[^\s'"()]+\/storage\/v1\/object\/public\/[^\s'"()]+/gi;
const IMAGE_FILE_RE = /\.(?:png|jpe?g|gif|webp|avif|bmp|svg)(?:\?.*)?$/i;
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/gi;
const HTML_IMG_SRC_RE = /<img\b[^>]*\bsrc=(['"])([^'"]+)\1/gi;

function isLikelySupabaseUrl(value: string) {
  return value.includes("/storage/v1/object/public/");
}

function detectKind(url: string, inputKind?: MediaKind): MediaKind {
  if (inputKind) return inputKind;
  const lowered = url.toLowerCase();
  if (lowered.includes("/og") || lowered.includes("/social")) return "og";
  if (lowered.includes("cover") || lowered.includes("hero") || lowered.includes("thumbnail"))
    return "hero";
  if (lowered.endsWith(".pdf") || lowered.includes("/pdf/")) return "pdf";
  return "body";
}

function resolveKindFromPolicy(
  url: string,
  input?: { kind?: MediaKind; fallbackKind?: MediaKind },
): MediaKind {
  if (input?.kind) return input.kind;
  if (input?.fallbackKind) return input.fallbackKind;
  return detectKind(url);
}

function buildR2Key(input: { postSlug: string; sourceUrl: string; kind: MediaKind }) {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = IMAGE_FILE_RE.test(input.sourceUrl) ? "webp" : "bin";
  const stem = input.postSlug || "post";
  return `blog/${now.getFullYear()}/${month}/${stem}/${randomUUID()}.${ext}`;
}

function parseR2PublicBase(): string {
  return (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");
}

function uniqueBySource(records: MediaMappingRecord[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (seen.has(record.sourceUrl)) return false;
    seen.add(record.sourceUrl);
    return true;
  });
}

function sanitizeWidthHeight(input: number | undefined) {
  if (typeof input !== "number" || !Number.isFinite(input) || input <= 0) return null;
  return Math.floor(input);
}

export function parseImageCandidates(source: string): string[] {
  const result = new Set<string>();
  for (const match of source.matchAll(SUPABASE_PUBLIC_RE)) {
    if (match[0]) result.add(match[0]);
  }

  for (const match of source.matchAll(MARKDOWN_IMAGE_RE)) {
    if (match[1]) result.add(match[1]);
  }

  for (const match of source.matchAll(HTML_IMG_SRC_RE)) {
    if (match[2]) result.add(match[2]);
  }

  return [...result];
}

export function inferKindFromContext(postSlug: string, source: string): MediaKind {
  if (postSlug.includes("og") && /\/og\//i.test(source)) return "og";
  return detectKind(source);
}

export function mapMedia(input: MediaMappingInput): MediaMappingRecord {
  const normalizedKind = resolveKindFromPolicy(input.sourceUrl, {
    kind: input.kind,
    fallbackKind: input.fallbackKind,
  });

  const targetR2Key = buildR2Key({
    postSlug: input.canonicalPostSlug,
    sourceUrl: input.sourceUrl,
    kind: normalizedKind,
  });

  const base = parseR2PublicBase();
  return {
    sourceUrl: input.sourceUrl,
    canonicalPostSlug: input.canonicalPostSlug,
    targetR2Key,
    r2Url: base ? `${base}/${targetR2Key}` : targetR2Key,
    kind: normalizedKind,
    width: sanitizeWidthHeight(input.width),
    height: sanitizeWidthHeight(input.height),
    status: isLikelySupabaseUrl(input.sourceUrl) ? "pending" : "skipped",
    notes: isLikelySupabaseUrl(input.sourceUrl) ? "scheduled" : "non-supabase-url",
  };
}

export function buildMediaMap(
  postSlug: string,
  sourceText: string,
  options?: { kind?: MediaKind },
): MediaMappingReport {
  const sources = parseImageCandidates(sourceText).filter(Boolean);
  const failures: string[] = [];

  if (sources.length === 0) {
    return { postSlug, mappings: [], failures: [] };
  }

  const mappings = sources.map((sourceUrl) => {
    try {
      return mapMedia({
        sourceUrl,
        canonicalPostSlug: postSlug,
        kind: resolveKindFromPolicy(sourceUrl, { kind: options?.kind }),
      });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : "media mapping failed");
      return {
        sourceUrl,
        canonicalPostSlug: postSlug,
        targetR2Key: "",
        r2Url: "",
        kind: options?.kind ?? "body",
        width: null,
        height: null,
        status: "failed" as const,
        notes: "failed to map",
      } as MediaMappingRecord;
    }
  });

  return {
    postSlug,
    mappings: uniqueBySource(mappings),
    failures,
  };
}

export function applyMediaRewrite(source: string, mappings: MediaMappingRecord[]): string {
  return mappings.reduce((next, mapping) => {
    if (mapping.status === "failed" || !mapping.r2Url || !mapping.sourceUrl) return next;
    return next.split(mapping.sourceUrl).join(mapping.r2Url);
  }, source);
}
