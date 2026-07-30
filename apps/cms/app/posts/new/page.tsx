import { EditorScreen } from "../../../components/editor/index";
import { AccessState, CmsShell } from "../../../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../../../lib/auth/index";
import { createNewEditorDocument, loadEditorSiteAnalyticsConfig } from "../../../lib/editor/index";

export function NewPostPageView({
  decision,
  siteAnalytics,
}: {
  decision: AccessDecision;
  siteAnalytics?: Awaited<ReturnType<typeof loadEditorSiteAnalyticsConfig>>;
}) {
  if (decision.status !== "authorized") return <AccessState decision={decision} />;

  return (
    <CmsShell activePath="/posts" session={decision.session} title="New draft">
      <EditorScreen initialDocument={createNewEditorDocument()} siteAnalytics={siteAnalytics} />
    </CmsShell>
  );
}

export default function NewPostPage() {
  return Promise.all([requireCmsAccess(), loadEditorSiteAnalyticsConfig()]).then(
    ([decision, siteAnalytics]) => (
      <NewPostPageView decision={decision} siteAnalytics={siteAnalytics} />
    ),
  );
}
