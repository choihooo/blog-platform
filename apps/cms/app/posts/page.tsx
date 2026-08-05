import { Badge, Button, EmptyState } from "@hozui/react";
import { ArrowUpRight, Plus } from "lucide-react";

import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";
import { AccessState, CmsShell } from "../../components/shell/index";
import { listPostSummaries, type PostSummary } from "../../lib/editor/editor-loader";

type PostsPageSearchParams = {
  q?: string | string[];
  page?: string | string[];
  sort?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const POSTS_PER_PAGE = 10;

function parsePage(value: string | undefined) {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function parseSort(value: string | undefined): "published" | "updated" {
  return value === "updated" ? "updated" : "published";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function paginatePosts(posts: PostSummary[], page: number) {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * POSTS_PER_PAGE;

  return {
    currentPage,
    totalPages,
    totalCount: posts.length,
    posts: posts.slice(start, start + POSTS_PER_PAGE),
  };
}

function postsHref(params: { query?: string; page?: number; sort?: "published" | "updated" }) {
  const search = new URLSearchParams();
  if (params.query) search.set("q", params.query);
  if (params.sort === "updated") search.set("sort", params.sort);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/posts?${query}` : "/posts";
}

export function PostsPageView({
  decision,
  posts = [],
  query = "",
  currentPage = 1,
  totalPages = 1,
  totalCount = posts.length,
  sort = "published",
}: {
  decision: AccessDecision;
  posts?: PostSummary[];
  query?: string;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  sort?: "published" | "updated";
}) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <CmsShell activePath="/posts" session={decision.session} title="Posts">
      <section className="space-y-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Content library</p>
            <h2 className="mt-1 text-3xl font-semibold">모든 글</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {query
                ? `"${query}" 검색 결과 ${totalCount}개`
                : `D1 데이터베이스의 초안과 발행 글 ${totalCount}개`}
            </p>
          </div>
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            href="/posts/new"
          >
            <Plus aria-hidden="true" size={16} />새 초안
          </a>
        </div>
        <form action="/posts" className="flex max-w-3xl flex-wrap gap-2">
          <input
            aria-label="Search posts"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={query}
            name="q"
            placeholder="제목, slug, 상태, 본문 검색"
            type="search"
          />
          <select
            aria-label="Sort posts"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            defaultValue={sort}
            name="sort"
          >
            <option value="published">최신순</option>
            <option value="updated">최근 수정순</option>
          </select>
          <Button label="검색" type="submit" variant="secondary" />
          {query ? (
            <a
              className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              href="/posts"
            >
              초기화
            </a>
          ) : null}
        </form>
        <div className="rounded-lg border border-border bg-card">
          {posts.length > 0 ? (
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
                  <th className="min-w-[16rem] whitespace-nowrap px-4 py-3">제목</th>
                  <th className="whitespace-nowrap px-4 py-3">상태</th>
                  <th className="whitespace-nowrap px-4 py-3">발행일</th>
                  <th className="whitespace-nowrap px-4 py-3">수정일</th>
                  <th className="whitespace-nowrap px-4 py-3">경로</th>
                  <th className="whitespace-nowrap px-4 py-3">바로가기</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.path}
                    className="border-b border-border last:border-b-0 hover:bg-muted/60"
                  >
                    <td className="min-w-[16rem] px-4 py-3">
                      <a
                        className="block min-w-0 truncate font-medium"
                        href={`/posts/${post.slug}`}
                      >
                        {post.title}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={post.status} tone="neutral" variant="outline" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {post.path}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        className="inline-flex items-center gap-2 text-muted-foreground transition-transform hover:-translate-y-0.5 hover:translate-x-0.5"
                        href={`/posts/${post.slug}`}
                        aria-label={`${post.title}로 이동`}
                      >
                        열기
                        <ArrowUpRight aria-hidden="true" size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState
              className="px-5 py-14"
              density="compact"
              description={
                query
                  ? "검색어를 바꾸거나 초기화해보세요."
                  : "D1 연결을 확인하거나 첫 초안을 만들어보세요."
              }
              media="icon"
              title="표시할 글이 없습니다."
            />
          )}
        </div>
        {totalCount > POSTS_PER_PAGE ? (
          <nav
            aria-label="글 목록 페이지"
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <p className="text-sm text-muted-foreground">
              {currentPage} / {totalPages} 페이지
            </p>
            <div className="flex items-center gap-2">
              {hasPreviousPage ? (
                <a
                  className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                  href={postsHref({ query, page: currentPage - 1, sort })}
                >
                  이전
                </a>
              ) : (
                <Button disabled label="이전" variant="secondary" />
              )}
              {hasNextPage ? (
                <a
                  className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
                  href={postsHref({ query, page: currentPage + 1, sort })}
                >
                  다음
                </a>
              ) : (
                <Button disabled label="다음" variant="secondary" />
              )}
            </div>
          </nav>
        ) : null}
      </section>
    </CmsShell>
  );
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: Promise<PostsPageSearchParams>;
}) {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({} as PostsPageSearchParams));
  const query = firstParam(resolvedSearchParams.q)?.trim() ?? "";
  const requestedPage = parsePage(firstParam(resolvedSearchParams.page));
  const sort = parseSort(firstParam(resolvedSearchParams.sort));
  const [decision, posts] = await Promise.all([
    requireCmsAccess(),
    listPostSummaries(undefined, { query, sort }),
  ]);
  const pagination = paginatePosts(posts, requestedPage);

  return (
    <PostsPageView
      currentPage={pagination.currentPage}
      decision={decision}
      posts={pagination.posts}
      query={query}
      sort={sort}
      totalCount={pagination.totalCount}
      totalPages={pagination.totalPages}
    />
  );
}
