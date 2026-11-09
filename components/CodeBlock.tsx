"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

export function CodeBlock({ children, ...props }: ComponentProps<"pre">) {
  const pre = useRef<HTMLPreElement>(null);
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<"idle" | "copying" | "copied" | "error">("idle");

  useEffect(() => () => {
    if (reset.current) clearTimeout(reset.current);
  }, []);

  async function copy() {
    if (reset.current) clearTimeout(reset.current);
    const code = pre.current?.querySelector("code");
    setState("copying");
    try {
      if (!code || !navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(code.textContent ?? "");
      setState("copied");
      reset.current = setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="code-block">
      <pre {...props} ref={pre}>{children}</pre>
      <div className="not-prose code-copy-toolbar">
        <p role="status" aria-live="polite" className={state === "error" ? "code-copy-error" : "sr-only"}>
          {state === "copied" ? "코드를 복사했습니다." : state === "error" ? "복사하지 못했습니다. 코드를 선택해 직접 복사해주세요." : ""}
        </p>
        <button type="button" className="code-copy-button" onClick={copy} disabled={state === "copying"}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
          </svg>
          {state === "copied" ? "복사됨" : state === "copying" ? "복사 중" : "코드 복사"}
        </button>
      </div>
    </div>
  );
}
