import { Badge } from "@blog-platform/design-system";
import {
  ChevronDown,
  ExternalLink,
  GitBranch,
  Globe2,
  GripVertical,
  Save,
  ShieldCheck,
  Tags,
} from "lucide-react";

import siteConfig from "../../../../content/site.json";

import {
  createCategoryAction,
  createTagAction,
  updateCategoryAction,
} from "../actions/taxonomy-actions";
import { AccessState, CmsShell } from "../../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";
import { createContentAdapter } from "../../lib/content-adapter/content-adapter";
import type {
  CategoryRecord,
  TagRecord,
} from "../../lib/content-adapter/content-adapter.interface";

type TaxonomyData = {
  categories: CategoryWithCount[];
  tags: TagRecord[];
};

type CategoryWithCount = CategoryRecord & { postCount?: number };

function categoryTree(categories: CategoryWithCount[]) {
  const parents = categories
    .filter((category) => category.depth === 1)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const children = categories
    .filter((category) => category.depth === 2)
    .sort((a, b) => a.slug.localeCompare(b.slug));
  return parents.map((parent) => ({
    parent,
    children: children.filter((child) => child.parentSlug === parent.slug),
  }));
}

export function SettingsPageView({
  decision,
  taxonomy = { categories: [], tags: [] },
}: {
  decision: AccessDecision;
  taxonomy?: TaxonomyData;
}) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }
  const tree = categoryTree(taxonomy.categories);

  return (
    <CmsShell activePath="/settings" session={decision.session} title="Settings">
      <div className="max-w-5xl space-y-9">
        <section>
          <p className="text-sm font-medium text-muted-foreground">Configuration</p>
          <h2 className="mt-1 text-3xl font-semibold">사이트 설정</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            현재 production에 연결된 사이트, GitHub 저장소, 관리자 정보를 확인합니다. 변경은
            저장소의 content/site.json에서 관리합니다.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Globe2 aria-hidden="true" size={17} />
              Public site
            </div>
            <p className="mt-5 text-lg font-semibold">{siteConfig.siteName}</p>
            <a
              className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              href={siteConfig.siteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {siteConfig.siteUrl}
              <ExternalLink aria-hidden="true" size={13} />
            </a>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <GitBranch aria-hidden="true" size={17} />
              Content repository
            </div>
            <p className="mt-5 font-mono text-sm">
              {siteConfig.github.owner}/{siteConfig.github.repo}
            </p>
            <div className="mt-2">
              <Badge variant="secondary">{siteConfig.github.branch}</Badge>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck aria-hidden="true" size={17} />
              CMS administrator
            </div>
            <p className="mt-5 font-medium">@{siteConfig.adminGithubLogin}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              GitHub user ID {siteConfig.adminGithubUserId}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm font-semibold">Analytics</p>
            <p className="mt-5 text-sm">{siteConfig.analytics.provider.toUpperCase()}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {siteConfig.analytics.ga4PropertyId === "replace-me"
                ? "GA4 property is not configured"
                : siteConfig.analytics.ga4PropertyId}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Tags aria-hidden="true" size={17} />
              Categories
            </div>
            <div className="mt-5 grid gap-3 border-b border-border pb-5 lg:grid-cols-2">
              <form action={createCategoryAction} className="grid gap-3">
                <p className="text-xs font-semibold text-muted-foreground">1차 카테고리 추가</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    name="name"
                    placeholder="이름"
                  />
                  <input
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    name="slug"
                    placeholder="slug"
                  />
                </div>
                <button
                  className="w-fit rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background"
                  type="submit"
                >
                  Add parent
                </button>
              </form>
              <form action={createCategoryAction} className="grid gap-3">
                <p className="text-xs font-semibold text-muted-foreground">2차 카테고리 추가</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <select
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    name="parentSlug"
                  >
                    <option value="">상위</option>
                    {tree.map(({ parent }) => (
                      <option key={parent.slug} value={parent.slug}>
                        {parent.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    name="name"
                    placeholder="이름"
                  />
                  <input
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                    name="childSlug"
                    placeholder="child-slug"
                  />
                </div>
                <button
                  className="w-fit rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background"
                  type="submit"
                >
                  Add child
                </button>
              </form>
            </div>
            <div className="mt-5 overflow-hidden rounded-md border border-border">
              <div className="grid grid-cols-[3.5rem_3rem_minmax(0,1.4fr)_minmax(0,1fr)_5rem] border-b border-border bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
                <span />
                <span />
                <span>카테고리</span>
                <span>상위</span>
                <span className="text-right">저장</span>
              </div>
              {tree.length > 0 ? (
                tree.map(({ parent, children }) => (
                  <div key={parent.id}>
                    <form
                      action={updateCategoryAction}
                      className="grid min-h-14 grid-cols-[3.5rem_3rem_minmax(0,1.4fr)_minmax(0,1fr)_5rem] items-center border-b border-border px-3 py-2 text-sm"
                    >
                      <input name="categoryId" type="hidden" value={parent.id} />
                      <input name="depth" type="hidden" value="1" />
                      <div className="flex items-center text-muted-foreground">
                        {children.length > 0 ? (
                          <ChevronDown size={16} />
                        ) : (
                          <span className="pl-1">•</span>
                        )}
                      </div>
                      <GripVertical className="text-muted-foreground" size={16} />
                      <div className="grid gap-1 pr-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <input
                          className="min-w-0 bg-transparent text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          defaultValue={parent.name}
                          name="name"
                        />
                        <input
                          className="min-w-0 bg-transparent font-mono text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          defaultValue={parent.slug}
                          name="slug"
                        />
                        <span className="text-xs text-muted-foreground sm:col-span-2">
                          ({parent.postCount ?? 0})
                        </span>
                      </div>
                      <span className="border-l border-border pl-5 text-muted-foreground">-</span>
                      <button
                        aria-label={`${parent.name} 저장`}
                        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                        type="submit"
                      >
                        <Save aria-hidden="true" size={15} />
                      </button>
                    </form>
                    {children.map((child) => {
                      const childSlug = child.slug.split("/").at(-1) ?? child.slug;
                      return (
                        <form
                          action={updateCategoryAction}
                          className="grid min-h-14 grid-cols-[3.5rem_3rem_minmax(0,1.4fr)_minmax(0,1fr)_5rem] items-center border-b border-border bg-muted/25 px-3 py-2 text-sm last:border-b-0"
                          key={child.id}
                        >
                          <input name="categoryId" type="hidden" value={child.id} />
                          <input name="depth" type="hidden" value="2" />
                          <span className="pl-1 text-muted-foreground">•</span>
                          <GripVertical className="text-muted-foreground" size={16} />
                          <div className="grid gap-1 pr-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                            <input
                              className="min-w-0 bg-transparent text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue={child.name}
                              name="name"
                            />
                            <input
                              className="min-w-0 bg-transparent font-mono text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue={childSlug}
                              name="childSlug"
                            />
                            <span className="text-xs text-muted-foreground sm:col-span-2">
                              ({child.postCount ?? 0})
                            </span>
                          </div>
                          <select
                            className="border-l border-border bg-transparent pl-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            defaultValue={child.parentSlug ?? ""}
                            name="parentSlug"
                          >
                            {tree.map(({ parent: option }) => (
                              <option key={option.slug} value={option.slug}>
                                {option.name}
                              </option>
                            ))}
                          </select>
                          <button
                            aria-label={`${child.name} 저장`}
                            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
                            type="submit"
                          >
                            <Save aria-hidden="true" size={15} />
                          </button>
                        </form>
                      );
                    })}
                  </div>
                ))
              ) : (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No categories yet.
                </p>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Tags aria-hidden="true" size={17} />
              Tags
            </div>
            <form action={createTagAction} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Name
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  name="name"
                  placeholder="MDX"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Slug
                <input
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  name="slug"
                  placeholder="mdx"
                />
              </label>
              <button
                className="w-fit rounded-md bg-foreground px-3 py-2 text-sm font-semibold text-background"
                type="submit"
              >
                Add tag
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {taxonomy.tags.length > 0 ? (
                taxonomy.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name} / {tag.slug}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No tags yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </CmsShell>
  );
}

export default function SettingsPage() {
  return requireCmsAccess().then(async (decision) => {
    if (decision.status !== "authorized") return <SettingsPageView decision={decision} />;
    const adapter = createContentAdapter("d1r2");
    const [depth1, depth2, tags, posts] = await Promise.all([
      adapter.listCategories({ depth: 1 }),
      adapter.listCategories({ depth: 2 }),
      adapter.listTags(),
      adapter.listPosts({ publishedOnly: false, page: 1, limit: 100 }),
    ]);
    const categoryCounts = new Map<string, number>();
    if (posts.ok) {
      for (const post of posts.data.items) {
        if (!post.categoryPath) continue;
        categoryCounts.set(post.categoryPath, (categoryCounts.get(post.categoryPath) ?? 0) + 1);
        const parentSlug = post.categoryPath.split("/")[0];
        if (parentSlug) {
          categoryCounts.set(parentSlug, (categoryCounts.get(parentSlug) ?? 0) + 1);
        }
      }
    }
    const categories = [
      ...(depth1.ok ? depth1.data.items : []),
      ...(depth2.ok ? depth2.data.items : []),
    ].map((category) => ({
      ...category,
      postCount: categoryCounts.get(category.slug) ?? 0,
    }));
    return (
      <SettingsPageView
        decision={decision}
        taxonomy={{
          categories,
          tags: tags.ok ? tags.data.items : [],
        }}
      />
    );
  });
}
