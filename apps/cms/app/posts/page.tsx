import { Badge } from "@blog-platform/design-system";
import { CalendarDays, Grid2X2, List, Plus, Search } from "lucide-react";

import bundledCategories from "../../../../content/categories.json";

import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";
import { AccessState, CmsShell } from "../../components/shell/index";
import { listPostSummaries, type PostSummary } from "../../lib/editor/editor-loader";

type CategorySummary = {
  slug: string;
  label: string;
  description?: string;
};

type PostsPageSearchParams = {
  category?: string | string[];
  q?: string | string[];
  view?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function postMatchesQuery(post: PostSummary, query: string) {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  return [post.title, post.excerpt, post.path, post.category]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery));
}

function formatPostDate(post: PostSummary) {
  const value = post.publishedAt ?? post.updatedAt;
  if (!value) return "날짜 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function hrefFor(params: { category?: string; q?: string; view?: "tile" | "list" }) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.view && params.view !== "tile") search.set("view", params.view);
  const query = search.toString();
  return query ? `/posts?${query}` : "/posts";
}

function categoryLabel(categories: CategorySummary[], slug?: string) {
  return categories.find((category) => category.slug === slug)?.label ?? slug ?? "미분류";
}

function PostTile({ categories, post }: { categories: CategorySummary[]; post: PostSummary }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-transform hover:-translate-y-0.5">
      <a className="block" href={`/posts/${post.slug}`}>
        {post.coverImage ? (
          <img
            alt={`${post.title} cover`}
            className="aspect-[1.85/1] w-full object-cover"
            src={post.coverImage}
          />
        ) : (
          <div className="flex aspect-[1.85/1] items-end bg-[linear-gradient(135deg,#f4f6f5_0%,#dfe7e2_52%,#b8d8c8_100%)] p-5">
            <span className="text-sm font-semibold text-emerald-800">
              {categoryLabel(categories, post.category)}
            </span>
          </div>
        )}
        <div className="space-y-4 p-5">
          <div>
            <h3 className="line-clamp-2 text-xl font-semibold tracking-[-0.01em] text-foreground">
              {post.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {post.excerpt ?? post.path}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{post.status}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays aria-hidden="true" size={14} />
              {formatPostDate(post)}
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}

function PostListItem({ categories, post }: { categories: CategorySummary[]; post: PostSummary }) {
  return (
    <article className="border-b border-border py-6 last:border-b-0">
      <a
        className="grid gap-5 transition-colors hover:text-emerald-700 sm:grid-cols-[10rem_minmax(0,1fr)]"
        href={`/posts/${post.slug}`}
      >
        {post.coverImage ? (
          <img
            alt={`${post.title} cover`}
            className="aspect-[1.45/1] w-full rounded-md object-cover"
            src={post.coverImage}
          />
        ) : (
          <div className="flex aspect-[1.45/1] items-end rounded-md bg-[linear-gradient(135deg,#f4f6f5_0%,#dfe7e2_52%,#b8d8c8_100%)] p-3">
            <span className="text-xs font-semibold text-emerald-800">
              {categoryLabel(categories, post.category)}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{post.status}</Badge>
            <span className="text-xs text-muted-foreground">{formatPostDate(post)}</span>
          </div>
          <h3 className="mt-3 truncate text-xl font-semibold text-foreground">{post.title}</h3>
          <p className="mt-2 line-clamp-2 max-w-[64ch] text-sm leading-6 text-muted-foreground">
            {post.excerpt ?? post.path}
          </p>
        </div>
      </a>
    </article>
  );
}

export function PostsPageView({
  decision,
  posts = [],
  searchParams = {},
}: {
  decision: AccessDecision;
  posts?: PostSummary[];
  searchParams?: PostsPageSearchParams;
}) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  const categories = bundledCategories satisfies CategorySummary[];
  const activeCategory = firstParam(searchParams.category);
  const query = firstParam(searchParams.q)?.trim() ?? "";
  const view = firstParam(searchParams.view) === "list" ? "list" : "tile";
  const categoryCounts = new Map<string, number>();
  for (const post of posts) {
    if (post.category) {
      categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
    }
  }
  const filteredPosts = posts.filter(
    (post) =>
      (!activeCategory || post.category === activeCategory) && postMatchesQuery(post, query),
  );

  return (
    <CmsShell activePath="/posts" session={decision.session} title="Posts">
      <section className="space-y-8">
        <header className="mx-auto flex w-full max-w-5xl flex-col items-center gap-7 pt-2 text-center">
          <nav
            aria-label="Posts sections"
            className="flex items-center gap-12 text-lg font-semibold"
          >
            <a className="border-b-2 border-emerald-500 px-6 pb-3 text-emerald-500" href="/posts">
              글
            </a>
            <span className="px-6 pb-3 text-muted-foreground">시리즈</span>
            <span className="px-6 pb-3 text-muted-foreground">소개</span>
          </nav>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <form action="/posts" className="relative w-full sm:max-w-xl">
              {activeCategory ? (
                <input name="category" type="hidden" value={activeCategory} />
              ) : null}
              {view === "list" ? <input name="view" type="hidden" value="list" /> : null}
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={22}
              />
              <input
                aria-label="검색어"
                className="h-14 w-full rounded-none border border-input bg-background pl-14 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-emerald-500"
                defaultValue={query}
                name="q"
                placeholder="검색어를 입력하세요"
                type="search"
              />
            </form>
            <a
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
              href="/posts/new"
            >
              <Plus aria-hidden="true" size={16} />새 초안
            </a>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
          <aside aria-label="카테고리 목록" className="lg:pt-12">
            <h2 className="text-base font-semibold">카테고리</h2>
            <div className="mt-3 h-px bg-border" />
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              <a
                aria-current={!activeCategory ? "page" : undefined}
                className={`whitespace-nowrap text-sm font-medium ${
                  !activeCategory ? "text-emerald-500" : "text-foreground hover:text-emerald-600"
                }`}
                href={hrefFor({ q: query, view })}
              >
                전체보기 <span className="text-muted-foreground">({posts.length})</span>
              </a>
              {categories.map((category) => (
                <a
                  aria-current={activeCategory === category.slug ? "page" : undefined}
                  className={`whitespace-nowrap text-sm ${
                    activeCategory === category.slug
                      ? "font-semibold text-emerald-500"
                      : "text-foreground hover:text-emerald-600"
                  }`}
                  href={hrefFor({ category: category.slug, q: query, view })}
                  key={category.slug}
                >
                  {category.label}{" "}
                  <span className="text-muted-foreground">
                    ({categoryCounts.get(category.slug) ?? 0})
                  </span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {filteredPosts.length}개의 글{query ? `, "${query}" 검색 결과` : ""}
              </p>
              <div aria-label="보기 방식" className="flex items-center gap-1">
                <a
                  aria-current={view === "tile" ? "page" : undefined}
                  aria-label="타일뷰"
                  className={`grid size-10 place-items-center rounded-md border transition-colors ${
                    view === "tile"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  href={hrefFor({ category: activeCategory, q: query, view: "tile" })}
                >
                  <Grid2X2 aria-hidden="true" size={18} />
                </a>
                <a
                  aria-current={view === "list" ? "page" : undefined}
                  aria-label="리스트뷰"
                  className={`grid size-10 place-items-center rounded-md border transition-colors ${
                    view === "list"
                      ? "border-emerald-500 text-emerald-600"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                  href={hrefFor({ category: activeCategory, q: query, view: "list" })}
                >
                  <List aria-hidden="true" size={19} />
                </a>
              </div>
            </div>

            {filteredPosts.length > 0 ? (
              view === "tile" ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredPosts.map((post) => (
                    <PostTile categories={categories} key={post.path} post={post} />
                  ))}
                </div>
              ) : (
                <div className="border-y border-border">
                  {filteredPosts.map((post) => (
                    <PostListItem categories={categories} key={post.path} post={post} />
                  ))}
                </div>
              )
            ) : (
              <div className="border-y border-border px-5 py-16 text-center">
                <p className="font-medium">표시할 글이 없습니다.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  검색어를 바꾸거나 다른 카테고리를 선택해보세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </CmsShell>
  );
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: Promise<PostsPageSearchParams>;
}) {
  const [decision, posts, resolvedSearchParams] = await Promise.all([
    requireCmsAccess(),
    listPostSummaries(),
    searchParams ?? Promise.resolve({}),
  ]);
  return <PostsPageView decision={decision} posts={posts} searchParams={resolvedSearchParams} />;
}
