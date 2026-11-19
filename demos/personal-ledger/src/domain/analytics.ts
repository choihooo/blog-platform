import { DomainError, type Kind, type Ledger, type Transaction } from "./types";
export const money = (n: number) => Math.abs(n).toLocaleString("ko-KR") + "원";
export const signedMoney = (n: number) =>
  (n > 0 ? "+" : n < 0 ? "−" : "") + money(n);
export function today() {
  return new Date().toLocaleDateString("sv-SE");
}
export function shiftMonth(month: string, step: number) {
  if (!/^\d{4}-\d{2}$/.test(month))
    throw new DomainError("월을 확인해 주세요.");
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + step, 1)).toISOString().slice(0, 7);
}
export function monthLabel(month: string) {
  return `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`;
}
export function categoryKind(l: Ledger, categoryId: string): Kind {
  const cat = l.categories.find((c) => c.id === categoryId);
  return l.groups.find((g) => g.id === cat?.groupId)?.kind ?? "living";
}
export function monthRows(l: Ledger, month: string): Transaction[] {
  return l.transactions.filter((t) => t.date.startsWith(month + "-"));
}
export function summarizeRows(l: Ledger, rows: Transaction[]) {
  const sum = {
    income: 0,
    salary: 0,
    other: 0,
    fixed: 0,
    living: 0,
    saving: 0,
    expense: 0,
    free: 0,
  };
  for (const t of rows) {
    const kind = categoryKind(l, t.categoryId);
    sum[kind] += t.amount;
    if (kind === "income")
      sum[
        l.categories.find((c) => c.id === t.categoryId)?.salary
          ? "salary"
          : "other"
      ] += t.amount;
  }
  sum.expense = sum.fixed + sum.living;
  sum.free = sum.income - sum.expense - sum.saving;
  return sum;
}
export function summarize(l: Ledger, month: string) {
  return summarizeRows(l, monthRows(l, month));
}
export function categoryBreakdown(l: Ledger, month: string, kind: Kind) {
  const amounts = new Map<string, number>();
  for (const row of monthRows(l, month)) {
    amounts.set(
      row.categoryId,
      (amounts.get(row.categoryId) ?? 0) + row.amount,
    );
  }
  return l.categories
    .filter((c) => categoryKind(l, c.id) === kind)
    .filter(
      (c) =>
        amounts.has(c.id) ||
        (c.active && l.groups.some((g) => g.id === c.groupId && g.active)),
    )
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ id: c.id, name: c.name, amount: amounts.get(c.id) ?? 0 }));
}
export function comparison(
  l: Ledger,
  month: string,
  mode: "whole" | "same",
  currentDate = today(),
) {
  const beforeMonth = shiftMonth(month, -1);
  const day =
    month === currentDate.slice(0, 7) ? Number(currentDate.slice(8)) : 31;
  const before = monthRows(l, beforeMonth).filter(
    (t) => mode === "whole" || Number(t.date.slice(8)) <= day,
  );
  const now = monthRows(l, month).filter(
    (t) => mode === "whole" || Number(t.date.slice(8)) <= day,
  );
  return l.categories.map((c) => {
    const a = before
        .filter((t) => t.categoryId === c.id)
        .reduce((n, t) => n + t.amount, 0),
      b = now
        .filter((t) => t.categoryId === c.id)
        .reduce((n, t) => n + t.amount, 0);
    return {
      id: c.id,
      name: c.name,
      kind: categoryKind(l, c.id),
      before: a,
      current: b,
      delta: b - a,
      rate: a ? ((b - a) / a) * 100 : null,
    };
  });
}
