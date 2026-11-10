import { Badge, EmptyState } from "@hozui/react";
import { ArrowUpRight, FilePenLine, Files, Settings2 } from "lucide-react";

import { AccessState, CmsShell } from "../components/shell/index";
import { listPostSummaries, type PostSummary } from "../features/posts/server/index";
import { requireCmsAccess, type AccessDecision } from "../lib/auth/index";

function postStatusTone(status: PostSummary["status"]) {
  if (status === "published") return "positive";
  if (status === "draft") return "warning";
  return "neutral";
}

export function CmsHomePageView({
  decision,
  posts = [],
}: {
  decision: AccessDecision;
  posts?: PostSummary[];
}) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.length - published;
  const recentPosts = posts.slice(0, 5);

  return (
    <CmsShell activePath="/" session={decision.session} title="Dashboard">
      <div className="space-y-10">
        <section
          aria-label="Content overview"
          className="grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-3"
        >
          {[
            { label: "전체 글", value: posts.length, detail: "저장소에서 확인됨" },
            { label: "발행됨", value: published, detail: "현재 공개 상태" },
            { label: "초안", value: drafts, detail: "작성 또는 검토 중" },
          ].map((item) => (
            <div className="bg-card px-5 py-6" key={item.label}>
              <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-3 font-mono text-4xl font-semibold tabular-nums">{item.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Recently opened</p>
                <h3 className="mt-1 text-xl font-semibold">최근 글</h3>
              </div>
              <a
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href="/posts"
              >
                전체 보기
              </a>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              {recentPosts.map((post) => (
                <a
                  className="group flex items-center justify-between gap-5 border-b border-border px-5 py-4 last:border-b-0 hover:bg-muted/60"
                  href={`/posts/${post.slug}`}
                  key={post.path}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{post.title}</span>
                    <span className="mt-1 block truncate font-mono text-xs text-muted-foreground">
                      {post.path}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <Badge label={post.status} tone={postStatusTone(post.status)} variant="weak" />
                    <ArrowUpRight
                      aria-hidden="true"
                      className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      size={16}
                    />
                  </span>
                </a>
              ))}
              {recentPosts.length === 0 ? (
                <EmptyState
                  className="px-5 py-10"
                  density="compact"
                  description="첫 초안을 만들면 최근 글 목록에 표시됩니다."
                  media="icon"
                  title="아직 작성된 글이 없습니다."
                  actions={
                    <a
                      className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                      href="/posts/new"
                    >
                      첫 초안 만들기
                    </a>
                  }
                />
              ) : null}
            </div>
          </section>

          <section>
            <p className="text-xs font-medium text-muted-foreground">Shortcuts</p>
            <h3 className="mt-1 text-xl font-semibold">빠른 작업</h3>
            <div className="mt-4 grid gap-2">
              {[
                {
                  href: "/posts/new",
                  label: "새 초안",
                  detail: "빈 문서에서 시작",
                  icon: FilePenLine,
                },
                { href: "/posts", label: "글 관리", detail: "초안과 발행 글 확인", icon: Files },
                {
                  href: "/settings",
                  label: "사이트 설정",
                  detail: "연결 상태와 설정 확인",
                  icon: Settings2,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-transform hover:-translate-y-0.5 hover:bg-muted/50"
                    href={item.href}
                    key={item.href}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary">
                      <Icon aria-hidden="true" size={17} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {item.detail}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </CmsShell>
  );
}

export default async function CmsHomePage() {
  const decision = await requireCmsAccess();
  const posts = decision.status === "authorized" ? await listPostSummaries() : [];
  return <CmsHomePageView decision={decision} posts={posts} />;
}
