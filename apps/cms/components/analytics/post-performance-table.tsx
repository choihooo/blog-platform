import type { PostPerformance } from "@blog-platform/analytics";

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatPosition(value: number) {
  return value > 0 ? value.toFixed(1) : "-";
}

export function PostPerformanceTable({ posts }: { posts: PostPerformance[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Post performance</p>
        <h3 className="mt-1 text-xl font-semibold">글별 GA/GSC 비교</h3>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[58rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
              <th className="min-w-[16rem] px-4 py-3">제목</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Users</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Impressions</th>
              <th className="px-4 py-3">CTR</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Match</th>
            </tr>
          </thead>
          <tbody>
            {posts.slice(0, 20).map((post) => (
              <tr
                className="border-b border-border last:border-b-0 hover:bg-muted/60"
                key={post.postId}
              >
                <td className="px-4 py-3">
                  <a className="block truncate font-medium" href={`/analytics/posts/${post.slug}`}>
                    {post.title}
                  </a>
                  <span className="mt-1 block font-mono text-xs text-muted-foreground">
                    /posts/{post.slug}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">{formatNumber(post.pageViews)}</td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {formatNumber(post.activeUsers)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {formatNumber(post.searchClicks)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {formatNumber(post.searchImpressions)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {formatPercent(post.searchCtr)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums">
                  {formatPosition(post.averagePosition)}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{post.matchState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
