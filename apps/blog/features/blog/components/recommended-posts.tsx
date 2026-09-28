import Image from "next/image";
import { Chip, ChipGroup } from "@hozui/react";
import { BookOpen } from "lucide-react";

import { formatPostDate } from "@/shared/date/date-format";
import type { PublicPost } from "../server/content-source";
import type { PostAnalyticsContext } from "./post-analytics-events";
import { AnalyticsLink } from "./analytics-link";

type RecommendedPostsProps = {
  analyticsContext?: PostAnalyticsContext;
  posts: PublicPost[];
  replaceLinks?: boolean;
};

function canUseOptimizedImage(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return new URL(src).hostname === "pub-2eadf17a82cb46679204775b78a2c16a.r2.dev";
  } catch {
    return false;
  }
}

function RecommendedPostCover({ post }: { post: PublicPost }) {
  const className = "relative aspect-[1.91/1] w-full overflow-hidden";

  if (post.coverImage) {
    if (!canUseOptimizedImage(post.coverImage)) {
      return <img alt="" className={`${className} object-cover`} src={post.coverImage} />;
    }

    return (
      <div className={className}>
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 40px)"
          src={post.coverImage}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Image
        alt=""
        className="object-cover"
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, calc(100vw - 40px)"
        src="/brand/no-thumbnail.webp"
      />
    </div>
  );
}

export function RecommendedPosts({
  analyticsContext,
  posts,
  replaceLinks = false,
}: RecommendedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section
      className="blog-detail__recommended mt-16 border-t border-border pt-8"
      aria-labelledby="recommended-posts"
    >
      <h2
        id="recommended-posts"
        className="blog-detail__section-title text-2xl font-semibold tracking-normal"
      >
        <BookOpen aria-hidden="true" size={22} /> 추천글
      </h2>
      <div className="blog-detail__recommended-grid mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <AnalyticsLink
            analyticsContext={analyticsContext}
            className="blog-detail__recommended-card group block overflow-hidden bg-card shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
            eventName="recommended_post_click"
            href={`/blog/${post.slug}`}
            key={post.path}
            replace={replaceLinks}
            target={post.slug}
          >
            <div className="blog-detail__recommended-cover">
              <RecommendedPostCover post={post} />
            </div>
            <div className="blog-detail__recommended-copy grid gap-3 p-4">
              <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-normal group-hover:text-primary">
                {post.title}
              </h3>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm leading-6 text-muted-foreground">
                <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                <span>{post.readingTimeLabel}</span>
              </div>
              {post.categoryEntry || post.tagEntries.length > 0 ? (
                <ChipGroup aria-label={`${post.title} taxonomy`} className="flex flex-wrap gap-2">
                  {post.categoryEntry ? (
                    <Chip label={post.categoryEntry.label} size="sm" tone="accent" />
                  ) : null}
                  {post.tagEntries.slice(0, 2).map((tag) => (
                    <Chip key={tag.slug} label={tag.label} size="sm" tone="neutral" />
                  ))}
                </ChipGroup>
              ) : null}
            </div>
          </AnalyticsLink>
        ))}
      </div>
    </section>
  );
}
