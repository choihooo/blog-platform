import { animalForNickname } from "@/lib/engagement/profile.mjs";
import styles from "./ArticleEngagement.module.css";

// Small, consistent animal glyphs. The saved nickname owns the avatar;
// changing the composer's nickname never changes a comment's saved profile.
function Face({ animal }: { animal: string | null }) {
  const face = "var(--avatar-face)";
  const ink = "var(--avatar-ink)";
  const light = "var(--avatar-light)";
  const line = { stroke: ink, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const eyes = <g fill={ink}><circle cx="11.5" cy="16.5" r="1.1" /><circle cx="20.5" cy="16.5" r="1.1" /></g>;
  const nose = <><path d="m14 20 2 1.5 2-1.5Z" fill={ink} /><path d="M13.5 23q2.5 2 5 0" fill="none" {...line} /></>;

  switch (animal) {
    case "너구리": return <>
      <circle cx="7.5" cy="8.5" r="4" fill={ink} /><circle cx="24.5" cy="8.5" r="4" fill={ink} />
      <path d="M4 16C4 8 10 6 16 6s12 2 12 10c0 9-7 12-12 12S4 25 4 16Z" fill={face} />
      <path d="M5 15q5-5 10 1-3 7-9 4Zm22 0q-5-5-10 1 3 7 9 4Z" fill={ink} />
      <g fill={light}><circle cx="10.5" cy="16.5" r="1.15" /><circle cx="21.5" cy="16.5" r="1.15" /></g>
      <ellipse cx="16" cy="23" rx="5.8" ry="4" fill={light} />{nose}
    </>;
    case "고양이": return <>
      <path d="M5 14 5 4l8 5h6l8-5v10c5 13-6 15-11 15S0 27 5 14Z" fill={face} />
      <path d="m7.5 10 .2-2.5 3.1 2.2m10.4 0 3.1-2.2.2 2.5" fill={light} />
      {eyes}{nose}<path d="m3 20 6 1m-5 4 5-2m20-3-6 1m5 4-5-2" fill="none" {...line} />
    </>;
    case "여우": return <>
      <path d="M4 15 5 3l9 7h4l9-7 1 12-3 8-9 6-9-6Z" fill={face} />
      <path d="m7 11 .2-4 4.5 4m8.6 0 4.5-4 .2 4" fill={ink} />
      <path d="m5 18 7 1 4 6 4-6 7-1-3 6-8 5-8-5Z" fill={light} />
      {eyes}<path d="m13.5 23 2.5 2 2.5-2Z" fill={ink} />
    </>;
    case "수달": return <>
      <circle cx="5" cy="15" r="3.5" fill={face} /><circle cx="27" cy="15" r="3.5" fill={face} />
      <ellipse cx="16" cy="17" rx="12" ry="11" fill={face} />{eyes}
      <ellipse cx="12.8" cy="22" rx="4.8" ry="4" fill={light} /><ellipse cx="19.2" cy="22" rx="4.8" ry="4" fill={light} />
      <ellipse cx="16" cy="20.5" rx="2.6" ry="1.8" fill={ink} /><path d="m4 20 4 1m-4 3 4-1m20-3-4 1m4 3-4-1M14 24q2 1.5 4 0" fill="none" {...line} />
    </>;
    case "토끼": return <>
      <ellipse cx="10" cy="9" rx="4" ry="8" fill={face} transform="rotate(-9 10 9)" /><ellipse cx="22" cy="9" rx="4" ry="8" fill={face} transform="rotate(9 22 9)" />
      <path d="m10 5 1 7m11-7-1 7" fill="none" stroke={light} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="16" cy="20" rx="12" ry="10" fill={face} />
      <g fill={ink}><circle cx="11.5" cy="19" r="1.1" /><circle cx="20.5" cy="19" r="1.1" /></g>
      <path d="m14 23 2 1.5 2-1.5Z" fill={ink} /><path d="M13.5 26q2.5 2 5 0" fill="none" {...line} />
    </>;
    case "고래": return <>
      <path d="M24 17q5 0 6-6-4 0-5 3-2-4-6-3 1 5 5 6Z" fill={face} />
      <path d="M3 20C3 11 8 8 15 9c7 1 10 6 9 12-1 6-17 9-20 3Z" fill={face} />
      <path d="M4 23q9 4 19-2-1 7-11 7-6 0-8-5Z" fill={light} />
      <circle cx="10" cy="18" r="1.1" fill={ink} /><path d="M8 22q2 2 4 0M12 7V4m0 1q-4-4-5-1m5 1q3-4 5-2" fill="none" {...line} />
    </>;
    case "참새": return <>
      <ellipse cx="16" cy="19" rx="11" ry="11" fill={face} />
      <path d="M6 14Q7 5 16 7q9 0 10 7l-10-3Z" fill={ink} />
      <ellipse cx="16" cy="22" rx="7" ry="7" fill={light} />
      <g fill={ink}><circle cx="11" cy="16" r="1.2" /><circle cx="21" cy="16" r="1.2" /></g>
      <path d="m13.5 20 2.5 3 2.5-3Z" fill={ink} /><path d="M6 20q-4 4 1 6m19-6q4 4-1 6" fill="none" {...line} />
    </>;
    case "펭귄": return <>
      <path d="M6 18C6 3 26 3 26 18l2 8-5-3H9l-5 3Z" fill={ink} />
      <path d="M9 17c0-8 7-8 7-4 0-4 7-4 7 4v5c0 8-14 8-14 0Z" fill={light} />
      <g fill={ink}><circle cx="12" cy="16.5" r="1.1" /><circle cx="20" cy="16.5" r="1.1" /></g>
      <path d="m13.5 20 2.5 2.5 2.5-2.5Z" fill={face} /><path d="M11 29h3m4 0h3" fill="none" {...line} />
    </>;
    default: return <><circle cx="16" cy="11" r="5" fill={face} /><path d="M6 28v-3a10 10 0 0 1 20 0v3" fill={face} /></>;
  }
}

export function AnimalAvatar({ nickname }: { nickname: string }) {
  const animal = animalForNickname(nickname);
  return <span className={styles.avatar} aria-hidden="true" data-animal={animal ?? "unknown"}>
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" focusable="false"><Face animal={animal} /></svg>
  </span>;
}
