import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip, ChipGroup } from "@hozui/react";
import { ArrowLeft } from "lucide-react";
import { generateJsonLd, generatePageMetadata } from "@blog-platform/seo-engine";

import { BlogBreadcrumb } from "@/features/blog/components/blog-breadcrumb";
import { PostAnalyticsEvents } from "@/features/blog/components/post-analytics-events";
import { serializeJsonLd } from "@/shared/seo/person-json-ld";
import { PostAuthorMeta } from "@/features/blog/components/post-author-meta";
import { PostShareActions } from "@/features/blog/components/post-share-actions";
import { RecommendedPosts } from "@/features/blog/components/recommended-posts";
import { postToSeoSubject, siteForSeo } from "@/features/blog/lib/seo";
import {
  getPostBySlug,
  getPublishedPosts,
  getRecommendedPosts,
  getSiteConfig,
} from "@/features/blog/server/content-source";
import { formatPostDateTime } from "@/shared/date/date-format";
import { PostBodyRenderer } from "./post-body-renderer";

export const revalidate = 900;

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
  presentation?: "default" | "archive";
};

export async function generateStaticParams() {
  const posts = await getPublishedPosts({ analyzeBody: false, limit: 100 });
  return posts.map((post) => ({ slug: post.slug }));
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
  if (!post) notFound();
  const metadata = generatePageMetadata(postToSeoSubject(post, siteForSeo(site)));

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical: metadata.canonical },
    openGraph: metadata.openGraph,
    twitter: metadata.twitter,
  };
}

export default async function PostPage({ params, presentation = "default" }: PostPageProps) {
  const { slug } = await params;
  const isArchivePresentation = presentation === "archive";
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
  if (!post) notFound();
  const [jsonLd, recommendedPosts] = await Promise.all([
    Promise.resolve(generateJsonLd(postToSeoSubject(post, siteForSeo(site)))),
    getRecommendedPosts(post, 3),
  ]);
  const postUrl = `${site.siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;
  const analyticsContext = {
    provider: site.analytics.provider,
    slug: post.slug,
    title: post.title,
    url: postUrl,
    siteUrl: site.siteUrl,
    category: post.category,
    tags: post.tags,
  };
  const author = post.authorProfile
    ? {
        avatar: post.authorProfile.avatar,
        name: post.authorProfile.name,
      }
    : {
        avatar: site.defaultAuthorAvatar,
        name: site.defaultAuthorName || site.defaultAuthor,
      };

  return (
    <main
      className={[
        "mx-auto w-full max-w-6xl px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12",
        isArchivePresentation ? "blog-detail-page blog-detail-page--archive" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <PostAnalyticsEvents context={analyticsContext} />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        type="application/ld+json"
      />
      {isArchivePresentation ? (
        <div className="blog-detail__topline">
          <Link className="blog-detail__back-link" href="/blog" replace>
            <ArrowLeft aria-hidden="true" size={14} /> 목록
          </Link>
          <span className="blog-detail__path">
            Projects / {post.categoryEntry?.label ?? "Hozui"}
          </span>
        </div>
      ) : (
        <BlogBreadcrumb
          entries={[
            { href: "/blog", label: "글" },
            ...(post.categoryEntry
              ? [
                  {
                    href: `/blog/categories/${post.categoryEntry.slug}`,
                    label: post.categoryEntry.label,
                  },
                ]
              : []),
            { label: post.title },
          ]}
          label="글 위치"
        />
      )}
      <article
        className={
          isArchivePresentation
            ? "blog-detail__article"
            : "grid gap-12 lg:grid-cols-[minmax(0,68ch)_220px] lg:justify-center lg:gap-16"
        }
      >
        <div className="min-w-0">
          <header
            className={
              isArchivePresentation ? "blog-detail__header" : "mb-12 grid gap-5 bg-card pb-10"
            }
          >
            {!isArchivePresentation && post.coverImage ? (
              canUseOptimizedImage(post.coverImage) ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    fetchPriority="high"
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
            <h1
              className={
                isArchivePresentation
                  ? "blog-detail__title"
                  : "text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl"
              }
            >
              {post.title}
            </h1>
            <div
              className={
                isArchivePresentation
                  ? "blog-detail__meta"
                  : "flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-6 text-muted-foreground"
              }
            >
              <time dateTime={post.publishedAt}>{formatPostDateTime(post.publishedAt)}</time>
              <span>·</span>
              <span>{post.readingTimeLabel}</span>
              <PostAuthorMeta author={author} size="md" />
            </div>
            <ChipGroup
              aria-label="글 분류"
              className={isArchivePresentation ? "blog-detail__chips" : "flex flex-wrap gap-2"}
            >
              {post.categoryEntry ? (
                <Link
                  href={`/blog/categories/${post.categoryEntry.slug}`}
                  replace={isArchivePresentation}
                >
                  <Chip label={post.categoryEntry.label} size="sm" tone="accent" />
                </Link>
              ) : null}
              {post.tagEntries.map((tag) => (
                <Link
                  href={`/blog/tags/${tag.slug}`}
                  key={tag.slug}
                  replace={isArchivePresentation}
                >
                  <Chip label={tag.label} size="sm" tone="neutral" />
                </Link>
              ))}
            </ChipGroup>
            {isArchivePresentation && post.coverImage ? (
              <div className="blog-detail__hero">
                {canUseOptimizedImage(post.coverImage) ? (
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    fetchPriority="high"
                    priority
                    sizes="(max-width: 639px) calc(100vw - 40px), 700px"
                    src={post.coverImage}
                  />
                ) : (
                  <img
                    alt=""
                    className="object-cover"
                    decoding="async"
                    fetchPriority="high"
                    loading="eager"
                    src={post.coverImage}
                  />
                )}
              </div>
            ) : null}
          </header>
          <div
            className={isArchivePresentation ? "prose blog-detail__prose" : "prose"}
            data-analytics-category={post.category}
            data-analytics-slug={post.slug}
          >
            <PostBodyRenderer
              analyticsContext={analyticsContext}
              nodes={post.bodyNodes}
              replaceLinks={isArchivePresentation}
            />
          </div>
          <RecommendedPosts
            analyticsContext={analyticsContext}
            posts={recommendedPosts}
            replaceLinks={isArchivePresentation}
          />
          <PostShareActions context={analyticsContext} />
        </div>
        {!isArchivePresentation && post.toc.length > 0 ? (
          <aside
            className="hidden h-fit border-0 bg-card shadow-sm lg:sticky lg:top-6 lg:block"
            aria-label="Table of contents"
          >
            <div className="grid gap-3 p-4 text-sm leading-6">
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
            </div>
          </aside>
        ) : null}
      </article>
    </main>
  );
}
