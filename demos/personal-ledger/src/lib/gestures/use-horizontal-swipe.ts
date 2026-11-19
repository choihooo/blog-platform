"use client";
import { useRef, useState, type PointerEvent, type MouseEvent } from "react";

type Gesture = {
  id: number;
  x: number;
  y: number;
  axis: "pending" | "horizontal" | "vertical";
};
/** Horizontal intent only: native vertical scrolling, pinch and edge navigation remain available. */
export function useHorizontalSwipe(
  onSwipe: (direction: "left" | "right") => void,
  enabled = true,
) {
  const gesture = useRef<Gesture | null>(null);
  const blocked = useRef(new Set<number>());
  const suppressClickUntil = useRef(0);
  const [offset, setOffset] = useState(0);
  const reset = () => {
    gesture.current = null;
    setOffset(0);
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const start = gesture.current;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x,
      dy = e.clientY - start.y;
    if (start.axis === "pending" && Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
      start.axis =
        Math.abs(dx) > Math.abs(dy) * 1.4 ? "horizontal" : "vertical";
    }
    if (start.axis !== "horizontal") return;
    suppressClickUntil.current = Date.now() + 400;
    if (!e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.setPointerCapture(e.pointerId);
    setOffset(dx);
  };
  return {
    offset,
    bind: {
      onPointerDown(e: PointerEvent<HTMLElement>) {
        if (!enabled || e.pointerType === "mouse") return;
        suppressClickUntil.current = 0;
        blocked.current.add(e.pointerId);
        if (blocked.current.size > 1 || !e.isPrimary) {
          reset();
          return;
        }
        if (e.clientX < 24 || e.clientX > window.innerWidth - 24) return;
        gesture.current = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          axis: "pending",
        };
      },
      onPointerMove: move,
      onPointerUp(e: PointerEvent<HTMLElement>) {
        blocked.current.delete(e.pointerId);
        const start = gesture.current;
        if (start?.id === e.pointerId && start.axis === "horizontal") {
          const dx = e.clientX - start.x;
          suppressClickUntil.current = Date.now() + 400;
          if (Math.abs(dx) >= 56) onSwipe(dx < 0 ? "left" : "right");
        }
        reset();
      },
      onPointerCancel(e: PointerEvent<HTMLElement>) {
        blocked.current.delete(e.pointerId);
        reset();
      },
      onLostPointerCapture(e: PointerEvent<HTMLElement>) {
        // Moving capture from a child button to the gesture surface is not cancellation.
        if (e.target === e.currentTarget) reset();
      },
      onClickCapture(e: MouseEvent<HTMLElement>) {
        if (e.detail !== 0 && Date.now() < suppressClickUntil.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
    },
  };
}
