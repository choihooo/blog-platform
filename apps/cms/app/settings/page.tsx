import { AccessState, CmsShell } from "../../components/shell/index";
import { requireCmsAccess, type AccessDecision } from "../../lib/auth/index";

export function SettingsPageView({ decision }: { decision: AccessDecision }) {
  if (decision.status !== "authorized") {
    return <AccessState decision={decision} />;
  }

  return (
    <CmsShell activePath="/settings" session={decision.session} title="Settings">
      <section className="max-w-3xl">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          사이트 설정 편집은 후속 phase에서 연결합니다.
        </p>
      </section>
    </CmsShell>
  );
}

export default function SettingsPage() {
  return requireCmsAccess().then((decision) => <SettingsPageView decision={decision} />);
}
