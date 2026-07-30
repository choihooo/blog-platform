import { Badge } from "@blog-platform/design-system";
import { ArrowUpRight, Plus } from "lucide-react";

import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";
import { AccessState, CmsShell } from "../../components/shell/index";
import { listPostSummaries, type PostSummary } from "../../lib/editor/editor-loader";

export function PostsPageView({
  decision,
  posts = [],
}: {
  decision: AccessDecision;
  posts?: PostSummary[];
}) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  return (
    <CmsShell activePath="/posts" session={decision.session} title="Posts">
      <section className="space-y-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Content library</p>
            <h2 className="mt-1 text-3xl font-semibold">모든 글</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              GitHub 저장소의 MDX 초안과 발행 글 {posts.length}개
            </p>
          </div>
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
            href="/posts/new"
          >
            <Plus aria-hidden="true" size={16} />새 초안
          </a>
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {posts.map((post) => (
            <a
              key={post.path}
              className="group flex items-center justify-between gap-5 border-b border-border px-5 py-4 last:border-b-0 hover:bg-muted/60"
              href={`/posts/${post.slug}`}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{post.title}</span>
                <span className="mt-1 block truncate font-mono text-xs text-muted-foreground">
                  {post.path}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <Badge variant="outline">{post.status}</Badge>
                <ArrowUpRight
                  aria-hidden="true"
                  className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  size={16}
                />
              </span>
            </a>
          ))}
          {posts.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-medium">표시할 글이 없습니다.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                저장소 연결을 확인하거나 첫 초안을 만들어보세요.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </CmsShell>
  );
}

export default function PostsPage() {
  return Promise.all([requireCmsAccess(), listPostSummaries()]).then(([decision, posts]) => (
    <PostsPageView decision={decision} posts={posts} />
  ));
}
