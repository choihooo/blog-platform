import type { PostPerformance, PublicationPerformanceWindow } from "@blog-platform/analytics";

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function stateLabel(state: PublicationPerformanceWindow["state"]) {
  if (state === "pending") return "대기";
  if (state === "insufficient-data") return "데이터 부족";
  return "완료";
}

export function PublicationPerformance({
  posts,
  windows,
}: {
  posts: PostPerformance[];
  windows: PublicationPerformanceWindow[];
}) {
  if (windows.length === 0) return null;
  const postById = new Map(posts.map((post) => [post.postId, post]));

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Publication tracking</p>
        <h3 className="mt-1 text-xl font-semibold">발행 후 1/7/28일 성과</h3>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
              <th className="min-w-[16rem] px-4 py-3">글</th>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Users</th>
              <th className="px-4 py-3">Clicks</th>
              <th className="px-4 py-3">Impressions</th>
              <th className="px-4 py-3">Review</th>
            </tr>
          </thead>
          <tbody>
            {windows.slice(0, 60).map((window) => {
              const post = postById.get(window.postId);
              return (
                <tr
                  className="border-b border-border last:border-b-0 hover:bg-muted/60"
                  key={`${window.postId}-${window.window}`}
                >
                  <td className="px-4 py-3">
                    <span className="block truncate font-medium">
                      {post?.title ?? window.postId}
                    </span>
                    {post ? (
                      <span className="mt-1 block font-mono text-xs text-muted-foreground">
                        /posts/{post.slug}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">{window.window}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {stateLabel(window.state)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {formatNumber(window.pageViews)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {formatNumber(window.activeUsers)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {formatNumber(window.searchClicks)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {formatNumber(window.searchImpressions)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {window.needsReview ? "검토" : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
