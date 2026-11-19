"use client";
import { SelectField, SelectOption } from "../../components/select-field";
import { useState } from "react";
import type { Ledger, Transaction } from "../../domain/types";
import { categoryKind, money, today } from "../../domain/analytics";
import { TransactionList } from "../../components/ledger-shared";
export function SalaryView({
  ledger,
  year: initialYear,
  onEdit,
  onDelete,
}: {
  ledger: Ledger;
  year: number;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  const [year, setYear] = useState(initialYear),
    [month, setMonth] = useState("");
  const rows = ledger.transactions.filter(
    (t) =>
      t.date.startsWith(year + "-") &&
      categoryKind(ledger, t.categoryId) === "income" &&
      ledger.categories.find((c) => c.id === t.categoryId)?.salary,
  );
  const months = Array.from({ length: 12 }, (_, i) =>
    rows
      .filter((t) => Number(t.date.slice(5, 7)) === i + 1)
      .reduce((n, t) => n + t.amount, 0),
  );
  const total = months.reduce((a, b) => a + b, 0),
    count = months.filter(Boolean).length,
    max = Math.max(...months, 1);
  return (
    <>
      <section className="section">
        <div className="section-head">
          <h2>{year}년 총 급여</h2>
          <SelectField
            className="year-select"
            aria-label="급여 조회 연도"
            value={String(year)}
            onValueChange={(value) => {
              const nextYear = Number(value);
              setYear(nextYear);
              if (
                `${nextYear}-${String(month || 1).padStart(2, "0")}` >
                today().slice(0, 7)
              )
                setMonth("");
            }}
          >
            {Array.from(
              { length: Number(today().slice(0, 4)) - 1899 },
              (_, i) => Number(today().slice(0, 4)) - i,
            ).map((value) => (
              <SelectOption key={value} value={value}>
                {value}년
              </SelectOption>
            ))}
          </SelectField>
        </div>
        <div className="salary-total">{money(total)}</div>
        <p className="small">
          월평균 {money(Math.round(total / (count || 1)))} · 급여가 기록된{" "}
          {count}개월 기준
        </p>
        <div
          className="salary-chart"
          role="img"
          aria-label={months.map((n, i) => `${i + 1}월 ${money(n)}`).join(", ")}
        >
          {months.map((n, i) => (
            <div key={i} className="salary-column">
              <div
                className="salary-bar"
                style={{
                  height: (n / max) * 130,
                  opacity:
                    `${year}-${String(i + 1).padStart(2, "0")}` >
                    today().slice(0, 7)
                      ? 0.35
                      : 1,
                }}
              />
              <small>{i + 1}</small>
            </div>
          ))}
        </div>
      </section>
      <div className="divider" />
      <section className="section">
        <div className="section-head salary-record-head">
          <h2>급여 기록</h2>
          <SelectField
            className="year-select"
            aria-label="급여 조회 월"
            value={month}
            onValueChange={(value) => setMonth(value)}
          >
            <SelectOption value="">전체 월</SelectOption>
            {months.map((_, i) => (
              <SelectOption
                key={i}
                value={i + 1}
                disabled={
                  `${year}-${String(i + 1).padStart(2, "0")}` >
                  today().slice(0, 7)
                }
              >
                {i + 1}월
              </SelectOption>
            ))}
          </SelectField>
        </div>
        <TransactionList
          ledger={ledger}
          rows={rows
            .filter(
              (t) => !month || Number(t.date.slice(5, 7)) === Number(month),
            )
            .sort((a, b) => b.date.localeCompare(a.date))}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </section>
    </>
  );
}
