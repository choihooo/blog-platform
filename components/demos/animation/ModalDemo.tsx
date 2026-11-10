"use client";

import { useState } from "react";
import { DemoContainer } from "@/components/DemoContainer";

// 버튼을 누르면 모달이 화려한 팝인 애니메이션과 함께 등장
export function ModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DemoContainer>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97] dark:bg-white dark:text-neutral-900"
      >
        새 글 작성
      </button>

      {open && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="모달 닫기"
            onClick={() => setOpen(false)}
            className="animate-fade-in absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px] dark:bg-black/60"
          />
          <div className="animate-pop-in relative w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-neutral-200 dark:bg-neutral-900 dark:ring-neutral-700">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              새 글 작성
            </h4>
            <input
              autoFocus
              type="text"
              placeholder="제목을 입력하세요"
              className="mt-3 w-full rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white transition-transform duration-150 ease-out active:scale-[0.97] dark:bg-white dark:text-neutral-900"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </DemoContainer>
  );
}
