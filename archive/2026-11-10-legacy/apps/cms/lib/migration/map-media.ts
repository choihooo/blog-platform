export type MediaKind = "hero" | "body" | "og" | "pdf" | "attachment";

export type MediaMapStatus = "pending" | "uploaded" | "mapped" | "failed" | "skipped";

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
