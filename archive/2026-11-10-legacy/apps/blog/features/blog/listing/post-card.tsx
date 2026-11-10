import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { formatPostDate } from "@/shared/date/date-format";
import { canOptimizePostImage, postImageSizes, type PostSummary } from "../model/post-summary";
import { PostTags } from "../article/post-tags";

export function PostCard({
  post,
  label,
  priority = false,
  basePath = "/blog",
}: {
  post: PostSummary;
  label: string;
  priority?: boolean;
  basePath?: string;
}) {
  return (
    <article className="rounded-blog-card">
      <Link href={`${basePath}/${post.slug}`} className="rounded-blog-card-link" prefetch={false}>
        <div className="rounded-blog-cover">
          <Image
            src={post.coverImage || "/brand/no-thumbnail.webp"}
            alt=""
            fill
            priority={priority}
            unoptimized={!canOptimizePostImage(post.coverImage || "/brand/no-thumbnail.webp")}
            sizes={postImageSizes}
          />
        </div>
        <div className="rounded-blog-card-copy">
          <div className="rounded-blog-card-top">
            <div className="rounded-blog-taxonomy">
              <span className="rounded-blog-badge">{label}</span>
              <PostTags tags={post.tagEntries} />
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </div>
          <h3 title={post.title}>{post.title}</h3>
          {post.excerpt && <p className="rounded-blog-excerpt">{post.excerpt}</p>}
          <div className="rounded-blog-card-meta">
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTimeLabel}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
