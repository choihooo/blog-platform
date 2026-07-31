import { Grid2X2, List } from "lucide-react";

import { PostList } from "./components/post-list";
import { getPublishedPosts, listCategories, searchPosts } from "../lib/content-source";

type BlogHomePageProps = {
  searchParams?: Promise<{
    category?: string | string[];
    q?: string | string[];
    view?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function hrefFor(params: { category?: string; q?: string; view?: "tile" | "list" }) {
  const search = new URLSearchParams();
  if (params.category) search.set("category", params.category);
  if (params.q) search.set("q", params.q);
  if (params.view && params.view !== "tile") search.set("view", params.view);
  const query = search.toString();
  return query ? `/?${query}` : "/";
}

export default async function BlogHomePage({ searchParams }: BlogHomePageProps) {
  const defaultSearchParams: BlogHomePageProps["searchParams"] = Promise.resolve({});
  const resolvedSearchParams = await (searchParams ?? defaultSearchParams);
  const activeCategory = firstParam(resolvedSearchParams.category);
  const query = firstParam(resolvedSearchParams.q)?.trim() ?? "";
  const view = firstParam(resolvedSearchParams.view) === "list" ? "list" : "tile";
  const [posts, allPosts, categories] = await Promise.all([
    query
      ? searchPosts({ query, categoryPath: activeCategory, limit: 100 })
      : getPublishedPosts({ categoryPath: activeCategory, limit: 100 }),
    getPublishedPosts({ limit: 100 }),
    listCategories({ depth: 1 }),
  ]);
  const categoryCounts = new Map<string, number>();
  for (const post of allPosts) {
    if (post.category)
      categoryCounts.set(post.category, (categoryCounts.get(post.category) ?? 0) + 1);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
      <section className="mx-auto mb-10 max-w-4xl text-center">
        <form action="/" className="relative mx-auto w-full max-w-xl">
          {activeCategory ? <input name="category" type="hidden" value={activeCategory} /> : null}
          {view === "list" ? <input name="view" type="hidden" value="list" /> : null}
          <input
            aria-label="검색어"
            className="h-14 w-full border border-input bg-background px-5 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
            defaultValue={query}
            name="q"
            placeholder="검색어를 입력하세요"
            type="search"
          />
        </form>
      </section>

      <div className="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside aria-label="카테고리 목록" className="lg:pt-11">
          <h2 className="text-base font-semibold">카테고리</h2>
          <div className="mt-3 h-px bg-border" />
          <nav className="mt-4 flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            <a
              aria-current={!activeCategory ? "page" : undefined}
              className={`whitespace-nowrap text-sm ${
                !activeCategory
                  ? "font-semibold text-primary"
                  : "text-foreground hover:text-primary"
              }`}
              href={hrefFor({ q: query, view })}
            >
              전체보기 <span className="text-muted-foreground">({allPosts.length})</span>
            </a>
            {categories.map((category) => (
              <a
                aria-current={activeCategory === category.slug ? "page" : undefined}
                className={`whitespace-nowrap text-sm ${
                  activeCategory === category.slug
                    ? "font-semibold text-primary"
                    : "text-foreground hover:text-primary"
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

        <section className="min-w-0 space-y-5" aria-label="글 목록">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {posts.length}개의 글{query ? `, "${query}" 검색 결과` : ""}
            </p>
            <div aria-label="보기 방식" className="flex items-center gap-2">
              <a
                aria-label="타일뷰"
                aria-current={view === "tile" ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-md border ${
                  view === "tile"
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
                href={hrefFor({ category: activeCategory, q: query, view: "tile" })}
              >
                <Grid2X2 aria-hidden="true" size={18} />
              </a>
              <a
                aria-label="리스트뷰"
                aria-current={view === "list" ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-md border ${
                  view === "list"
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
                href={hrefFor({ category: activeCategory, q: query, view: "list" })}
              >
                <List aria-hidden="true" size={19} />
              </a>
            </div>
          </div>
          <PostList posts={posts} view={view} />
        </section>
      </div>
    </main>
  );
}
