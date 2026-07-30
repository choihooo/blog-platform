import Link from "next/link";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@blog-platform/design-system";

import type { PublicPost } from "../../lib/content-source";

type PostListProps = {
  posts: PublicPost[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground">
          공개된 글이 없습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Card key={post.path}>
          <CardHeader>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              <span>{post.readingTimeLabel}</span>
              {post.authorProfile ? <span>{post.authorProfile.name}</span> : null}
            </div>
            <CardTitle className="text-2xl">
              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
            </CardTitle>
            {post.excerpt ? <CardDescription>{post.excerpt}</CardDescription> : null}
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
