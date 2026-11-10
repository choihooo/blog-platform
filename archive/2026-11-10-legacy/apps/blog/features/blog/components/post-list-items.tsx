import Image from "next/image";
import { Chip, ChipGroup } from "@hozui/react";

import { formatPostDate } from "@/shared/date/date-format";
import type { PublicPost } from "../model/public-content";
import type { PostAnalyticsContext } from "./post-analytics-events";
import { AnalyticsLink } from "./analytics-link";

function canUseOptimizedImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname === "pub-2eadf17a82cb46679204775b78a2c16a.r2.dev";
  } catch {
    return false;
  }
}

function PostMeta({ post }: { post: PublicPost }) {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      <span>{post.readingTimeLabel}</span>
      {post.authorProfile ? <span>{post.authorProfile.name}</span> : null}
    </div>
  );
}

function PostTaxonomy({
  analyticsContext,
  post,
}: {
  analyticsContext?: PostAnalyticsContext;
  post: PublicPost;
}) {
  return (
    <ChipGroup aria-label={`${post.title} taxonomy`} className="flex flex-wrap gap-2">
      {post.categoryEntry ? (
        <AnalyticsLink
          analyticsContext={analyticsContext}
          eventName="category_click"
          href={`/blog/categories/${post.categoryEntry.slug}`}
          target={post.categoryEntry.slug}
        >
          <Chip label={post.categoryEntry.label} size="sm" tone="accent" />
        </AnalyticsLink>
      ) : null}
      {post.tagEntries.map((tag) => (
        <AnalyticsLink
          analyticsContext={analyticsContext}
          eventName="tag_click"
          href={`/blog/tags/${tag.slug}`}
          key={tag.slug}
          target={tag.slug}
        >
          <Chip label={tag.label} size="sm" tone="neutral" />
        </AnalyticsLink>
      ))}
    </ChipGroup>
  );
}

function Cover({
  post,
  priority,
  size,
}: {
  post: PublicPost;
  priority?: boolean;
  size: "tile" | "list";
}) {
  const className =
    size === "tile"
      ? "relative aspect-[1.91/1] w-full overflow-hidden"
      : "relative h-40 w-full overflow-hidden rounded-md sm:h-full sm:min-h-40";

  if (post.coverImage && !canUseOptimizedImage(post.coverImage)) {
    return (
      <img
        alt={`${post.title} cover`}
        className={`${className} object-cover`}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        src={post.coverImage}
      />
    );
  }

  return (
    <div className={className}>
      <Image
        alt={post.coverImage ? `${post.title} cover` : ""}
        className="object-cover"
        fill
        fetchPriority={priority ? "high" : "auto"}
        priority={priority}
        sizes={
          size === "tile"
            ? "(min-width: 640px) 50vw, calc(100vw - 40px)"
            : "(min-width: 640px) 176px, calc(100vw - 40px)"
        }
        src={post.coverImage ?? "/brand/no-thumbnail.webp"}
      />
    </div>
  );
}

type PostItemProps = {
  analyticsContext?: PostAnalyticsContext;
  post: PublicPost;
  postClickEvent?: "post_card_click" | "search_result_click";
  priority?: boolean;
};

export function PostTile({
  analyticsContext,
  post,
  postClickEvent = "post_card_click",
  priority,
}: PostItemProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden bg-card shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md">
      <AnalyticsLink
        analyticsContext={analyticsContext}
        className="block flex-1"
        eventName={postClickEvent}
        href={`/blog/${post.slug}`}
        target={post.slug}
      >
        <Cover post={post} priority={priority} size="tile" />
        <div className="grid gap-4 p-5">
          <PostMeta post={post} />
          <div>
            <h3 className="line-clamp-2 text-2xl font-semibold tracking-normal">{post.title}</h3>
            {post.excerpt ? (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </div>
      </AnalyticsLink>
      <div className="mt-auto px-5 pb-5 pt-0">
        <PostTaxonomy analyticsContext={analyticsContext} post={post} />
      </div>
    </article>
  );
}

export function PostListItem({
  analyticsContext,
  post,
  postClickEvent = "post_card_click",
  priority,
}: PostItemProps) {
  return (
    <article className="border-b border-border last:border-b-0">
      <div className="grid gap-4 sm:min-h-40 sm:grid-cols-[13.5rem_minmax(0,1fr)] sm:items-stretch">
        <AnalyticsLink
          analyticsContext={analyticsContext}
          className="block h-full"
          eventName={postClickEvent}
          href={`/blog/${post.slug}`}
          target={post.slug}
        >
          <Cover post={post} priority={priority} size="list" />
        </AnalyticsLink>
        <div className="flex min-w-0 flex-col py-3 sm:min-h-40">
          <PostMeta post={post} />
          <h3 className="mt-3 truncate text-2xl font-semibold tracking-normal">
            <AnalyticsLink
              analyticsContext={analyticsContext}
              eventName={postClickEvent}
              href={`/blog/${post.slug}`}
              target={post.slug}
            >
              {post.title}
            </AnalyticsLink>
          </h3>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-2 max-w-[64ch] text-sm leading-5 text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-auto pt-3">
            <PostTaxonomy analyticsContext={analyticsContext} post={post} />
          </div>
        </div>
      </div>
    </article>
  );
}
