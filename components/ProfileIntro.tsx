import type { CSSProperties } from "react";

export function ProfileIntro({ accent, preview = false }: { accent?: string; preview?: boolean }) {
  const style: CSSProperties | undefined = accent ? { color: accent } : undefined;

  return (
    <>
      <section className="blog-profile mb-14">
        <h1 className="blog-profile-name">최<span style={style}>호</span></h1>
        <p>프론트엔드 개발자</p>
      </section>
      <section id={preview ? undefined : "about"} className="mb-14 scroll-mt-8">
        <h2 className="mb-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          소개
        </h2>
        <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">
          사용자에게는 <span style={style}>호</span>감 가는 경험을,<br />
          동료에게는 <span style={style}>호</span>흡이 잘 맞는 사람이 되고 싶습니다.<br />
          AI에 <span style={style}>호</span>기심이 많습니다.
        </p>
      </section>
    </>
  );
}
