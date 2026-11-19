import { SwipeActions } from "./swipe-actions";
import { useHorizontalSwipe } from "../lib/gestures/use-horizontal-swipe";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Utensils,
  Wallet,
  Briefcase,
  ShoppingBag,
  Heart,
  Train,
  BookOpen,
} from "lucide-react";
import type { Kind, Ledger, Transaction } from "../domain/types";
import { categoryKind, money, monthLabel, today } from "../domain/analytics";
export const COLORS: Record<Kind, string> = {
  fixed: "#3182f6",
  living: "#18a5a5",
  income: "#1b64da",
  saving: "#a234c7",
};
export function Heading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="intro">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export function Period({
  month,
  onShift,
  onSelect,
  maxMonth = today().slice(0, 7),
}: {
  month: string;
  onShift: (n: number) => void;
  onSelect: () => void;
  maxMonth?: string;
}) {
  const swipe = useHorizontalSwipe((direction) => {
    if (direction === "left" && month < maxMonth) onShift(1);
    if (direction === "right" && month > "1900-01") onShift(-1);
  });
  return (
    <div className="period" {...swipe.bind}>
      <div className="period-main">
        <Button
          variant="ghost"
          className="icon-btn"
          onClick={() => onShift(-1)}
          aria-label="이전 달"
          disabled={month <= "1900-01"}
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="ghost"
          className="month-button h-auto p-0"
          onClick={onSelect}
        >
          {monthLabel(month)}
        </Button>
        <Button
          variant="ghost"
          className="icon-btn"
          onClick={() => onShift(1)}
          aria-label="다음 달"
          disabled={month >= maxMonth}
        >
          <ArrowRight />
        </Button>
      </div>
      <span className="period-note">월별 독립 결산</span>
    </div>
  );
}
export function TransactionRow({
  ledger,
  t,
  onEdit,
  onDelete,
}: {
  ledger: Ledger;
  t: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}) {
  const c = ledger.categories.find((c) => c.id === t.categoryId),
    kind = categoryKind(ledger, t.categoryId);
  let Icon =
    kind === "income"
      ? Wallet
      : kind === "fixed"
        ? Home
        : kind === "saving"
          ? Briefcase
          : Utensils;
  if (c?.name.includes("쇼핑")) Icon = ShoppingBag;
  if (c?.name.includes("의료")) Icon = Heart;
  if (c?.name.includes("교통")) Icon = Train;
  if (c?.name.includes("교육")) Icon = BookOpen;
  return (
    <SwipeActions
      label={t.description}
      onEdit={() => onEdit(t)}
      onDelete={onDelete ? () => onDelete(t) : undefined}
    >
      <button className="transaction" onClick={() => onEdit(t)}>
        <span className="transaction-icon" style={{ color: COLORS[kind] }}>
          <Icon />
        </span>
        <span className="transaction-main">
          <span className="transaction-title">{t.description}</span>
          <span className="transaction-meta block">
            {c?.name} ·{" "}
            {ledger.payments.find((p) => p.id === t.paymentId)?.name ??
              "미선택"}
          </span>
        </span>
        <span
          className={"transaction-value " + (kind === "income" ? "income" : "")}
        >
          {kind === "income" ? "+" : ""}
          {money(t.amount)}
        </span>
      </button>
    </SwipeActions>
  );
}
export function TransactionList({
  ledger,
  rows,
  onEdit,
  onDelete,
}: {
  ledger: Ledger;
  rows: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete?: (t: Transaction) => void;
}) {
  if (!rows.length)
    return (
      <div className="empty">
        <strong>아직 기록이 없어요</strong>첫 거래를 기록하면 여기에 모여요.
      </div>
    );
  return (
    <>
      {rows.map((t, i) => (
        <div key={t.id}>
          {rows[i - 1]?.date !== t.date && (
            <p className="group-date">
              {Number(t.date.slice(5, 7))}월 {Number(t.date.slice(8))}일
            </p>
          )}
          <TransactionRow
            ledger={ledger}
            t={t}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </>
  );
}
export type ChartItem = {
  id?: string;
  name: string;
  amount: number;
  color: string;
  onSelect?: () => void;
};
export function Donut({
  items,
  label,
  total,
}: {
  items: ChartItem[];
  label: string;
  total: number;
}) {
  const sum = items.reduce((n, i) => n + i.amount, 0);
  const interactive = items.some((i) => i.onSelect);
  const segments = items
    .filter((i) => i.amount > 0)
    .map((i, index, visible) => {
      const start =
        (visible.slice(0, index).reduce((n, item) => n + item.amount, 0) /
          sum) *
        100;
      const size = (i.amount / sum) * 100;
      return {
        item: i,
        start,
        size,
        color: `${i.color} ${start}% ${start + size}%`,
      };
    });
  return (
    <div className="chart-layout">
      <div
        className="donut"
        role={interactive ? "group" : "img"}
        aria-label={`${label} ${money(total)}`}
        style={{
          background: sum
            ? `conic-gradient(${segments.map((s) => s.color).join(",")})`
            : undefined,
        }}
      >
        {interactive && (
          <svg
            className="donut-hit-areas"
            viewBox="0 0 100 100"
            aria-label="자금 사용 비중 선택"
          >
            {segments
              .filter((s) => s.item.onSelect)
              .map(({ item, start, size }) => (
                <circle
                  key={item.id ?? item.name}
                  className="donut-segment"
                  cx="50"
                  cy="50"
                  r="43.25"
                  fill="none"
                  stroke="transparent"
                  strokeWidth="13.5"
                  pathLength="100"
                  strokeDasharray={`${size} ${100 - size}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 50 50)"
                  role="button"
                  tabIndex={0}
                  aria-label={`${item.name} 도넛 영역 선택`}
                  onClick={item.onSelect}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      item.onSelect?.();
                    }
                  }}
                />
              ))}
          </svg>
        )}
        <div className="donut-center">
          <small>{label}</small>
          <strong>{money(total)}</strong>
        </div>
      </div>
      <div className="legend">
        {items.map((i) => {
          const content = (
            <>
              <div className="legend-row">
                <span className="legend-label">
                  <i className="dot" style={{ background: i.color }} />
                  {i.name}
                </span>
                <strong>{sum ? Math.round((i.amount / sum) * 100) : 0}%</strong>
              </div>
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginLeft: 15 }}
              >
                {money(i.amount)}
              </div>
            </>
          );
          return i.onSelect ? (
            <Button
              key={i.id ?? i.name}
              variant="ghost"
              className="chart-legend-button"
              aria-label={`${i.name} 소분류 보기`}
              onClick={i.onSelect}
            >
              {content}
            </Button>
          ) : (
            <div key={i.id ?? i.name}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
