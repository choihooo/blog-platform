"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { COLORS, Donut } from "../../components/ledger-shared";
import { categoryBreakdown, money, type summarize } from "../../domain/analytics";
import { KIND_LABELS, type Kind, type Ledger } from "../../domain/types";

const CATEGORY_COLORS = [
  "#18a5a5",
  "#3182f6",
  "#a234c7",
  "#f57800",
  "#6b7684",
  "#1b64da",
];

export function UsageChart({
  ledger,
  month,
  summary,
}: {
  ledger: Ledger;
  month: string;
  summary: ReturnType<typeof summarize>;
}) {
  const [selected, setSelected] = useState<Exclude<Kind, "income"> | null>(
    null,
  );
  const items = selected
    ? categoryBreakdown(ledger, month, selected).map((c, i) => ({
        ...c,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
    : [
        ...(["fixed", "living", "saving"] as const).map((kind) => ({
          id: kind,
          name: KIND_LABELS[kind],
          amount: summary[kind],
          color: COLORS[kind],
          onSelect: () => setSelected(kind),
        })),
        {
          name: "여유자금",
          amount: Math.max(0, summary.free),
          color: "#e5e8eb",
        },
      ];
  const label = selected
    ? KIND_LABELS[selected]
    : summary.free < 0
      ? "총 사용액"
      : "총 수입";
  const total = selected
    ? summary[selected]
    : summary.free < 0
      ? summary.expense + summary.saving
      : summary.income;

  return (
    <section className="section" aria-label="어디에 사용했을까요?">
      <div className="section-head">
        <h2 aria-live="polite">
          {selected
            ? `${KIND_LABELS[selected]} 소분류`
            : "어디에 사용했을까요?"}
        </h2>
        {selected && (
          <Button
            variant="ghost"
            className="text-btn"
            onClick={() => setSelected(null)}
          >
            전체 보기
          </Button>
        )}
      </div>
      <Donut items={items} label={label} total={total} />
      {selected && total === 0 && (
        <p className="section-foot">이번 달 기록이 없어요.</p>
      )}
      {!selected && (
        <div className="filter-total">
          <span>급여수입 {money(summary.salary)}</span>
          <span>기타수입 {money(summary.other)}</span>
        </div>
      )}
    </section>
  );
}
