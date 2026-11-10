import type { ReactNode } from "react";

// 데모 프레임 바로 아래 붙는 작은 설명 글씨
export function DemoCaption({ children }: { children: ReactNode }) {
  return (
    <p className="not-prose -mt-4 mb-8 text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
      {children}
    </p>
  );
}
