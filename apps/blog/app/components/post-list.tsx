import Link from "next/link";

import type { PublicPost } from "../../lib/content";

type PostListProps = {
  posts: PublicPost[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="empty">공개된 글이 없습니다.</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <article className="post-card" key={post.path}>
          <div className="meta">
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            <span>{post.readingTimeLabel}</span>
            {post.authorProfile ? <span>{post.authorProfile.name}</span> : null}
          </div>
          <h2>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          <div className="taxonomy">
            {post.categoryEntry ? (
              <Link className="pill" href={`/categories/${post.categoryEntry.slug}`}>
                {post.categoryEntry.label}
              </Link>
            ) : null}
            {post.tagEntries.map((tag) => (
              <Link className="pill" href={`/tags/${tag.slug}`} key={tag.slug}>
                {tag.label}
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
