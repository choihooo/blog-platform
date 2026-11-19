"use client";
import { useEffect, useRef } from "react";
/** Preserve form validation for custom controls without displaying a native picker. */
export function useRequiredPicker(
  value: string,
  required: boolean | undefined,
  disabled: boolean | undefined,
  onMissing: () => void,
) {
  const trigger = useRef<HTMLButtonElement>(null);
  const missing = useRef(onMissing);
  useEffect(() => {
    missing.current = onMissing;
  });
  useEffect(() => {
    const form = trigger.current?.form;
    if (!form || !required || disabled || value) return;
    const validate = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      missing.current();
    };
    form.addEventListener("submit", validate, true);
    return () => form.removeEventListener("submit", validate, true);
  }, [value, required, disabled]);
  return trigger;
}
