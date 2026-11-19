"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./ui/button";
import { useHorizontalSwipe } from "../lib/gestures/use-horizontal-swipe";

export function SwipeActions({
  label,
  onEdit,
  onDelete,
  children,
}: {
  label: string;
  onEdit: () => void;
  onDelete?: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const swipe = useHorizontalSwipe(
    (direction) => setOpen(direction === "left"),
    !!onDelete,
  );
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);
  const offset = Math.max(-144, Math.min(0, (open ? -144 : 0) + swipe.offset));
  return (
    <div
      ref={root}
      className="swipe-row"
      role="group"
      aria-label={`${label} 거래`}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <div className="swipe-actions" aria-hidden={!open} inert={!open}>
        <Button
          variant="ghost"
          aria-label={`${label} 수정`}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
        >
          수정
        </Button>
        <Button
          variant="ghost"
          className="swipe-delete"
          aria-label={`${label} 삭제`}
          tabIndex={open ? 0 : -1}
          onClick={() => {
            setOpen(false);
            onDelete?.();
          }}
        >
          삭제
        </Button>
      </div>
      <div
        className="swipe-foreground"
        data-dragging={swipe.offset !== 0 || undefined}
        style={{ transform: `translateX(${offset}px)` }}
        {...swipe.bind}
        onClickCapture={(e) => {
          swipe.bind.onClickCapture(e);
          if (!e.defaultPrevented && open && e.detail !== 0) {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
