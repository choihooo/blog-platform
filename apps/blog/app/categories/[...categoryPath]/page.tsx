import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { trimSlash } from "@blog-platform/seo-engine";

import { PostList } from "../../components/post-list";
import {
  getCategoryByPath,
  getPostsByCategoryPath,
  getSiteConfig,
  listCategories,
} from "../../../lib/content-source";

type CategoryPageProps = {
  params: Promise<{
    categoryPath: string[];
  }>;
};

export async function generateStaticParams() {
  const categories = await listCategories({ depth: 1 });
  const depth2 = await listCategories({ depth: 2 });

  return [...categories, ...depth2].map((category) => ({
    categoryPath: category.slug.split("/"),
  }));
}

function toCanonicalPath(parts: string[]) {
  return parts
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join("/")
    .replace(/^\/+|\/+$/g, "");
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryPath } = await params;
  const path = toCanonicalPath(categoryPath);
  const [category, site] = await Promise.all([getCategoryByPath(path), getSiteConfig()]);
  return category
    ? {
        title: category.label,
        description: category.description,
        alternates: { canonical: `${trimSlash(site.siteUrl)}/categories/${category.slug}` },
      }
    : {};
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryPath } = await params;
  const path = toCanonicalPath(categoryPath);
  if (!path) notFound();

  const [category, posts] = await Promise.all([
    getCategoryByPath(path),
    getPostsByCategoryPath(path, { publishedOnly: true }),
  ]);
  if (!category) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
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
