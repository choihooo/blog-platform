import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MainHeader } from "@/features/navigation/main-header";
import { ArticleNavigationPanel } from "@/features/blog-rounded/article-navigation-panel";
import { PostTags } from "@/features/blog-rounded/post-tags";
import { preparePreviewArticle } from "@/features/blog-rounded/preview-article";
import "@/features/blog-rounded/rounded-blog.css";
import { generateJsonLd, generatePageMetadata } from "@blog-platform/seo-engine";

import { BlogBreadcrumb } from "@/features/blog/components/blog-breadcrumb";
import { PostAnalyticsEvents } from "@/features/blog/components/post-analytics-events";
import { serializeJsonLd } from "@/shared/seo/person-json-ld";
import { PostAuthorMeta } from "@/features/blog/components/post-author-meta";
import { PostShareActions } from "@/features/blog/components/post-share-actions";
import { postToSeoSubject, siteForSeo } from "@/features/blog/lib/seo";
import {
  getPostBySlug,
  getPublishedPosts,
  getAllPublishedPosts,
  getSiteConfig,
} from "@/features/blog/server/content-source";
import { formatPostDateTime } from "@/shared/date/date-format";
import { PostBodyRenderer } from "./post-body-renderer";

export const revalidate = 900;

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
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

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteConfig()]);
  if (!post) notFound();
  const [jsonLd, posts] = await Promise.all([
    Promise.resolve(generateJsonLd(postToSeoSubject(post, siteForSeo(site)))),
    getAllPublishedPosts({ analyzeBody: false }),
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

  const article = preparePreviewArticle(post);
  return (
    <div className="rounded-blog">
      <MainHeader active="blog" />
      <main className="rounded-blog-article-wrap">
        <PostAnalyticsEvents context={analyticsContext} />
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
          type="application/ld+json"
        />
        <Link className="rounded-blog-back" href="/blog">
          <ArrowLeft size={16} aria-hidden="true" />글 목록으로
        </Link>
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
        <article className="rounded-blog-document">
          <header className="rounded-blog-article-heading">
            <div className="rounded-blog-taxonomy">
              {post.categoryEntry ? (
                <Link
                  className="rounded-blog-badge"
                  href={`/blog/categories/${post.categoryEntry.slug}`}
                >
                  {post.categoryEntry.label}
                </Link>
              ) : (
                <span className="rounded-blog-badge">기록</span>
              )}
              <PostTags tags={post.tagEntries} linkBasePath="/blog/tags" />
            </div>
            <h1>{post.title}</h1>
            <div className="rounded-blog-article-meta">
              <PostAuthorMeta author={author} size="md" />
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatPostDateTime(post.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTimeLabel}</span>
            </div>
          </header>
          {post.coverImage && (
            <Image
              className="rounded-blog-article-cover"
              src={post.coverImage}
              alt=""
              width={1280}
              height={720}
              priority
              fetchPriority="high"
              unoptimized={!canUseOptimizedImage(post.coverImage)}
              sizes="(max-width: 759px) calc(100vw - 72px), 992px"
            />
          )}
          <div className="rounded-blog-reading-layout">
            <div
              className="prose"
              data-analytics-category={post.category}
              data-analytics-slug={post.slug}
            >
              <PostBodyRenderer analyticsContext={analyticsContext} nodes={article.nodes} />
            </div>
            {article.toc.length > 0 && (
              <aside className="rounded-blog-toc" aria-label="이 글의 목차">
                <h2>이 글의 목차</h2>
                {article.toc.map((item) => (
                  <Link href={`#${item.slug}`} key={item.slug} data-analytics-toc>
                    {item.text}
                  </Link>
                ))}
              </aside>
            )}
          </div>
          <PostShareActions context={analyticsContext} />
          <ArticleNavigationPanel posts={posts} currentSlug={post.slug} />
          <footer className="rounded-blog-article-bottom">
            <span>HOZORICA · BLOG</span>
            <Link href="/blog">전체 글 보기</Link>
          </footer>
        </article>
      </main>
    </div>
  );
}
