import { AccessState, CmsShell } from "../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../lib/auth/index";

export function CmsHomePageView({ decision }: { decision: AccessDecision }) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  return (
    <CmsShell activePath="/" session={decision.session} title="Dashboard">
      <section className="max-w-3xl">
        <p className="text-sm text-muted-foreground">Repository-backed CMS</p>
        <h2 className="mt-2 text-2xl font-semibold">운영자 작업 공간</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Posts와 Settings 영역은 다음 CMS 단계 작업을 붙일 준비 상태입니다.
        </p>
      </section>
    </CmsShell>
  );
}

export default function CmsHomePage() {
  return requireCmsAccess().then((decision) => <CmsHomePageView decision={decision} />);
}
