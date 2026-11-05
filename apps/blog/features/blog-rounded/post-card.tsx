import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { formatPostDate } from "@/shared/date/date-format";
import {
  blogPreviewPath,
  canOptimizePreviewImage,
  previewImageSizes,
  type PreviewPost,
} from "./preview-model";
import { PostTags } from "./post-tags";

export function PostCard({
  post,
  label,
  priority = false,
}: {
  post: PreviewPost;
  label: string;
  priority?: boolean;
}) {
  return (
    <article className="rounded-blog-card">
      <Link
        href={`${blogPreviewPath}/${post.slug}`}
        className="rounded-blog-card-link"
        prefetch={false}
      >
        <div className="rounded-blog-cover">
          <Image
            src={post.coverImage || "/brand/no-thumbnail.webp"}
            alt=""
            fill
            priority={priority}
            unoptimized={!canOptimizePreviewImage(post.coverImage || "/brand/no-thumbnail.webp")}
            sizes={previewImageSizes}
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
