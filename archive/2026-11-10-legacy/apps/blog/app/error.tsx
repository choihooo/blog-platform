"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 place-items-center px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid justify-items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">문제가 발생했어요</h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          페이지를 표시하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
        </p>
        <button
          className="mt-3 inline-flex items-center border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          onClick={reset}
          type="button"
        >
          다시 시도
        </button>
      </div>
    </main>
  );
}
