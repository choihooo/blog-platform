import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { EditorNode, EditorTextNode } from "@blog-platform/editor";
import { Chip, ChipGroup } from "@hozui/react";
import { generateJsonLd, generatePageMetadata } from "@blog-platform/seo-engine";

import { BlogBreadcrumb } from "@/features/blog/components/blog-breadcrumb";
import { CodeCopyButton } from "@/features/blog/components/code-copy-button";
import { PostAnalyticsEvents } from "@/features/blog/components/post-analytics-events";
import { serializeJsonLd } from "@/shared/seo/person-json-ld";
import { PostAuthorMeta } from "@/features/blog/components/post-author-meta";
import { PostShareActions } from "@/features/blog/components/post-share-actions";
import { RecommendedPosts } from "@/features/blog/components/recommended-posts";
import { postToSeoSubject, siteForSeo } from "@/features/blog/lib/seo";
import {
  getPostBySlug,
  getRecommendedPosts,
  getSiteConfig,
} from "@/features/blog/server/content-source";
import { formatPostDateTime } from "@/shared/date/date-format";

export const revalidate = 900;

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function canUseOptimizedImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname === "pub-2eadf17a82cb46679204775b78a2c16a.r2.dev";
  } catch {
    return false;
  }
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function inlineContent(node: EditorTextNode) {
  let content: ReactNode =
    node.marks?.length || node.href ? node.text : renderInlineMarkdown(node.text);
  for (const mark of node.marks ?? []) {
    if (mark === "bold") content = <strong>{content}</strong>;
    if (mark === "italic") content = <em>{content}</em>;
    if (mark === "inlineCode") content = <code>{content}</code>;
  }
  if (node.href) {
    content = <a href={node.href}>{content}</a>;
  }
  return content;
}

function renderInlineMarkdown(text: string) {
  const parts: ReactNode[] = [];
  const inlineMarkdown = /(\*\*([^*]+)\*\*|_([^_]+)_|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineMarkdown.exec(text))) {
    const [raw, , bold, italic, code, label, href] = match;
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    const key = `${match.index}-${raw}`;

    if (bold) parts.push(<strong key={key}>{bold}</strong>);
    else if (italic) parts.push(<em key={key}>{italic}</em>);
    else if (code) parts.push(<code key={key}>{code}</code>);
    else if (label && href)
      parts.push(
        <a href={href} key={key}>
          {label}
        </a>,
      );

    cursor = match.index + raw.length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length > 0 ? parts : text;
}

function PostBodyRenderer({
  analyticsContext,
  nodes,
}: {
  analyticsContext: Parameters<typeof CodeCopyButton>[0]["context"];
  nodes: EditorNode[];
}) {
  const seen = new Map<string, number>();
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === "horizontalRule") return <hr key={index} />;
        if (node.type === "image") {
          return (
            <figure key={index}>
              <img
                alt={node.alt ?? ""}
                decoding="async"
                loading="lazy"
                src={node.src}
                title={node.title}
              />
              {node.caption ? <figcaption>{node.caption}</figcaption> : null}
            </figure>
          );
        }
        if (node.type === "heading") {
          const base = slugify(node.text);
          const count = seen.get(base) ?? 0;
          seen.set(base, count + 1);
          const id = count === 0 ? base : `${base}-${count + 1}`;
          const content = inlineContent(node);
          if (node.depth === 1)
            return (
              <h1 id={id} key={index}>
                {content}
              </h1>
            );
          if (node.depth === 3)
            return (
              <h3 id={id} key={index}>
                {content}
              </h3>
            );
          if (node.depth === 4)
            return (
              <h4 id={id} key={index}>
                {content}
              </h4>
            );
          if (node.depth === 5)
            return (
              <h5 id={id} key={index}>
                {content}
              </h5>
            );
          if (node.depth === 6)
            return (
              <h6 id={id} key={index}>
                {content}
              </h6>
            );
          return (
            <h2 id={id} key={index}>
              {content}
            </h2>
          );
        }
        if (node.type === "blockquote")
          return <blockquote key={index}>{inlineContent(node)}</blockquote>;
        if (node.type === "codeBlock") {
          return (
            <div className="group relative" key={index}>
              <div className="absolute right-3 top-3 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                <CodeCopyButton
                  context={analyticsContext}
                  target={`code-${index}`}
                  text={node.text}
                />
              </div>
              <pre>
                <code>{node.text}</code>
              </pre>
            </div>
          );
        }
        if (node.type === "bulletList")
          return (
            <ul key={index}>
              <li>{inlineContent(node)}</li>
            </ul>
          );
        if (node.type === "orderedList")
          return (
            <ol key={index}>
              <li>{inlineContent(node)}</li>
            </ol>
          );
        return <p key={index}>{inlineContent(node)}</p>;
      })}
    </>
  );
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
    <main className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12">
      <PostAnalyticsEvents context={analyticsContext} />
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        type="application/ld+json"
      />
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
            <h1 className="text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-6 text-muted-foreground">
              <time dateTime={post.publishedAt}>{formatPostDateTime(post.publishedAt)}</time>
              <span>{post.readingTimeLabel}</span>
              <PostAuthorMeta author={author} size="md" />
            </div>
            <ChipGroup aria-label="글 분류" className="flex flex-wrap gap-2">
              {post.categoryEntry ? (
                <Link href={`/blog/categories/${post.categoryEntry.slug}`}>
                  <Chip label={post.categoryEntry.label} size="sm" tone="accent" />
                </Link>
              ) : null}
              {post.tagEntries.map((tag) => (
                <Link href={`/blog/tags/${tag.slug}`} key={tag.slug}>
                  <Chip label={tag.label} size="sm" tone="neutral" />
                </Link>
              ))}
            </ChipGroup>
          </header>
          <div
            className="prose"
            data-analytics-category={post.category}
            data-analytics-slug={post.slug}
          >
            <PostBodyRenderer analyticsContext={analyticsContext} nodes={post.bodyNodes} />
          </div>
          <RecommendedPosts analyticsContext={analyticsContext} posts={recommendedPosts} />
          <PostShareActions context={analyticsContext} />
        </div>
        {post.toc.length > 0 ? (
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
