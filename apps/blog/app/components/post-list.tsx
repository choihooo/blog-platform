import Link from "next/link";
import { Badge, Card, CardContent } from "@blog-platform/design-system";

import type { PublicPost } from "../../lib/content-source";

type PostListProps = {
  posts: PublicPost[];
  view?: "tile" | "list";
};

function PostMeta({ post }: { post: PublicPost }) {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      <time dateTime={post.publishedAt}>{post.publishedAt}</time>
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
          <Badge variant="secondary">{post.categoryEntry.label}</Badge>
        </Link>
      ) : null}
      {post.tagEntries.map((tag) => (
        <Link href={`/tags/${tag.slug}`} key={tag.slug}>
          <Badge variant="outline">{tag.label}</Badge>
        </Link>
      ))}
    </div>
  );
}

function Cover({ post, size }: { post: PublicPost; size: "tile" | "list" }) {
  const className =
    size === "tile"
      ? "aspect-[1.92/1] w-full object-cover"
      : "aspect-[1.45/1] w-full rounded-md object-cover";

  if (post.coverImage) {
    return <img alt={`${post.title} cover`} className={className} src={post.coverImage} />;
  }

  return (
    <div
      className={`${className} flex items-end bg-muted p-4 text-sm font-semibold text-muted-foreground`}
    >
      {post.categoryEntry?.label ?? "Post"}
    </div>
  );
}

function PostTile({ post }: { post: PublicPost }) {
  return (
    <Card className="overflow-hidden transition-transform hover:-translate-y-0.5">
      <Link className="block" href={`/posts/${post.slug}`}>
        <Cover post={post} size="tile" />
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
      <CardContent className="px-5 pb-5 pt-0">
        <PostTaxonomy post={post} />
      </CardContent>
    </Card>
  );
}

function PostListItem({ post }: { post: PublicPost }) {
  return (
    <article className="border-b border-border py-6 last:border-b-0">
      <div className="grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)]">
        <Link href={`/posts/${post.slug}`}>
          <Cover post={post} size="list" />
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
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          공개된 글이 없습니다.
        </CardContent>
      </Card>
    );
  }

  if (view === "tile") {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostTile key={post.path} post={post} />
        ))}
      </div>
    );
  }

  return (
    <div className="border-y border-border">
      {posts.map((post) => (
        <PostListItem key={post.path} post={post} />
      ))}
    </div>
  );
}
