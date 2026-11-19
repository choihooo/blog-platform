"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { LedgerDrawer } from "./ledger-drawer";
import { today } from "../domain/analytics";
import { useRequiredPicker } from "../lib/forms/use-required-picker";

type Props = {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
};
const isoMonth = (year: number, month: number) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
function CalendarField({
  label,
  value,
  defaultValue = "",
  onValueChange,
  name,
  min,
  max,
  required,
  disabled,
  clearable = false,
  mode,
}: Props & { mode: "date" | "month" }) {
  const [internal, setInternal] = useState(defaultValue),
    [open, setOpen] = useState(false);
  const selected = value ?? internal;
  const trigger = useRequiredPicker(selected, required, disabled, () =>
    setOpen(true),
  );
  const lower = min ?? (mode === "date" ? "1900-01-01" : "1900-01");
  const upper = max ?? (mode === "date" ? "9999-12-31" : "9999-12");
  const initial =
    selected || (today() < lower ? lower : today() > upper ? upper : today());
  const [view, setView] = useState(initial.slice(0, 7));
  const [panel, setPanel] = useState<"days" | "months" | "years">(
    mode === "date" ? "days" : "months",
  );
  const grid = useRef<HTMLDivElement>(null);
  const y = Number(view.slice(0, 4)),
    m = Number(view.slice(5, 7));
  const days = new Date(y, m, 0).getDate(),
    offset = new Date(y, m - 1, 1).getDay();
  const firstYear = Math.floor(y / 12) * 12;
  const minMonth = lower.slice(0, 7),
    maxMonth = upper.slice(0, 7);
  const choose = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
    setOpen(false);
  };
  const allowedMonth = (month: string) =>
    month >= minMonth && month <= maxMonth;
  const nextView = (direction: number) => {
    if (panel === "days") {
      const d = new Date(y, m - 1 + direction, 1);
      return isoMonth(d.getFullYear(), d.getMonth() + 1);
    }
    return isoMonth(y + direction * (panel === "years" ? 12 : 1), m);
  };
  const allowedMove = (direction: number) => {
    const target = nextView(direction),
      targetYear = Number(target.slice(0, 4));
    if (targetYear < 1900 || targetYear > 9999) return false;
    return panel === "days"
      ? allowedMonth(target)
      : panel === "months"
        ? targetYear >= Number(lower.slice(0, 4)) &&
          targetYear <= Number(upper.slice(0, 4))
        : Math.floor(targetYear / 12) * 12 + 11 >= Number(lower.slice(0, 4)) &&
          Math.floor(targetYear / 12) * 12 <= Number(upper.slice(0, 4));
  };
  const display = selected
    ? mode === "month"
      ? `${Number(selected.slice(0, 4))}년 ${Number(selected.slice(5))}월`
      : `${selected.replaceAll("-", ". ")}.`
    : "날짜 선택";
  return (
    <div className="date-field">
      {name && <input type="hidden" name={name} value={selected} />}
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        className="picker-trigger"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required}
        disabled={disabled}
        onClick={() => {
          setView(initial.slice(0, 7));
          setPanel(mode === "date" ? "days" : "months");
          setOpen(true);
        }}
      >
        <span>{display}</span>
      </Button>
      {open && (
        <LedgerDrawer
          open
          autoFocus
          title={`${label} 선택`}
          onClose={() => setOpen(false)}
        >
          <div className="calendar-toolbar">
            <Button
              type="button"
              variant="ghost"
              className="icon-btn"
              aria-label="이전 기간"
              disabled={!allowedMove(-1)}
              onClick={() => setView(nextView(-1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setPanel(
                  panel === "days"
                    ? "months"
                    : panel === "months"
                      ? "years"
                      : mode === "date"
                        ? "days"
                        : "months",
                )
              }
            >
              {panel === "days"
                ? `${y}년 ${m}월`
                : panel === "months"
                  ? `${y}년`
                  : `${firstYear}–${firstYear + 11}년`}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="icon-btn"
              aria-label="다음 기간"
              disabled={!allowedMove(1)}
              onClick={() => setView(nextView(1))}
            >
              <ChevronRight />
            </Button>
          </div>
          {panel === "days" && (
            <>
              <div className="calendar-weekdays" aria-hidden="true">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div
                ref={grid}
                className="calendar-days"
                role="group"
                aria-label={`${y}년 ${m}월 날짜`}
              >
                {Array.from({ length: 42 }, (_, i) => {
                  const day = i - offset + 1;
                  if (day < 1 || day > days) return <span key={i} />;
                  const date = `${view}-${String(day).padStart(2, "0")}`;
                  return (
                    <Button
                      key={date}
                      type="button"
                      variant="ghost"
                      data-date={date}
                      data-selected={date === selected || undefined}
                      aria-label={`${y}년 ${m}월 ${day}일`}
                      aria-pressed={date === selected}
                      aria-current={date === today() ? "date" : undefined}
                      disabled={date < lower || date > upper}
                      onClick={() => choose(date)}
                      onKeyDown={(e) => {
                        const amount = (
                          {
                            ArrowLeft: -1,
                            ArrowRight: 1,
                            ArrowUp: -7,
                            ArrowDown: 7,
                          } as Record<string, number>
                        )[e.key];
                        if (amount) {
                          e.preventDefault();
                          const target = `${view}-${String(day + amount).padStart(2, "0")}`;
                          grid.current
                            ?.querySelector<HTMLButtonElement>(
                              `[data-date="${target}"]:not(:disabled)`,
                            )
                            ?.focus();
                        }
                      }}
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
          {panel === "months" && (
            <div className="calendar-months" role="group" aria-label="월 선택">
              {Array.from({ length: 12 }, (_, i) => {
                const month = isoMonth(y, i + 1);
                return (
                  <Button
                    key={month}
                    type="button"
                    variant="ghost"
                    aria-label={`${y}년 ${i + 1}월`}
                    data-selected={month === selected.slice(0, 7) || undefined}
                    disabled={!allowedMonth(month)}
                    onClick={() => {
                      if (mode === "month") choose(month);
                      else {
                        setView(month);
                        setPanel("days");
                      }
                    }}
                  >
                    {i + 1}월
                  </Button>
                );
              })}
            </div>
          )}
          {panel === "years" && (
            <div
              className="calendar-months"
              role="group"
              aria-label="연도 선택"
            >
              {Array.from({ length: 12 }, (_, i) => firstYear + i).map(
                (year) => (
                  <Button
                    key={year}
                    type="button"
                    variant="ghost"
                    disabled={
                      year < Number(lower.slice(0, 4)) ||
                      year > Number(upper.slice(0, 4))
                    }
                    onClick={() => {
                      setView(isoMonth(year, m));
                      setPanel("months");
                    }}
                  >
                    {year}년
                  </Button>
                ),
              )}
            </div>
          )}
          {clearable && (
            <Button
              type="button"
              variant="ghost"
              className="calendar-clear"
              onClick={() => choose("")}
            >
              날짜 지우기
            </Button>
          )}
        </LedgerDrawer>
      )}
    </div>
  );
}
export function DateField(props: Props) {
  return <CalendarField {...props} mode="date" />;
}
export function MonthField(props: Props) {
  return <CalendarField {...props} mode="month" />;
}
