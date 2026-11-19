import { useEffect, useRef } from 'react';
const layers = new Map<symbol, () => void>();
function escape(event: KeyboardEvent) {
  if (event.key === 'Escape') [...layers.values()].at(-1)?.();
}
export function useBackLayer(open: boolean, onClose: () => void) {
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; });
  useEffect(() => {
    if (!open) return;
    const id = Symbol();
    if (!layers.size) window.addEventListener('keydown', escape);
    layers.set(id, () => close.current());
    return () => { layers.delete(id); if (!layers.size) window.removeEventListener('keydown', escape); };
  }, [open]);
}
