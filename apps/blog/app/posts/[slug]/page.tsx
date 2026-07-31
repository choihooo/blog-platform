import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { Badge, Card, CardContent } from "@blog-platform/design-system";
import { generateJsonLd, generatePageMetadata } from "@blog-platform/seo-engine";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { getPostBySlug, getPublishedPosts, getSiteConfig } from "../../../lib/content-source";
import { formatPostDateTime } from "../../../lib/date-format";
import { postToSeoSubject, siteForSeo } from "../../../lib/seo";
import { PostAnalyticsEvents } from "../../components/post-analytics-events";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 border-l-4 border-primary bg-secondary px-4 py-3 text-secondary-foreground">
      {children}
    </aside>
  );
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
  if (!post) return {};
  const metadata = generatePageMetadata(postToSeoSubject(post, siteForSeo(site)));

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical: metadata.canonical },
    openGraph: metadata.openGraph,
    twitter: metadata.twitter,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
  if (!post) notFound();
  const jsonLd = generateJsonLd(postToSeoSubject(post, siteForSeo(site)));
  const postUrl = `${site.siteUrl.replace(/\/$/, "")}/posts/${post.slug}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <PostAnalyticsEvents
        context={{
          provider: site.analytics.provider,
          slug: post.slug,
          title: post.title,
          url: postUrl,
          siteUrl: site.siteUrl,
          category: post.category,
          tags: post.tags,
        }}
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <header className="mb-10 grid gap-4">
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <time dateTime={post.publishedAt}>{formatPostDateTime(post.publishedAt)}</time>
              <span>{post.readingTimeLabel}</span>
              {post.authorProfile ? <span>{post.authorProfile.name}</span> : null}
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
            ) : null}
            {post.coverImage ? (
              <img
                alt=""
                className="aspect-[16/9] w-full max-w-3xl object-cover"
                src={post.coverImage}
              />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {post.categoryEntry ? (
                <Link href={`/categories/${post.categoryEntry.slug}`}>
                  <Badge variant="secondary">{post.categoryEntry.label}</Badge>
                </Link>
              ) : null}
              {post.tagEntries.map((tag) => (
                <Link href={`/tags/${tag.slug}`} key={tag.slug}>
                  <Badge variant="outline">{tag.label}</Badge>
                </Link>
              ))}
            </div>
          </header>
          <div
            className="prose"
            data-analytics-category={post.category}
            data-analytics-slug={post.slug}
          >
            <MDXRemote
              source={post.body}
              components={{ Callout }}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeSlug],
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </div>
        {post.toc.length > 0 ? (
          <Card className="h-fit lg:sticky lg:top-6" aria-label="Table of contents">
            <CardContent className="grid gap-3 p-4 text-sm">
              <strong>On this page</strong>
              {post.toc.map((item) => (
                <a
                  className="text-muted-foreground"
                  data-analytics-toc
                  href={`#${item.slug}`}
                  key={item.slug}
                >
                  {item.text}
                </a>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </article>
    </main>
  );
}
