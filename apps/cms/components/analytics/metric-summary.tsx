import type { MetricComparison, SitePerformanceSummary } from "@blog-platform/analytics";

const metricLabels: Record<keyof Omit<SitePerformanceSummary, "comparison">, string> = {
  pageViews: "Page views",
  activeUsers: "Active users",
  searchClicks: "Search clicks",
  searchImpressions: "Impressions",
  searchCtr: "CTR",
  averagePosition: "Avg. position",
};

function formatMetric(metric: string, value: number) {
  if (metric === "searchCtr") return `${(value * 100).toFixed(1)}%`;
  if (metric === "averagePosition") return value > 0 ? value.toFixed(1) : "-";
  return new Intl.NumberFormat("ko-KR").format(value);
}

function comparisonFor(comparisons: MetricComparison[], metric: string) {
  return comparisons.find((comparison) => comparison.metric === metric);
}

function directionLabel(comparison?: MetricComparison) {
  if (!comparison) return "No comparison";
  if (comparison.direction === "flat") return "No change";
  const sign = comparison.delta > 0 ? "+" : "";
  return `${sign}${formatMetric(comparison.metric, comparison.delta)} vs previous`;
}

export function MetricSummary({ summary }: { summary: SitePerformanceSummary }) {
  const metrics = Object.keys(metricLabels) as Array<
    keyof Omit<SitePerformanceSummary, "comparison">
  >;
  return (
    <section
      aria-label="Analytics summary"
      className="grid gap-px overflow-hidden rounded-lg border border-border sm:grid-cols-2 xl:grid-cols-3"
    >
      {metrics.map((metric) => {
        const comparison = comparisonFor(summary.comparison, metric);
        return (
          <div className="bg-card px-5 py-5" key={metric}>
            <p className="text-xs font-medium text-muted-foreground">{metricLabels[metric]}</p>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">
              {formatMetric(metric, summary[metric])}
            </p>
            <p
              className={
                comparison?.direction === "down"
                  ? "mt-2 text-xs text-warning"
                  : "mt-2 text-xs text-muted-foreground"
              }
            >
              {directionLabel(comparison)}
            </p>
          </div>
        );
      })}
    </section>
  );
}
