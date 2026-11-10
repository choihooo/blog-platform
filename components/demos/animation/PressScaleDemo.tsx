"use client";

import { DemoContainer } from "@/components/DemoContainer";
import { CrossBadge, CheckBadge } from "./badges";

function PillButton({ withScale }: { withScale: boolean }) {
  return (
    <button
      type="button"
      className={`rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-md ring-1 ring-neutral-200 select-none dark:ring-0 ${
        withScale
          ? "transition-transform duration-150 ease-out active:scale-[0.97]"
          : ""
      }`}
    >
      눌러보세요
    </button>
  );
}

// 누를 때 scale(0.97)로 줄어드는 버튼과 아무 반응 없는 버튼 비교
export function PressScaleDemo() {
  return (
    <DemoContainer>
      <div className="flex items-start gap-10">
        <div className="flex flex-col items-center gap-4">
          <PillButton withScale={false} />
          <CrossBadge />
        </div>
        <div className="flex flex-col items-center gap-4">
          <PillButton withScale />
          <CheckBadge />
        </div>
      </div>
    </DemoContainer>
  );
}
