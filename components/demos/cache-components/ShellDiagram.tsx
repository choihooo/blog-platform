"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// 상품 상세 페이지를 정적 shell과 동적 콘텐츠로 나눠 보여주는 그림.
// 화면에 보이면 shell은 그대로 두고, 동적 콘텐츠만 fallback에서 실제 내용으로 따로따로 채워지는 과정을 반복한다.

// 동적 콘텐츠가 채워지는 시점과 한 바퀴 길이
const FILL_AT = { cart: 1400, stock: 2500 };
const LOOP_MS = 5600;

export function ShellDiagram() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState({ cart: false, stock: false });

  // 화면에 보이는 동안 반복 재생. 모션 줄이기면 동적 콘텐츠가 비어 있는 상태로 둔다.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timers: number[] = [];
    const stop = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const cycle = () => {
      stop();
      setFilled({ cart: false, stock: false });
      timers.push(
        window.setTimeout(() => setFilled((f) => ({ ...f, cart: true })), FILL_AT.cart),
        window.setTimeout(() => setFilled((f) => ({ ...f, stock: true })), FILL_AT.stock),
        window.setTimeout(cycle, LOOP_MS),
      );
    };
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? cycle() : stop()));
    io.observe(card);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="not-prose my-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_30px_60px_-36px_rgba(40,30,80,.3)] [--hole:#6A57F2] sm:p-5 dark:border-neutral-800 dark:bg-[#111111] dark:shadow-[0_30px_60px_-36px_rgba(0,0,0,.72)] dark:[--hole:#B7A4FF]"
    >
      <b className="block text-sm font-black tracking-tight">상품 상세 페이지</b>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[4px] border-[1.5px] border-neutral-400 bg-white dark:border-neutral-500 dark:bg-neutral-900" />
          <b className="font-extrabold text-neutral-800 dark:text-neutral-100">정적 shell</b>빌드할 때 미리 만들어 둠
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-3 rounded-[4px] border-[1.5px] border-dashed border-(--hole)"
            style={{ backgroundImage: HATCH }}
          />
          <b className="font-extrabold text-neutral-800 dark:text-neutral-100">동적 콘텐츠</b>요청이 와야 채움
        </span>
      </div>

      {/* 브라우저 창 = 정적 shell */}
      <div className="relative mt-6 rounded-xl border-[1.5px] border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <span className="absolute -top-2.5 left-3 z-10 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
          정적 shell
        </span>
        <div className="flex items-center gap-1.5 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
          <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <span className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <span className="ml-2 truncate rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            /products/1
          </span>
        </div>

        <div className="p-3 sm:p-4">
          <header className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3 dark:border-neutral-800">
            <span className="text-sm font-black tracking-tight">SHOP</span>
            <Hole filled={filled.cart} fallback="장바구니: -">
              장바구니: <b className="font-extrabold">3</b>
            </Hole>
          </header>

          <main className="mt-4 grid gap-4 sm:grid-cols-[132px_1fr]">
            <div className="grid h-28 place-items-center rounded-lg bg-gradient-to-br from-amber-200 to-rose-300 sm:h-auto sm:aspect-square dark:from-amber-500/40 dark:to-rose-500/40">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8 text-white/90">
                <rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="9" cy="10" r="1.8" fill="currentColor" />
                <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <b className="block text-base font-extrabold tracking-tight">운동화</b>
              <span className="mt-0.5 block text-sm font-bold">89,000원</span>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 break-keep dark:text-neutral-400">
                가볍고 쿠션감이 좋은 데일리 러닝화입니다. 누가 언제 봐도 같은 내용이라 미리 만들어 둘 수 있습니다.
              </p>
              <div className="mt-4">
                <Hole filled={filled.stock} fallback="재고 확인 중...">
                  <b className="font-extrabold text-emerald-600 dark:text-emerald-400">12개 남음</b>
                </Hole>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

const HATCH =
  "repeating-linear-gradient(135deg, color-mix(in srgb, var(--hole) 10%, transparent) 0 5px, transparent 5px 10px)";

// 동적 콘텐츠: 비어 있을 때는 빗금 + 점선, 채워지면 실제 내용이 페이드인
function Hole({ filled, fallback, children }: { filled: boolean; fallback: string; children: ReactNode }) {
  return (
    <div
      className={`relative inline-grid rounded-lg border-[1.5px] px-3 pt-2.5 pb-1.5 text-xs transition-colors duration-500 motion-reduce:transition-none ${
        filled
          ? "border-solid border-[color-mix(in_srgb,var(--hole)_45%,transparent)] bg-[color-mix(in_srgb,var(--hole)_8%,transparent)]"
          : "border-dashed border-(--hole)"
      }`}
      style={filled ? undefined : { backgroundImage: HATCH }}
    >
      <span className="absolute -top-2 right-2 rounded-full bg-(--hole) px-1.5 text-[9.5px] leading-4 font-bold whitespace-nowrap text-white dark:text-neutral-900">
        동적 콘텐츠
      </span>
      <span
        className={`col-start-1 row-start-1 whitespace-nowrap font-semibold text-neutral-600 transition-opacity duration-300 dark:text-neutral-300 ${
          filled ? "opacity-0" : "opacity-100"
        }`}
      >
        {fallback}
      </span>
      <span
        className={`col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-300 ${
          filled ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
