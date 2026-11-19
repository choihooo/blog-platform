"use client";
import { SelectField, SelectOption } from "../../components/select-field";
import { useState } from "react";
import {
  comparison,
  money,
  signedMoney,
  shiftMonth,
  monthLabel,
  today,
} from "../../domain/analytics";
import { KIND_LABELS, type Kind, type Ledger } from "../../domain/types";
export function ComparisonView({
  ledger,
  month,
  onDetail,
}: {
  ledger: Ledger;
  month: string;
  onDetail: (categoryId: string, month: string) => void;
}) {
  const [kind, setKind] = useState<Kind>("living"),
    [mode, setMode] = useState<"whole" | "same">("whole"),
    [sort, setSort] = useState("delta"),
    [selected, setSelected] = useState("");
  const data = comparison(ledger, month, mode)
    .filter(
      (r) =>
        r.kind === kind &&
        (!selected || r.id === selected) &&
        (r.before || r.current),
    )
    .sort((a, b) =>
      sort === "current"
        ? b.current - a.current
        : sort === "rate"
          ? (b.rate ?? Infinity) - (a.rate ?? Infinity)
          : b.delta - a.delta,
    );
  const delta = data.reduce((n, r) => n + r.delta, 0);
  const beforeMonth = shiftMonth(month, -1),
    day = month === today().slice(0, 7) ? Number(today().slice(8)) : 31;
  const lastDay = (m: string) =>
    new Date(Number(m.slice(0, 4)), Number(m.slice(5)), 0).getDate();
  return (
    <>
      <div className="px-6">
        <div className="segmented">
          <button
            className={mode === "whole" ? "active" : ""}
            onClick={() => setMode("whole")}
            aria-pressed={mode === "whole"}
          >
            월 전체
          </button>
          <button
            className={mode === "same" ? "active" : ""}
            onClick={() => setMode("same")}
            aria-pressed={mode === "same"}
          >
            같은 날짜까지
          </button>
        </div>
        <div className="filter-row">
          <SelectField
            aria-label="비교 대분류"
            value={kind}
            onValueChange={(value) => {
              setKind(value as Kind);
              setSelected("");
            }}
          >
            {Object.entries(KIND_LABELS).map(([k, label]) => (
              <SelectOption key={k} value={k}>
                {label}
              </SelectOption>
            ))}
          </SelectField>
          <SelectField
            aria-label="비교 소분류"
            value={selected}
            onValueChange={(value) => setSelected(value)}
          >
            <SelectOption value="">모든 소분류</SelectOption>
            {comparison(ledger, month, mode)
              .filter((r) => r.kind === kind)
              .map((r) => (
                <SelectOption key={r.id} value={r.id}>
                  {r.name}
                </SelectOption>
              ))}
          </SelectField>
          <SelectField
            aria-label="비교 정렬"
            value={sort}
            onValueChange={(value) => setSort(value)}
          >
            <SelectOption value="delta">증감액순</SelectOption>
            <SelectOption value="rate">증감률순</SelectOption>
            <SelectOption value="current">이번 달 금액순</SelectOption>
          </SelectField>
        </div>
      </div>
      <section className="compare-intro">
        <strong>
          {delta === 0
            ? "지난달과 금액이 같아요"
            : `지난달보다 ${money(delta)} ${delta > 0 ? "늘었어요" : "줄었어요"}`}
        </strong>
        <p>
          {monthLabel(beforeMonth)}{" "}
          {mode === "whole"
            ? "전체"
            : `1~${Math.min(day, lastDay(beforeMonth))}일`}{" "}
          ↔ {monthLabel(month)}{" "}
          {mode === "whole" ? "전체" : `1~${Math.min(day, lastDay(month))}일`}
        </p>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>소분류별 {KIND_LABELS[kind]}</h2>
        </div>
        {data.map((r) => (
          <div className="compare-item" key={r.id}>
            <div className="compare-title">
              <strong>{r.name}</strong>
              <span
                className={
                  "delta " + (r.delta < 0 ? "down" : r.delta > 0 ? "up" : "")
                }
              >
                {signedMoney(r.delta)} ·{" "}
                {r.rate === null
                  ? "신규"
                  : `${r.rate > 0 ? "+" : ""}${Math.round(r.rate)}%`}
              </span>
            </div>
            {[
              ["지난달", r.before, beforeMonth],
              ["이번 달", r.current, month],
            ].map(([label, value, m]) => (
              <div key={label} className="bar-line">
                <button
                  onClick={() => onDetail(r.id, String(m))}
                  aria-label={`${r.name} ${label} 거래 보기`}
                >
                  {label}
                </button>
                <div className="bar-track">
                  <div
                    className={
                      "bar-fill " + (label === "이번 달" ? "current" : "")
                    }
                    style={{
                      width:
                        (Number(value) / Math.max(r.before, r.current, 1)) *
                          100 +
                        "%",
                    }}
                  />
                </div>
                <strong>{money(Number(value))}</strong>
              </div>
            ))}
          </div>
        ))}
        {!data.length && (
          <p className="empty">선택한 기간에 비교할 기록이 없어요.</p>
        )}
        <p className="section-foot">
          지난달·이번 달을 누르면 해당 거래를 볼 수 있어요.
        </p>
      </section>
    </>
  );
}
