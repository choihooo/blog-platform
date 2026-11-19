"use client";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "../../components/ui/button";
type Item = { id: string; name: string; active: boolean };
export function ReorderList({
  items,
  onReorder,
}: {
  items: Item[];
  onReorder: (ids: string[]) => Promise<void>;
}) {
  const root = useRef<HTMLDivElement>(null);
  const start = useRef<{ id: string; y: number; pointer: number } | null>(null);
  const [drag, setDrag] = useState<{ id: string; offset: number } | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const move = async (from: number, to: number) => {
    if (busy || from === to || from < 0 || to < 0 || to >= items.length) return;
    const ids = items.map((item) => item.id);
    const [id] = ids.splice(from, 1);
    ids.splice(to, 0, id);
    setBusy(true);
    try {
      await onReorder(ids);
      setMessage(`${items[from].name} 순서를 변경했어요.`);
    } catch {
      setMessage("순서를 변경하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };
  const cancel = () => {
    start.current = null;
    setDrag(null);
  };
  return (
    <div ref={root} className="settings-reorder" aria-busy={busy}>
      {items.map((item, i) => (
        <div
          key={item.id}
          data-sort-id={item.id}
          className={`setting-row ${drag?.id === item.id ? "is-reordering" : ""}`}
          style={
            drag?.id === item.id
              ? {
                  transform: `translateY(${drag.offset}px)`,
                  pointerEvents: "none",
                }
              : undefined
          }
        >
          <Button
            type="button"
            variant="ghost"
            className="reorder-handle icon-btn"
            aria-label={`${item.name} 순서 끌어서 이동`}
            disabled={busy || items.length < 2}
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              start.current = {
                id: item.id,
                y: e.clientY,
                pointer: e.pointerId,
              };
            }}
            onPointerMove={(e) => {
              if (start.current?.pointer === e.pointerId)
                setDrag({ id: item.id, offset: e.clientY - start.current.y });
            }}
            onPointerUp={(e) => {
              const current = start.current;
              if (current?.pointer !== e.pointerId) return;
              const hit = document
                .elementFromPoint(e.clientX, e.clientY)
                ?.closest<HTMLElement>("[data-sort-id]");
              const target =
                hit && root.current?.contains(hit)
                  ? items.findIndex((x) => x.id === hit.dataset.sortId)
                  : -1;
              cancel();
              void move(
                items.findIndex((x) => x.id === current.id),
                target,
              );
            }}
            onPointerCancel={cancel}
            onLostPointerCapture={cancel}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
            }}
          >
            <GripVertical aria-hidden="true" />
          </Button>
          <span className="setting-name">
            {item.name}
            {!item.active && <small>숨김</small>}
          </span>
          <Button
            type="button"
            variant="ghost"
            className="icon-btn"
            disabled={busy || i === 0}
            aria-label={`${item.name} 위로 이동`}
            onClick={() => void move(i, i - 1)}
          >
            <ArrowUp aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="icon-btn"
            disabled={busy || i === items.length - 1}
            aria-label={`${item.name} 아래로 이동`}
            onClick={() => void move(i, i + 1)}
          >
            <ArrowDown aria-hidden="true" />
          </Button>
        </div>
      ))}
      <p className="sr-only" role="status">
        {message}
      </p>
    </div>
  );
}
