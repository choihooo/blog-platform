import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { getSitemapEntries } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries(await getPosts());
}
