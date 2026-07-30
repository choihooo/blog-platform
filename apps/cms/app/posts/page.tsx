import { AccessState, CmsShell } from "../../components/shell/index";
import { listPostSummaries, type PostSummary } from "../../lib/editor/index";
import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";

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
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Posts</h2>
            <p className="mt-1 text-sm text-muted-foreground">Repository MDX drafts and posts.</p>
          </div>
          <a
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
            href="/posts/new"
          >
            New draft
          </a>
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          {posts.map((post) => (
            <a
              key={post.path}
              className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-b-0 hover:bg-muted"
              href={`/posts/${post.slug}`}
            >
              <span>
                <span className="block font-medium">{post.title}</span>
                <span className="text-xs text-muted-foreground">{post.path}</span>
              </span>
              <span className="text-xs uppercase text-muted-foreground">{post.status}</span>
            </a>
          ))}
          {posts.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No posts found.</p>
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
