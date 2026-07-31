import Link from "next/link";

import type { PublicPost } from "../../lib/content-source";
import { formatPostDate } from "../../lib/date-format";

type RecommendedPostsProps = {
  posts: PublicPost[];
};

function RecommendedPostCover({ post }: { post: PublicPost }) {
  const className = "aspect-[1.65/1] w-full object-cover";

  if (post.coverImage) {
    return <img alt="" className={className} src={post.coverImage} />;
  }

  return (
    <div className={`${className} flex items-end bg-muted p-4 text-sm text-muted-foreground`}>
      {post.categoryEntry?.label ?? "Post"}
    </div>
  );
}

export function RecommendedPosts({ posts }: RecommendedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-8" aria-labelledby="recommended-posts">
      <h2 id="recommended-posts" className="text-2xl font-semibold tracking-normal">
        추천글
      </h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            className="group block overflow-hidden bg-card shadow-sm transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
            href={`/posts/${post.slug}`}
            key={post.path}
          >
            <RecommendedPostCover post={post} />
            <div className="grid gap-3 p-4">
              <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-normal group-hover:text-primary">
                {post.title}
              </h3>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm leading-6 text-muted-foreground">
                <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                <span>{post.readingTimeLabel}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
