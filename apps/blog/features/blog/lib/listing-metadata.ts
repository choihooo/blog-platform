import type { Metadata } from "next";

export function homeListingMetadata(input: {
  siteUrl: string;
  query?: string;
  category?: string;
  page: number;
}): Metadata {
  const baseUrl = input.siteUrl.replace(/\/+$/, "");
  const canonical =
    input.category && !input.query
      ? `${baseUrl}/blog/categories/${input.category}${input.page > 1 ? `?page=${input.page}` : ""}`
      : input.query
        ? `${baseUrl}/blog`
        : `${baseUrl}/blog${input.page > 1 ? `?page=${input.page}` : ""}`;

  return {
    title: input.page > 1 && !input.query ? `글 목록 - ${input.page}페이지` : undefined,
    alternates: { canonical },
    robots: input.query ? { index: false, follow: true } : undefined,
  };
}
