"use client";

import { useState } from "react";
import { DemoButton } from "@/components/DemoContainer";

export type EasingOption = {
  /** 트랙 위에 표시할 이름 */
  label: string;
  /** Tailwind 이징 클래스 (ease-linear, ease-out, ease-[cubic-bezier(...)] 등) */
  easeClass: string;
};

// 이징 비교: 같은 이동을 서로 다른 곡선으로 재생하는 공용 트랙
export function EasingTracks({ easings }: { easings: EasingOption[] }) {
  const [moved, setMoved] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        {easings.map(({ label, easeClass }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <code className="text-xs text-neutral-500 dark:text-neutral-400">
              {label}
            </code>
            <div className="relative h-10 w-64 rounded-full bg-neutral-100 ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-800">
              <div
                className={`absolute top-1 left-1 size-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow transition-transform duration-1000 ${easeClass} ${
                  moved ? "translate-x-[216px]" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
      <DemoButton active onClick={() => setMoved((m) => !m)}>
        재생
      </DemoButton>
    </>
  );
}
