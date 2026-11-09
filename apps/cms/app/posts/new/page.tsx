import { AccessState, CmsShell } from "../../../components/shell/index";
import { EditorScreen } from "../../../features/editor/components/index";
import {
  createNewEditorDocument,
  loadEditorCategories,
  loadEditorSiteAnalyticsConfig,
} from "../../../features/editor/server/index";
import { requireCmsAccess, type AccessDecision } from "../../../lib/auth/index";
import { editorCommands } from "../../actions/editor-commands";

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
        commands={editorCommands}
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
