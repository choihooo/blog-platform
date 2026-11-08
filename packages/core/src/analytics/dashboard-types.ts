export type AnalyticsDashboardRange = "7d" | "28d";

export type AnalyticsConnectionStatus = "connected" | "missing-config" | "unauthorized" | "error";

export type AnalyticsConnection = {
  id: string;
  provider: "ga4-gsc";
  ga4PropertyId?: string;
  searchConsoleProperty?: string;
  status: AnalyticsConnectionStatus;
  lastCheckedAt?: string;
  message?: string;
};

export type MetricDirection = "up" | "down" | "flat";

export type MetricComparison = {
  metric: string;
  current: number;
  previous: number;
  delta: number;
  direction: MetricDirection;
};

export type SitePerformanceSummary = {
  pageViews: number;
  activeUsers: number;
  searchClicks: number;
  searchImpressions: number;
  searchCtr: number;
  averagePosition: number;
  comparison: MetricComparison[];
};

export type SearchQueryPerformance = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
};

export type PostPerformance = {
  postId: string;
  title: string;
  slug: string;
  canonicalUrl: string;
  status: "published" | "archived";
  publishedAt?: string;
  category?: string;
  tags: string[];
  pageViews: number;
  activeUsers: number;
  searchClicks: number;
  searchImpressions: number;
  searchCtr: number;
  averagePosition: number;
  matchState: "matched" | "partial" | "unmatched";
  topQueries: SearchQueryPerformance[];
};

export type PublicationPerformanceWindow = {
  postId: string;
  window: "1d" | "7d" | "28d";
  state: "complete" | "pending" | "insufficient-data";
  pageViews: number;
  activeUsers: number;
  searchClicks: number;
  searchImpressions: number;
  needsReview: boolean;
};

export type AnalyticsSnapshot = {
  id: string;
  range: AnalyticsDashboardRange;
  generatedAt: string;
  availableThrough: string;
  summary: SitePerformanceSummary;
  posts: PostPerformance[];
  publicationWindows: PublicationPerformanceWindow[];
  warnings: string[];
};

export type AnalyticsProviderPost = {
  id: string;
  title: string;
  slug: string;
  canonicalUrl: string;
  status: "published" | "archived";
  publishedAt?: string;
  category?: string;
  tags?: string[];
};

export type AnalyticsProviderDateRange = {
  startDate: string;
  endDate: string;
  previousStartDate?: string;
  previousEndDate?: string;
};

export type AnalyticsProviderRequest = {
  siteUrl: string;
  ga4PropertyId: string;
  searchConsoleProperty: string;
  dateRange: AnalyticsProviderDateRange;
  posts: AnalyticsProviderPost[];
};

export type AnalyticsProviderResult =
  | {
      ok: true;
      generatedAt: string;
      availableThrough: string;
      summary: SitePerformanceSummary;
      postPerformance: PostPerformance[];
      publicationWindows: PublicationPerformanceWindow[];
      warnings: string[];
    }
  | {
      ok: false;
      code: "missing-config" | "unauthorized" | "quota-limited" | "temporary-failure" | "unknown";
      retryable: boolean;
      message: string;
      lastUsableSnapshot?: AnalyticsSnapshot;
    };

export type AnalyticsDashboardView = {
  connection: AnalyticsConnection;
  range: AnalyticsDashboardRange;
  generatedAt?: string;
  availableThrough?: string;
  summary: SitePerformanceSummary;
  posts: PostPerformance[];
  publicationWindows: PublicationPerformanceWindow[];
  externalLinks: {
    ga4?: string;
    searchConsole?: string;
  };
  warnings: string[];
};
