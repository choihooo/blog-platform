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
    <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <section className="mb-10 grid gap-4">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Category</p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          {category.label}
        </h1>
        {category.description ? (
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            {category.description}
          </p>
        ) : null}
      </section>
      <PostList posts={posts} />
    </main>
  );
}
