import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostList } from "../../components/post-list";
import { getCategory, getContentCollection, getPostsByCategory } from "../../../lib/content";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const collection = await getContentCollection();
  return collection.categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return category ? { title: category.label, description: category.description } : {};
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [category, posts] = await Promise.all([getCategory(slug), getPostsByCategory(slug)]);
  if (!category) notFound();

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Category</p>
        <h1>{category.label}</h1>
        {category.description ? <p>{category.description}</p> : null}
      </section>
      <PostList posts={posts} />
    </main>
  );
}
