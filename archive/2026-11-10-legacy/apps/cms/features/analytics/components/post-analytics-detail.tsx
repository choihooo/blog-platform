import type {
  AnalyticsDashboardView,
  PostPerformance,
  PublicationPerformanceWindow,
} from "@blog-platform/core/analytics";
import { Badge, EmptyState } from "@hozui/react";
import { ArrowLeft, ArrowUpRight, Edit3 } from "lucide-react";

type PostAnalyticsDetailProps = {
  dashboard: AnalyticsDashboardView;
  post?: PostPerformance;
  windows: PublicationPerformanceWindow[];
};

const trackedEvents = [
  { name: "search_result_click", label: "검색 결과 클릭", target: "검색 결과 목록" },
  { name: "recommended_post_click", label: "추천글 클릭", target: "글 하단 추천 영역" },
  { name: "post_card_click", label: "글 카드 클릭", target: "홈/카테고리/태그 목록" },
  { name: "category_click", label: "카테고리 클릭", target: "카테고리 칩" },
  { name: "tag_click", label: "태그 클릭", target: "태그 칩" },
  { name: "share", label: "공유 클릭", target: "글 공유 버튼" },
] as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatPosition(value: number) {
  return value > 0 ? value.toFixed(1) : "-";
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" }).format(
    date,
  );
}

function stateLabel(state: PublicationPerformanceWindow["state"]) {
  if (state === "pending") return "대기";
  if (state === "insufficient-data") return "데이터 부족";
  return "완료";
}

function matchTone(matchState: PostPerformance["matchState"]) {
  if (matchState === "matched") return "positive";
  if (matchState === "partial") return "warning";
  return "neutral";
}

function windowLabel(window: PublicationPerformanceWindow["window"]) {
  if (window === "1d") return "발행 1일";
  if (window === "7d") return "발행 7일";
  return "발행 28일";
}

function metricCards(post: PostPerformance) {
  return [
    { label: "Page views", value: formatNumber(post.pageViews) },
    { label: "Active users", value: formatNumber(post.activeUsers) },
    { label: "Search clicks", value: formatNumber(post.searchClicks) },
    { label: "Impressions", value: formatNumber(post.searchImpressions) },
    { label: "CTR", value: formatPercent(post.searchCtr) },
    { label: "Avg. position", value: formatPosition(post.averagePosition) },
  ];
}

function postConsoleLinks(dashboard: AnalyticsDashboardView, post: PostPerformance) {
  const links = {
    ga4: dashboard.externalLinks.ga4,
    searchConsole: dashboard.externalLinks.searchConsole,
  };

  if (dashboard.connection.ga4PropertyId) {
    links.ga4 = `https://analytics.google.com/analytics/web/#/p${encodeURIComponent(
      dashboard.connection.ga4PropertyId,
    )}/reports/explorer?params=${encodeURIComponent(post.canonicalUrl)}`;
  }
  if (dashboard.connection.searchConsoleProperty) {
    links.searchConsole = `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(
      dashboard.connection.searchConsoleProperty,
    )}&page=${encodeURIComponent(post.canonicalUrl)}`;
  }

  return links;
}

function actionItems(post: PostPerformance) {
  const items: Array<{ title: string; body: string; tone: "positive" | "warning" | "neutral" }> =
    [];

  if (post.searchImpressions >= 100 && post.searchCtr < 0.03) {
    items.push({
      title: "노출 대비 CTR 낮음",
      body: "제목과 메타 설명을 검색어 의도에 더 직접적으로 맞추는 게 우선입니다.",
      tone: "warning",
    });
  }
  if (post.averagePosition >= 4 && post.averagePosition <= 15) {
    items.push({
      title: "검색 순위 상승 후보",
      body: "상위 검색어를 H2/H3와 본문 예시로 보강하면 1페이지 안쪽 진입 가능성이 있습니다.",
      tone: "positive",
    });
  }
  if (post.searchImpressions === 0 && post.pageViews > 0) {
    items.push({
      title: "검색 노출 부족",
      body: "색인 상태, 내부 링크, 카테고리 연결을 먼저 확인하는 게 좋습니다.",
      tone: "warning",
    });
  }
  if (post.topQueries.length > 0) {
    items.push({
      title: "검색어 기반 리라이트 가능",
      body: `"${post.topQueries[0]?.query}" 검색어를 제목, 도입부, 결론 CTA에 반영할 수 있습니다.`,
      tone: "neutral",
    });
  }
  if (items.length === 0) {
    items.push({
      title: "추가 데이터 대기",
      body: "GA4/GSC 표본이 더 쌓이면 제목, 내부 링크, 추천글 개선 여부를 판단할 수 있습니다.",
      tone: "neutral",
    });
  }

  return items;
}

function MetricGrid({ post }: { post: PostPerformance }) {
  return (
    <section
      aria-label="Post analytics summary"
      className="grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-2 xl:grid-cols-3"
    >
      {metricCards(post).map((metric) => (
        <div className="bg-card px-5 py-5" key={metric.label}>
          <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
          <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">{metric.value}</p>
        </div>
      ))}
    </section>
  );
}

function PublicationWindows({ windows }: { windows: PublicationPerformanceWindow[] }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Publication tracking</p>
        <h3 className="mt-1 text-xl font-semibold">발행 후 성과</h3>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
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
            {windows.map((window) => (
              <tr className="border-b border-border last:border-b-0" key={window.window}>
                <td className="px-4 py-3 font-medium">{windowLabel(window.window)}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function QueryTable({ post }: { post: PostPerformance }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Search performance</p>
        <h3 className="mt-1 text-xl font-semibold">유입 검색어</h3>
      </div>
      {post.topQueries.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[44rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
                <th className="min-w-[18rem] px-4 py-3">Query</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Impressions</th>
                <th className="px-4 py-3">CTR</th>
                <th className="px-4 py-3">Position</th>
              </tr>
            </thead>
            <tbody>
              {post.topQueries.map((query) => (
                <tr className="border-b border-border last:border-b-0" key={query.query}>
                  <td className="px-4 py-3 font-medium">{query.query}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{formatNumber(query.clicks)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {formatNumber(query.impressions)}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums">{formatPercent(query.ctr)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">
                    {formatPosition(query.averagePosition)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          className="rounded-lg border border-border bg-card px-5 py-10"
          density="compact"
          description="Search Console 검색어가 아직 이 글에 매칭되지 않았습니다."
          media="icon"
          title="표시할 검색어가 없습니다."
        />
      )}
    </section>
  );
}

function RecommendationPanel({ post }: { post: PostPerformance }) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Recommended actions</p>
        <h3 className="mt-1 text-xl font-semibold">다음 액션</h3>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {actionItems(post).map((item) => (
          <article className="rounded-lg border border-border bg-card px-5 py-4" key={item.title}>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold">{item.title}</h4>
              <Badge
                label={
                  item.tone === "positive" ? "기회" : item.tone === "warning" ? "검토" : "참고"
                }
                tone={item.tone}
                variant="weak"
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventTrackingPanel() {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Interaction tracking</p>
        <h3 className="mt-1 text-xl font-semibold">수집 중인 이벤트</h3>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[42rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">의미</th>
              <th className="px-4 py-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {trackedEvents.map((event) => (
              <tr className="border-b border-border last:border-b-0" key={event.name}>
                <td className="px-4 py-3 font-mono text-xs">{event.name}</td>
                <td className="px-4 py-3 font-medium">{event.label}</td>
                <td className="px-4 py-3 text-muted-foreground">{event.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PostAnalyticsDetail({ dashboard, post, windows }: PostAnalyticsDetailProps) {
  if (!post) {
    return (
      <div className="space-y-6">
        <a
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          href="/analytics"
        >
          <ArrowLeft aria-hidden="true" size={16} /> 분석 목록
        </a>
        <EmptyState
          className="rounded-lg border border-border bg-card px-5 py-14"
          density="compact"
          description="현재 GA4/GSC 결과에 이 글이 없거나 아직 발행 글로 매칭되지 않았습니다."
          media="icon"
          title="글 분석 데이터를 찾을 수 없습니다."
        />
      </div>
    );
  }

  const consoleLinks = postConsoleLinks(dashboard, post);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <a
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            href="/analytics"
          >
            <ArrowLeft aria-hidden="true" size={16} /> 분석 목록
          </a>
          <p className="mt-5 text-sm font-medium text-muted-foreground">Post analytics</p>
          <h2 className="mt-1 max-w-4xl text-3xl font-semibold">{post.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">/posts/{post.slug}</span>
            <span>발행일 {formatDate(post.publishedAt)}</span>
            <Badge label={post.matchState} tone={matchTone(post.matchState)} variant="weak" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={`/posts/${post.slug}`}
          >
            수정
            <Edit3 aria-hidden="true" size={15} />
          </a>
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={post.canonicalUrl}
            rel="noreferrer"
            target="_blank"
          >
            글 보기
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["7d", "28d"] as const).map((range) => (
          <a
            className={
              dashboard.range === range
                ? "inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                : "inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            }
            href={`/analytics/posts/${post.slug}?range=${range}`}
            key={range}
          >
            {range}
          </a>
        ))}
        {consoleLinks.ga4 ? (
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={consoleLinks.ga4}
            rel="noreferrer"
            target="_blank"
          >
            GA4 열기
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        ) : null}
        {consoleLinks.searchConsole ? (
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={consoleLinks.searchConsole}
            rel="noreferrer"
            target="_blank"
          >
            Search Console 열기
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        ) : null}
        <span className="inline-flex h-9 items-center rounded-md border border-border px-3 text-xs text-muted-foreground">
          {dashboard.range} · 데이터 기준일 {formatDate(dashboard.availableThrough)}
        </span>
      </div>

      <MetricGrid post={post} />
      <PublicationWindows windows={windows} />
      <QueryTable post={post} />
      <RecommendationPanel post={post} />
      <EventTrackingPanel />
    </div>
  );
}
