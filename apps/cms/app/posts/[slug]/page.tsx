import { EditorScreen } from "../../../components/editor/index";
import { AccessState, CmsShell } from "../../../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../../../lib/auth/index";
import { loadEditorDocument, pathForSlug } from "../../../lib/editor/index";

export async function ExistingPostPageView({
  decision,
  slug,
}: {
  decision: AccessDecision;
  slug: string;
}) {
  if (decision.status !== "authorized") return <AccessState decision={decision} />;

  const loaded = await loadEditorDocument(pathForSlug(slug));
  return (
    <CmsShell activePath="/posts" session={decision.session} title="Edit post">
      {loaded.ok ? (
        <EditorScreen initialDocument={loaded.document} />
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
