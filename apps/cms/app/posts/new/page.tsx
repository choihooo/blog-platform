import { EditorScreen } from "../../../components/editor/index";
import { AccessState, CmsShell } from "../../../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../../../lib/auth/index";
import { createNewEditorDocument } from "../../../lib/editor/index";

export function NewPostPageView({ decision }: { decision: AccessDecision }) {
  if (decision.status !== "authorized") return <AccessState decision={decision} />;

  return (
    <CmsShell activePath="/posts" session={decision.session} title="New draft">
      <EditorScreen initialDocument={createNewEditorDocument()} />
    </CmsShell>
  );
}

export default function NewPostPage() {
  return requireCmsAccess().then((decision) => <NewPostPageView decision={decision} />);
}
