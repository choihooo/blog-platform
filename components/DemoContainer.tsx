"use client";

import { useState, type ReactNode } from "react";

type DemoContainerProps = {
  children: ReactNode;
  /** 리셋 버튼 표시 여부 (누르면 데모가 초기 상태로 remount) */
  resettable?: boolean;
};

// 모든 인터랙티브 데모를 감싸는 공통 프레임.
// 새 데모를 만들 때는 내용물만 채우면 되고, 테두리/배경/리셋은 여기서 처리한다.
export function DemoContainer({
  children,
  resettable = false,
}: DemoContainerProps) {
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="not-prose group relative my-8 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
      {resettable && (
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          aria-label="데모 리셋"
          className="absolute top-3 right-3 z-10 rounded-md px-2 py-1 text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          ↺ 리셋
        </button>
      )}
      <div
        key={resetKey}
        className="flex min-h-[280px] flex-col items-center justify-center gap-6 p-6"
      >
        {children}
      </div>
    </div>
  );
}

// 데모 안에서 쓰는 공통 버튼
export function DemoButton({
  active = false,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          : "bg-white text-neutral-600 shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}
