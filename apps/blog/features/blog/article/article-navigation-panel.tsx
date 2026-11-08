import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { formatPostDate } from "@/shared/date/date-format";
import { getArticleNavigation, type ArticleListEntry } from "./article-navigation";

export function ArticleNavigationPanel({
  posts,
  currentSlug,
  basePath = "/blog",
}: {
  posts: ArticleListEntry[];
  currentSlug: string;
  basePath?: string;
}) {
  const { previous, next, items, total } = getArticleNavigation(posts, currentSlug);
  if (!items.length) return null;

  return (
    <section className="rounded-article-navigation" aria-label="다른 글 탐색">
      {(previous || next) && (
        <nav className="rounded-article-neighbors" aria-label="이전 글과 다음 글">
          {previous ? (
            <Link
              className="rounded-article-neighbor"
              href={`${basePath}/${previous.slug}`}
              prefetch={false}
            >
              <span>
                <ArrowLeft size={15} aria-hidden="true" />
                이전 글
              </span>
              <strong title={previous.title}>{previous.title}</strong>
              <time dateTime={previous.publishedAt}>{formatPostDate(previous.publishedAt)}</time>
            </Link>
          ) : (
            <div className="rounded-article-neighbor is-unavailable">
              <span>이전 글</span>
              <strong>이전 글이 없어요.</strong>
            </div>
          )}
          {next ? (
            <Link
              className="rounded-article-neighbor rounded-article-neighbor--next"
              href={`${basePath}/${next.slug}`}
              prefetch={false}
            >
              <span>
                다음 글<ArrowRight size={15} aria-hidden="true" />
              </span>
              <strong title={next.title}>{next.title}</strong>
              <time dateTime={next.publishedAt}>{formatPostDate(next.publishedAt)}</time>
            </Link>
          ) : (
            <div className="rounded-article-neighbor rounded-article-neighbor--next is-unavailable">
              <span>다음 글</span>
              <strong>가장 최근 글이에요.</strong>
            </div>
          )}
        </nav>
      )}
      <div className="rounded-article-list-heading">
        <h2>
          글 목록<span>{total}</span>
        </h2>
        <Link href={basePath}>
          전체 글 보기
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <ul className="rounded-article-list">
        {items.map((post) => {
          const current = post.slug === currentSlug;
          const content = (
            <>
              <span className="rounded-article-list-title" title={post.title}>
                {post.title}
              </span>
              {current && <span className="rounded-article-current-label">읽는 중</span>}
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            </>
          );
          return (
            <li key={post.slug}>
              {current ? (
                <div className="rounded-article-list-row is-current" aria-current="page">
                  {content}
                </div>
              ) : (
                <Link
                  className="rounded-article-list-row"
                  href={`${basePath}/${post.slug}`}
                  prefetch={false}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
