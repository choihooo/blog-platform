import { AccessState, CmsShell } from "../../../components/shell/index";
import { EditorScreen } from "../../../features/editor/components/index";
import {
  loadEditorCategories,
  loadEditorDocument,
  loadEditorSiteAnalyticsConfig,
  pathForSlug,
} from "../../../features/editor/server/index";
import { requireCmsAccess, type AccessDecision } from "../../../lib/auth/index";
import { editorCommands } from "../../actions/editor-commands";

export async function ExistingPostPageView({
  decision,
  slug,
}: {
  decision: AccessDecision;
  slug: string;
}) {
  if (decision.status !== "authorized") return <AccessState decision={decision} />;

  const [loaded, siteAnalytics, categories] = await Promise.all([
    loadEditorDocument(pathForSlug(slug)),
    loadEditorSiteAnalyticsConfig(),
    loadEditorCategories(),
  ]);
  return (
    <CmsShell activePath="/posts" session={decision.session} title="Edit post">
      {loaded.ok ? (
        <EditorScreen
          commands={editorCommands}
          categories={categories}
          initialDocument={loaded.document}
          siteAnalytics={siteAnalytics}
        />
      ) : (
        <section className="rounded-md border border-border p-6">
          <h2 className="text-lg font-semibold">Cannot edit this post</h2>
          <p className="mt-2 text-sm text-muted-foreground">{loaded.message}</p>
        </section>
      )}
    </CmsShell>
  );
}

export default async function ExistingPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, decision] = await Promise.all([params, requireCmsAccess()]);
  return <ExistingPostPageView decision={decision} slug={slug} />;
}
