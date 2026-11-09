import type { AnalyticsDashboardView } from "@blog-platform/core/analytics";
import { AccessState, CmsShell } from "../../components/shell/index";
import { AnalyticsDashboard } from "../../features/analytics/components/index";
import { loadAnalyticsDashboard } from "../../features/analytics/server/index";
import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";

type AnalyticsPageSearchParams = {
  range?: string | string[];
};

export function AnalyticsPageView({
  decision,
  dashboard,
}: {
  decision: AccessDecision;
  dashboard?: AnalyticsDashboardView;
}) {
  if (decision.status !== "authorized") return <AccessState decision={decision} />;
  if (!dashboard) {
    throw new Error("Authorized analytics page requires dashboard data.");
  }
  return (
    <CmsShell activePath="/analytics" session={decision.session} title="Analytics">
      <AnalyticsDashboard dashboard={dashboard} />
    </CmsShell>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<AnalyticsPageSearchParams>;
}) {
  const decision = await requireCmsAccess();
  const params = await searchParams;
  const dashboard =
    decision.status === "authorized"
      ? await loadAnalyticsDashboard({ range: params?.range })
      : undefined;
  return <AnalyticsPageView decision={decision} dashboard={dashboard} />;
}
