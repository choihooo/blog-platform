import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ImgHTMLAttributes, ReactNode } from "react";
import { Badge, Card, CardContent } from "@blog-platform/design-system";
import { generateJsonLd, generatePageMetadata } from "@blog-platform/seo-engine";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { getPostBySlug, getRecommendedPosts, getSiteConfig } from "../../../lib/content-source";
import { formatPostDateTime } from "../../../lib/date-format";
import { postToSeoSubject, siteForSeo } from "../../../lib/seo";
import { PostAnalyticsEvents } from "../../components/post-analytics-events";
import { RecommendedPosts } from "../../components/recommended-posts";

export const revalidate = 900;

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="my-7 bg-secondary px-5 py-4 text-secondary-foreground shadow-sm">
      {children}
    </aside>
  );
}

function MdxImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} decoding={props.decoding ?? "async"} loading={props.loading ?? "lazy"} />;
}

function canUseOptimizedImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname === "pub-2eadf17a82cb46679204775b78a2c16a.r2.dev";
  } catch {
    return false;
  }
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
  const [jsonLd, recommendedPosts] = await Promise.all([
    Promise.resolve(generateJsonLd(postToSeoSubject(post, siteForSeo(site)))),
    getRecommendedPosts(post, 3),
  ]);
  const postUrl = `${site.siteUrl.replace(/\/$/, "")}/posts/${post.slug}`;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12">
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
      <article className="grid gap-12 lg:grid-cols-[minmax(0,68ch)_220px] lg:justify-center lg:gap-16">
        <div className="min-w-0">
          <header className="mb-12 grid gap-5 bg-card pb-10">
            {post.coverImage ? (
              canUseOptimizedImage(post.coverImage) ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    priority
                    sizes="(min-width: 1024px) 68ch, calc(100vw - 40px)"
                    src={post.coverImage}
                  />
                </div>
              ) : (
                <img
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  src={post.coverImage}
                />
              )
            ) : null}
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm leading-6 text-muted-foreground">
              <time dateTime={post.publishedAt}>{formatPostDateTime(post.publishedAt)}</time>
              <span>{post.readingTimeLabel}</span>
              {post.authorProfile ? <span>{post.authorProfile.name}</span> : null}
            </div>
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
              components={{ Callout, img: MdxImage }}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeSlug],
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
          <RecommendedPosts posts={recommendedPosts} />
        </div>
        {post.toc.length > 0 ? (
          <Card
            className="h-fit border-0 bg-card shadow-sm lg:sticky lg:top-6"
            aria-label="Table of contents"
          >
            <CardContent className="grid gap-3 p-4 text-sm leading-6">
              <strong className="text-foreground">On this page</strong>
              {post.toc.map((item) => (
                <a
                  className="text-muted-foreground transition-colors hover:text-primary"
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
