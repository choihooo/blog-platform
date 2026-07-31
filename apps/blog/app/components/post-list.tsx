import Link from "next/link";
import Image from "next/image";
import { Badge, Card, CardContent } from "@blog-platform/design-system";

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
    <div className="flex flex-wrap gap-2">
      {post.categoryEntry ? (
        <Link href={`/categories/${post.categoryEntry.slug}`}>
          <Badge className="h-7" variant="secondary">
            {post.categoryEntry.label}
          </Badge>
        </Link>
      ) : null}
      {post.tagEntries.map((tag) => (
        <Link href={`/tags/${tag.slug}`} key={tag.slug}>
          <Badge className="h-7" variant="outline">
            {tag.label}
          </Badge>
        </Link>
      ))}
    </div>
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
      ? "relative aspect-[1.92/1] w-full overflow-hidden"
      : "relative aspect-[1.45/1] w-full overflow-hidden rounded-md";

  if (post.coverImage) {
    if (!canUseOptimizedImage(post.coverImage)) {
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
          alt={`${post.title} cover`}
          className="object-cover"
          fill
          priority={priority}
          sizes={
            size === "tile"
              ? "(min-width: 640px) 50vw, calc(100vw - 40px)"
              : "(min-width: 640px) 176px, calc(100vw - 40px)"
          }
          src={post.coverImage}
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} flex items-end bg-muted p-4 text-sm font-semibold text-muted-foreground`}
    >
      {post.categoryEntry?.label ?? "Post"}
    </div>
  );
}

function PostTile({ post, priority }: { post: PublicPost; priority?: boolean }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-0 bg-card shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md">
      <Link className="block flex-1" href={`/posts/${post.slug}`}>
        <Cover post={post} priority={priority} size="tile" />
        <CardContent className="grid gap-4 p-5">
          <PostMeta post={post} />
          <div>
            <h3 className="line-clamp-2 text-2xl font-semibold tracking-normal">{post.title}</h3>
            {post.excerpt ? (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Link>
      <CardContent className="mt-auto px-5 pb-5 pt-0">
        <PostTaxonomy post={post} />
      </CardContent>
    </Card>
  );
}

function PostListItem({ post, priority }: { post: PublicPost; priority?: boolean }) {
  return (
    <article className="border-b border-border py-6 last:border-b-0">
      <div className="grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <Link href={`/posts/${post.slug}`}>
          <Cover post={post} priority={priority} size="list" />
        </Link>
        <div className="min-w-0">
          <PostMeta post={post} />
          <h3 className="mt-3 truncate text-2xl font-semibold tracking-normal">
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h3>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-2 max-w-[64ch] text-sm leading-6 text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <div className="mt-4">
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
      <Card className="border-0 bg-card shadow-sm">
        <CardContent className="p-6 text-sm text-muted-foreground">
          공개된 글이 없습니다.
        </CardContent>
      </Card>
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
