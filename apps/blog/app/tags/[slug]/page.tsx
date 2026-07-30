import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostList } from "../../components/post-list";
import { getContentCollection, getPostsByTag, getTag } from "../../../lib/content";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const collection = await getContentCollection();
  return collection.tags.map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);
  return tag ? { title: tag.label, description: tag.description } : {};
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const [tag, posts] = await Promise.all([getTag(slug), getPostsByTag(slug)]);
  if (!tag) notFound();

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Tag</p>
        <h1>{tag.label}</h1>
        {tag.description ? <p>{tag.description}</p> : null}
      </section>
      <PostList posts={posts} />
    </main>
  );
}
