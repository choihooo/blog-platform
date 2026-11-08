import { ArrowUpRight } from "lucide-react";
import type { AnalyticsDashboardView } from "@blog-platform/core/analytics";

import { AnalyticsEmptyState } from "./analytics-empty-state";
import { MetricSummary } from "./metric-summary";
import { PostPerformanceTable } from "./post-performance-table";
import { PublicationPerformance } from "./publication-performance";

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: "Asia/Seoul" }).format(
    date,
  );
}

function rangeHref(range: "7d" | "28d") {
  return `/analytics?range=${range}`;
}

export function AnalyticsDashboard({ dashboard }: { dashboard: AnalyticsDashboardView }) {
  const hasData =
    dashboard.summary.pageViews > 0 ||
    dashboard.summary.searchImpressions > 0 ||
    dashboard.posts.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">GA4 / Search Console</p>
          <h2 className="mt-1 text-3xl font-semibold">분석 대시보드</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            데이터 기준일 {formatDate(dashboard.availableThrough)} · 연결 상태{" "}
            {dashboard.connection.status}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "28d"] as const).map((range) => (
            <a
              className={
                dashboard.range === range
                  ? "inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
                  : "inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
              }
              href={rangeHref(range)}
              key={range}
            >
              {range}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {dashboard.externalLinks.ga4 ? (
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={dashboard.externalLinks.ga4}
            rel="noreferrer"
            target="_blank"
          >
            GA4 열기
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        ) : null}
        {dashboard.externalLinks.searchConsole ? (
          <a
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
            href={dashboard.externalLinks.searchConsole}
            rel="noreferrer"
            target="_blank"
          >
            Search Console 열기
            <ArrowUpRight aria-hidden="true" size={15} />
          </a>
        ) : null}
      </div>

      {!hasData || dashboard.connection.status !== "connected" ? (
        <AnalyticsEmptyState connection={dashboard.connection} />
      ) : null}

      <MetricSummary summary={dashboard.summary} />
      <PostPerformanceTable posts={dashboard.posts} />
      <PublicationPerformance posts={dashboard.posts} windows={dashboard.publicationWindows} />

      {dashboard.warnings.length > 0 ? (
        <section className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-sm font-semibold">Warnings</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {dashboard.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
