export type PostSummary = {
  path: string;
  slug: string;
  title: string;
  status: string;
  sha: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
};

export type ListPostSummariesOptions = {
  query?: string;
  sort?: "published" | "updated";
};
