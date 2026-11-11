import { readFileSync } from "node:fs";
import { join } from "node:path";
import settingsPoster from "./assets/settings-poster.png";
import focusPoster from "./assets/focus-poster.png";

const demos = {
  settings: {
    file: "settings-persistence.mp4",
    poster: settingsPoster,
    label: "쿠팡에서 글자 크기를 변경한 뒤 새로고침해 설정이 유지되는 시연",
  },
  focus: {
    file: "keyboard-focus.mp4",
    poster: focusPoster,
    label: "쿠팡에서 Tab과 Shift + Tab으로 VOIM 메뉴를 이동하고 Esc로 닫아 포커스를 복원하는 시연",
  },
} as const;

export function DemoVideo({ kind }: { kind: keyof typeof demos }) {
  const demo = demos[kind];
  // Keep the unpublished draft's small recordings local to the article.
  // No public asset URL is created while the article remains a private draft.
  const bytes = readFileSync(
    join(process.cwd(), "app/blog/_drafts/voim-retrospective/assets", demo.file),
  );

  return (
    <video
      controls
      playsInline
      muted
      preload="none"
      width={1440}
      height={900}
      poster={demo.poster.src}
      aria-label={demo.label}
      style={{ width: "100%", height: "auto" }}
    >
      <source src={`data:video/mp4;base64,${bytes.toString("base64")}`} type="video/mp4" />
      {demo.label}
    </video>
  );
}
