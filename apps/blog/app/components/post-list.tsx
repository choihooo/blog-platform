import Link from "next/link";
import Image from "next/image";
import { AspectRatio, Chip, ChipGroup, EmptyState } from "@hozui/react";

import type { PublicPost } from "../../lib/content-source";
import { formatPostDate } from "../../lib/date-format";

type PostListProps = {
  posts: PublicPost[];
  view?: "tile" | "list";
};

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

function PostTaxonomy({ post }: { post: PublicPost }) {
  return (
    <ChipGroup aria-label={`${post.title} taxonomy`} className="flex flex-wrap gap-2">
      {post.categoryEntry ? (
        <Link href={`/categories/${post.categoryEntry.slug}`}>
          <Chip label={post.categoryEntry.label} size="sm" tone="accent" />
        </Link>
      ) : null}
      {post.tagEntries.map((tag) => (
        <Link href={`/tags/${tag.slug}`} key={tag.slug}>
          <Chip label={tag.label} size="sm" tone="neutral" />
        </Link>
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
  const className = size === "tile" ? "w-full" : "w-full sm:h-full sm:min-h-40";

  if (post.coverImage) {
    if (!canUseOptimizedImage(post.coverImage)) {
      return (
        <AspectRatio className={className} ratio={1.91}>
          <img
            alt={`${post.title} cover`}
            className="h-full w-full object-cover"
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            src={post.coverImage}
          />
        </AspectRatio>
      );
    }

    return (
      <AspectRatio className={className} ratio={1.91}>
        <Image
          alt={`${post.title} cover`}
          className="object-cover"
          fill
          fetchPriority={priority ? "high" : "auto"}
          priority={priority}
          sizes={
            size === "tile"
              ? "(min-width: 640px) 50vw, calc(100vw - 40px)"
              : "(min-width: 640px) 176px, calc(100vw - 40px)"
          }
          src={post.coverImage}
        />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio className={className} ratio={1.91}>
      <Image
        alt=""
        className="object-cover"
        fill
        fetchPriority={priority ? "high" : "auto"}
        priority={priority}
        sizes={
          size === "tile"
            ? "(min-width: 640px) 50vw, calc(100vw - 40px)"
            : "(min-width: 640px) 176px, calc(100vw - 40px)"
        }
        src="/brand/no-thumbnail.webp"
      />
    </AspectRatio>
  );
}

function PostTile({ post, priority }: { post: PublicPost; priority?: boolean }) {
  return (
    <article className="flex h-full flex-col overflow-hidden bg-card shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md">
      <Link className="block flex-1" href={`/posts/${post.slug}`}>
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
      </Link>
      <div className="mt-auto px-5 pb-5 pt-0">
        <PostTaxonomy post={post} />
      </div>
    </article>
  );
}

function PostListItem({ post, priority }: { post: PublicPost; priority?: boolean }) {
  return (
    <article className="border-b border-border py-4 last:border-b-0">
      <div className="grid gap-4 sm:min-h-40 sm:grid-cols-[13.5rem_minmax(0,1fr)] sm:items-stretch">
        <Link className="block h-full" href={`/posts/${post.slug}`}>
          <Cover post={post} priority={priority} size="list" />
        </Link>
        <div className="flex min-w-0 flex-col py-1 sm:min-h-40">
          <PostMeta post={post} />
          <h3 className="mt-3 truncate text-2xl font-semibold tracking-normal">
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h3>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-2 max-w-[64ch] text-sm leading-5 text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-auto pt-3">
            <PostTaxonomy post={post} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function PostList({ posts, view = "list" }: PostListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        className="bg-card shadow-sm"
        density="compact"
        description="발행된 글이 생기면 이 목록에 표시됩니다."
        media="icon"
        title="공개된 글이 없습니다."
      />
    );
  }

  if (view === "tile") {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post, index) => (
          <PostTile key={post.path} post={post} priority={index === 0} />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card shadow-sm">
      {posts.map((post, index) => (
        <PostListItem key={post.path} post={post} priority={index === 0} />
      ))}
    </div>
  );
}
