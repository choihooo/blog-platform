import type { Metadata } from "next";

export function homeListingMetadata(input: { siteUrl: string; page: number }): Metadata {
  const baseUrl = input.siteUrl.replace(/\/+$/, "");
  const canonical = input.page > 1 ? `${baseUrl}/blog/page/${input.page}` : `${baseUrl}/blog`;

  return {
    title: input.page > 1 ? `글 목록 - ${input.page}페이지` : "블로그",
    alternates: { canonical },
  };
}

export function searchListingMetadata(input: { siteUrl: string; query: string }): Metadata {
  const baseUrl = input.siteUrl.replace(/\/+$/, "");

  return {
    title: input.query ? `검색: ${input.query}` : "글 검색",
    alternates: { canonical: `${baseUrl}/blog/search` },
    robots: { index: false, follow: true },
  };
}

export function categoryListingMetadata(input: {
  siteUrl: string;
  label: string;
  slug: string;
  page: number;
}): Metadata {
  const baseUrl = input.siteUrl.replace(/\/+$/, "");
  const canonical = `${baseUrl}/blog/categories/${input.slug}${input.page > 1 ? `/page/${input.page}` : ""}`;

  return {
    title: input.page > 1 ? `${input.label} - ${input.page}페이지` : input.label,
    alternates: { canonical },
  };
}

export function tagListingMetadata(input: {
  siteUrl: string;
  label: string;
  slug: string;
  page: number;
}): Metadata {
  const baseUrl = input.siteUrl.replace(/\/+$/, "");
  const canonical = `${baseUrl}/blog/tags/${input.slug}${input.page > 1 ? `/page/${input.page}` : ""}`;

  return {
    title: input.page > 1 ? `${input.label} - ${input.page}페이지` : input.label,
    alternates: { canonical },
  };
}
