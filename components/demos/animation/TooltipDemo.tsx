"use client";

import { useRef, useState } from "react";
import { DemoContainer } from "@/components/DemoContainer";
import { CrossBadge, CheckBadge } from "./badges";

// 서식 툴바 툴팁: 매번 지연을 기다리는 것(✗) vs 툴팁이 떠 있으면 지연을 건너뛰는 것(✓)
const TOOLBAR_ITEMS = [
  { label: <span className="font-serif font-bold">B</span>, tooltip: "굵게" },
  { label: <span className="font-serif italic">I</span>, tooltip: "기울임꼴" },
  { label: <span className="font-serif underline">U</span>, tooltip: "밑줄" },
];

const TOOLTIP_DELAY = 600;

function TooltipToolbar({ skipDelay }: { skipDelay: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const warm = useRef(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const coolTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleEnter = (i: number) => {
    clearTimeout(enterTimer.current);
    clearTimeout(coolTimer.current);
    if (skipDelay && warm.current) {
      setActive(i); // 이미 툴팁이 떠 있었으면 지연 없이 바로 표시
      return;
    }
    enterTimer.current = setTimeout(() => {
      setActive(i);
      warm.current = true;
    }, TOOLTIP_DELAY);
  };

  const handleLeave = () => {
    clearTimeout(enterTimer.current);
    setActive(null);
    // 잠깐 자리를 비운 정도로는 warm 상태를 유지한다
    coolTimer.current = setTimeout(() => {
      warm.current = false;
    }, 300);
  };

  return (
    <div className="flex rounded-xl bg-neutral-900 p-1 shadow-md dark:bg-neutral-950 dark:ring-1 dark:ring-neutral-700">
      {TOOLBAR_ITEMS.map((item, i) => (
        <div key={i} className="relative">
          {active === i && (
            <span
              role="tooltip"
              className="animate-fade-in pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-white px-2.5 py-1 text-xs whitespace-nowrap text-neutral-900 shadow-md ring-1 ring-neutral-200 dark:ring-0"
            >
              {item.tooltip}
            </span>
          )}
          <button
            type="button"
            onMouseEnter={() => handleEnter(i)}
            onMouseLeave={handleLeave}
            className="flex size-9 items-center justify-center rounded-lg text-sm text-white transition-colors hover:bg-neutral-700"
          >
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}

export function TooltipDemo() {
  return (
    <DemoContainer>
      <div className="flex items-start gap-10">
        <div className="flex flex-col items-center gap-4">
          <TooltipToolbar skipDelay={false} />
          <CrossBadge />
        </div>
        <div className="flex flex-col items-center gap-4">
          <TooltipToolbar skipDelay />
          <CheckBadge />
        </div>
      </div>
    </DemoContainer>
  );
}
