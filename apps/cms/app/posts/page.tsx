import { AccessState, CmsShell } from "../../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";

export function PostsPageView({ decision }: { decision: AccessDecision }) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  return (
    <CmsShell activePath="/posts" session={decision.session} title="Posts">
      <section className="max-w-3xl">
        <h2 className="text-2xl font-semibold">Posts</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          글 목록과 editor는 다음 phase에서 연결합니다.
        </p>
      </section>
    </CmsShell>
  );
}

export default function PostsPage() {
  return requireCmsAccess().then((decision) => <PostsPageView decision={decision} />);
}
