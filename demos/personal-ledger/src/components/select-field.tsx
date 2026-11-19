"use client";
import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { LedgerDrawer } from "./ledger-drawer";
import { cn } from "../lib/utils";
import { useRequiredPicker } from "../lib/forms/use-required-picker";

type Option = {
  value: string | number;
  disabled?: boolean;
  children: ReactNode;
};
export function SelectOption({ children }: Option) {
  return <>{children}</>;
}
export function SelectField({
  value,
  defaultValue,
  onValueChange,
  children,
  name,
  disabled,
  required,
  className,
  "aria-label": label = "선택",
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const options = Children.toArray(children).flatMap((child) =>
    isValidElement<Option>(child)
      ? [{ ...child.props, value: String(child.props.value) }]
      : [],
  );
  const [internal, setInternal] = useState(
    defaultValue ?? options.find((o) => !o.disabled)?.value ?? "",
  );
  const [open, setOpen] = useState(false);
  const selected = value ?? internal;
  const trigger = useRequiredPicker(selected, required, disabled, () =>
    setOpen(true),
  );
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open)
      list.current
        ?.querySelector<HTMLElement>('[aria-selected="true"]')
        ?.focus();
  }, [open]);
  return (
    <div className={cn("select-field", className)} data-slot="select-field">
      {name && (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      )}
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        role="combobox"
        className="picker-trigger"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="listbox"
        aria-required={required}
        disabled={disabled || options.every((o) => o.disabled)}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp"].includes(e.key)) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span>
          {options.find((o) => o.value === selected)?.children ??
            "선택해 주세요"}
        </span>
        <ChevronDown aria-hidden="true" />
      </Button>
      {open && (
        <LedgerDrawer
          open
          title={`${label} 선택`}
          onClose={() => setOpen(false)}
        >
          <div
            id={id}
            ref={list}
            role="listbox"
            aria-label={label}
            className="picker-options"
            onKeyDown={(e) => {
              if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key))
                return;
              e.preventDefault();
              const items = [
                ...e.currentTarget.querySelectorAll<HTMLButtonElement>(
                  '[role="option"]:not(:disabled)',
                ),
              ];
              const index = items.indexOf(
                document.activeElement as HTMLButtonElement,
              );
              items[
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? items.length - 1
                    : (index +
                        (e.key === "ArrowDown" ? 1 : -1) +
                        items.length) %
                      items.length
              ]?.focus();
            }}
          >
            {options.map((option) => (
              <Button
                type="button"
                variant="ghost"
                key={option.value}
                role="option"
                aria-selected={selected === option.value}
                data-value={option.value}
                disabled={option.disabled}
                onClick={() => {
                  if (value === undefined) setInternal(option.value);
                  onValueChange?.(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.children}</span>
                {selected === option.value && <Check aria-hidden="true" />}
              </Button>
            ))}
          </div>
        </LedgerDrawer>
      )}
    </div>
  );
}
