"use client";

import { DemoContainer } from "@/components/DemoContainer";
import { CrossBadge, CheckBadge } from "./badges";

const ROW_COUNT = 5;

function HoverList({ animated }: { animated: boolean }) {
  return (
    <div className="w-52 divide-y divide-neutral-200 overflow-hidden rounded-xl bg-white ring-1 ring-neutral-200 dark:divide-neutral-800 dark:bg-neutral-950 dark:ring-neutral-800">
      {Array.from({ length: ROW_COUNT }, (_, i) => (
        <div
          key={i}
          className={`h-11 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
            animated ? "transition-colors duration-500 ease-out" : ""
          }`}
        />
      ))}
    </div>
  );
}

// 메뉴 호버: 천천히 스며드는 배경(✗) vs 즉시 반응하는 배경(✓) 비교
export function HoverHighlightDemo() {
  return (
    <DemoContainer>
      <div className="flex items-start gap-10">
        <div className="flex flex-col items-center gap-4">
          <HoverList animated />
          <CrossBadge />
        </div>
        <div className="flex flex-col items-center gap-4">
          <HoverList animated={false} />
          <CheckBadge />
        </div>
      </div>
    </DemoContainer>
  );
}
