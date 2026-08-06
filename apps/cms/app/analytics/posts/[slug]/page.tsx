import { AccessState, CmsShell } from "../../../../components/shell/index";
import { PostAnalyticsDetail } from "../../../../components/analytics/post-analytics-detail";
import { requireCmsAccess, type AccessDecision } from "../../../../lib/auth/index";
import { loadAnalyticsDashboard } from "../../../../lib/analytics/index";
import type { AnalyticsDashboardView } from "@blog-platform/analytics";

type PostAnalyticsPageSearchParams = {
  range?: string | string[];
};

export function PostAnalyticsPageView({
  dashboard,
  decision,
  slug,
}: {
  dashboard?: AnalyticsDashboardView;
  decision: AccessDecision;
  slug: string;
}) {
  if (decision.status !== "authorized") return <AccessState decision={decision} />;
  if (!dashboard) {
    throw new Error("Authorized analytics detail page requires dashboard data.");
  }

  const post = dashboard.posts.find((item) => item.slug === slug);
  const windows = post
    ? dashboard.publicationWindows.filter((window) => window.postId === post.postId)
    : [];

  return (
    <CmsShell activePath="/analytics" session={decision.session} title="Post analytics">
      <PostAnalyticsDetail dashboard={dashboard} post={post} windows={windows} />
    </CmsShell>
  );
}

export default async function PostAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<PostAnalyticsPageSearchParams>;
}) {
  const [decision, resolvedParams, resolvedSearchParams] = await Promise.all([
    requireCmsAccess(),
    params,
    searchParams,
  ]);
  const dashboard =
    decision.status === "authorized"
      ? await loadAnalyticsDashboard({ range: resolvedSearchParams?.range })
      : undefined;

  return (
    <PostAnalyticsPageView dashboard={dashboard} decision={decision} slug={resolvedParams.slug} />
  );
}
