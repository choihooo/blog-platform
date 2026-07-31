import { EditorScreen } from "../../../components/editor/index";
import { AccessState, CmsShell } from "../../../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../../../lib/auth/index";
import {
  createNewEditorDocument,
  loadEditorCategories,
  loadEditorSiteAnalyticsConfig,
} from "../../../lib/editor/index";

export function NewPostPageView({
  categories = [],
  decision,
  siteAnalytics,
}: {
  categories?: Awaited<ReturnType<typeof loadEditorCategories>>;
  decision: AccessDecision;
  siteAnalytics?: Awaited<ReturnType<typeof loadEditorSiteAnalyticsConfig>>;
}) {
  if (decision.status !== "authorized") return <AccessState decision={decision} />;

  return (
    <CmsShell activePath="/posts" session={decision.session} title="New draft">
      <EditorScreen
        categories={categories}
        initialDocument={createNewEditorDocument()}
        siteAnalytics={siteAnalytics}
      />
    </CmsShell>
  );
}

export default function NewPostPage() {
  return Promise.all([
    requireCmsAccess(),
    loadEditorSiteAnalyticsConfig(),
    loadEditorCategories(),
  ]).then(([decision, siteAnalytics, categories]) => (
    <NewPostPageView categories={categories} decision={decision} siteAnalytics={siteAnalytics} />
  ));
}
