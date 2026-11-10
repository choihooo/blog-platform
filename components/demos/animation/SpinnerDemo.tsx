"use client";

import { DemoContainer } from "@/components/DemoContainer";

// 8개 막대의 회전 각도와 투명도 (뒤로 갈수록 진해진다)
const BARS = [
  "rotate-0 opacity-[0.125]",
  "rotate-45 opacity-25",
  "rotate-90 opacity-[0.375]",
  "rotate-[135deg] opacity-50",
  "rotate-180 opacity-[0.625]",
  "rotate-[225deg] opacity-75",
  "rotate-[270deg] opacity-[0.875]",
  "rotate-[315deg] opacity-100",
];

// iOS 스타일 스피너: 8개의 막대가 스텝 단위로 회전
function Spinner({ speed }: { speed: "slow" | "fast" }) {
  return (
    <div
      className={`relative size-8 ${
        speed === "fast" ? "animate-spinner-fast" : "animate-spinner-slow"
      }`}
    >
      {BARS.map((bar) => (
        <span
          key={bar}
          className={`absolute top-0 left-1/2 h-[9px] w-[3px] -translate-x-[1.5px] rounded-full bg-neutral-500 origin-[1.5px_16px] dark:bg-neutral-400 ${bar}`}
        />
      ))}
    </div>
  );
}

// 같은 로딩 시간, 다른 회전 속도의 스피너 비교
export function SpinnerDemo() {
  return (
    <DemoContainer>
      <div className="flex items-center gap-16">
        <Spinner speed="slow" />
        <Spinner speed="fast" />
      </div>
    </DemoContainer>
  );
}
