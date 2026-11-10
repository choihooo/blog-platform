"use client";

import { useState } from "react";
import { DemoContainer } from "@/components/DemoContainer";
import { CrossBadge, CheckBadge } from "./badges";

type StaggerDelays = {
  tab: string;
  title: string;
  desc: string;
  buttons: string;
};

// A: 제목을 다 읽었을 때쯤 설명이 나오고, 이어서 버튼 → 탭 순서로 등장
const INTENTIONAL: StaggerDelays = {
  title: "",
  desc: "[animation-delay:800ms]",
  buttons: "[animation-delay:1200ms]",
  tab: "[animation-delay:1600ms]",
};
// B: 그냥 화면 위에서부터 DOM 순서대로, 일정한 간격으로 빠르게 등장
const TOP_TO_BOTTOM: StaggerDelays = {
  tab: "",
  title: "[animation-delay:250ms]",
  desc: "[animation-delay:500ms]",
  buttons: "[animation-delay:750ms]",
};

function ReplayIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function HeroPanel({ delays }: { delays: StaggerDelays }) {
  const [playKey, setPlayKey] = useState(0);

  return (
    <div className="relative w-full rounded-xl bg-white px-4 py-10 ring-1 ring-neutral-200 dark:bg-neutral-950 dark:ring-neutral-800">
      <button
        type="button"
        onClick={() => setPlayKey((k) => k + 1)}
        aria-label="다시 재생"
        className="absolute top-3 right-3 rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
      >
        <ReplayIcon />
      </button>
      <div key={playKey} className="flex flex-col items-center gap-3 text-center">
        <span
          className={`animate-fade-up rounded-full px-3 py-1 text-xs text-neutral-500 ring-1 ring-neutral-200 dark:text-neutral-400 dark:ring-neutral-700 ${delays.tab}`}
        >
          새로운 · React 19 지원 →
        </span>
        <h3
          className={`animate-fade-up text-lg font-bold text-neutral-900 dark:text-white ${delays.title}`}
        >
          UI 컴포넌트, 복사해서 끝
        </h3>
        <p
          className={`animate-fade-up text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 ${delays.desc}`}
        >
          접근성과 다크 모드까지 챙긴
          <br />
          프론트엔드 컴포넌트 라이브러리.
        </p>
        <div className={`animate-fade-up mt-1 flex gap-2 ${delays.buttons}`}>
          <span className="rounded-full bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-900">
            시작하기
          </span>
          <span className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-600 ring-1 ring-neutral-200 dark:text-neutral-300 dark:ring-neutral-700">
            컴포넌트 보기
          </span>
        </div>
      </div>
    </div>
  );
}

// 등장 순서 비교: DOM 순서대로 나오는 화면 vs 읽는 흐름에 맞춰 나오는 화면
export function StaggerOrderDemo() {
  return (
    <DemoContainer>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-4">
          <HeroPanel delays={TOP_TO_BOTTOM} />
          <CrossBadge />
        </div>
        <div className="flex flex-col items-center gap-4">
          <HeroPanel delays={INTENTIONAL} />
          <CheckBadge />
        </div>
      </div>
    </DemoContainer>
  );
}
