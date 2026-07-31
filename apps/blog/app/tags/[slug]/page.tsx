import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { trimSlash } from "@blog-platform/seo-engine";

import { PostList } from "../../components/post-list";
import { getPostsByTag, getSiteConfig, getTag, getTags } from "../../../lib/content-source";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [tag, site] = await Promise.all([getTag(slug), getSiteConfig()]);
  return tag
    ? {
        title: tag.label,
        description: tag.description,
        alternates: { canonical: `${trimSlash(site.siteUrl)}/tags/${tag.slug}` },
      }
    : {};
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const [tag, posts] = await Promise.all([getTag(slug), getPostsByTag(slug)]);
  if (!tag) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <section className="mb-10 grid gap-4">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Tag</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          {tag.label}
        </h1>
        {tag.description ? (
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{tag.description}</p>
        ) : null}
      </section>
      <PostList posts={posts} />
    </main>
  );
}
