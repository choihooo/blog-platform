"use client";
import { DateField } from "../../components/date-field";
import { Input } from "../../components/ui/input";
import { SelectField, SelectOption } from "../../components/select-field";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { TransactionList } from "../../components/ledger-shared";
import { monthRows, money, summarizeRows } from "../../domain/analytics";
import type { Ledger, Transaction } from "../../domain/types";
export function TransactionsView({
  ledger,
  month,
  onAdd,
  onEdit,
  onDelete,
  initialCategory = "",
}: {
  ledger: Ledger;
  month: string;
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  initialCategory?: string;
}) {
  const [q, setQ] = useState(""),
    [group, setGroup] = useState(""),
    [category, setCategory] = useState(initialCategory),
    [payment, setPayment] = useState(""),
    [sort, setSort] = useState("new"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const rows = monthRows(ledger, month)
    .filter(
      (t) =>
        (!q || t.description.toLowerCase().includes(q.toLowerCase())) &&
        (!group ||
          ledger.categories.find((c) => c.id === t.categoryId)?.groupId ===
            group) &&
        (!category || t.categoryId === category) &&
        (!payment || t.paymentId === payment) &&
        (!from || t.date >= from) &&
        (!to || t.date <= to),
    )
    .sort((a, b) =>
      sort === "high"
        ? b.amount - a.amount
        : sort === "low"
          ? a.amount - b.amount
          : sort === "old"
            ? a.date.localeCompare(b.date) || a.seq - b.seq
            : b.date.localeCompare(a.date) || b.seq - a.seq,
    );
  const totals = summarizeRows(ledger, rows);
  return (
    <div className="filters">
      <Button
        className="primary full"
        style={{ marginTop: 0, marginBottom: 20 }}
        onClick={onAdd}
      >
        <Plus />
        거래 추가
      </Button>
      <Input
        type="search"
        className="search"
        aria-label="거래 내용 검색"
        placeholder="거래 내용 검색"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="filter-row">
        <SelectField
          aria-label="대분류 필터"
          value={group}
          onValueChange={(value) => {
            setGroup(value);
            setCategory("");
          }}
        >
          <SelectOption value="">모든 분류</SelectOption>
          {ledger.groups.map((g) => (
            <SelectOption key={g.id} value={g.id}>
              {g.name}
            </SelectOption>
          ))}
        </SelectField>
        <SelectField
          aria-label="소분류 필터"
          value={category}
          onValueChange={(value) => setCategory(value)}
        >
          <SelectOption value="">모든 소분류</SelectOption>
          {ledger.categories
            .filter((c) => !group || c.groupId === group)
            .map((c) => (
              <SelectOption key={c.id} value={c.id}>
                {c.name}
              </SelectOption>
            ))}
        </SelectField>
      </div>
      <div className="filter-row">
        <SelectField
          aria-label="결제수단 필터"
          value={payment}
          onValueChange={(value) => setPayment(value)}
        >
          <SelectOption value="">모든 결제수단</SelectOption>
          {ledger.payments.map((p) => (
            <SelectOption key={p.id} value={p.id}>
              {p.name}
            </SelectOption>
          ))}
        </SelectField>
        <SelectField
          aria-label="정렬"
          value={sort}
          onValueChange={(value) => setSort(value)}
        >
          <SelectOption value="new">최신순</SelectOption>
          <SelectOption value="old">오래된순</SelectOption>
          <SelectOption value="high">금액 높은순</SelectOption>
          <SelectOption value="low">금액 낮은순</SelectOption>
        </SelectField>
      </div>
      <div className="date-range">
        <label>
          시작일
          <DateField
            label="시작일"
            value={from}
            onValueChange={setFrom}
            min={month + "-01"}
            max={to || undefined}
            clearable
          />
        </label>
        <label>
          종료일
          <DateField
            label="종료일"
            value={to}
            onValueChange={setTo}
            min={from || month + "-01"}
            clearable
          />
        </label>
      </div>
      <div className="filter-total">
        <span>{rows.length}건의 기록</span>
        <span>
          수입 {money(totals.income)} · 지출 {money(totals.expense)} · 저축{" "}
          {money(totals.saving)}
        </span>
      </div>
      <div className="mt-6">
        <TransactionList
          ledger={ledger}
          rows={rows}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
