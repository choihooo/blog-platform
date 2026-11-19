import {
  Plus,
  ChartNoAxesColumn,
  ChevronRight,
  Wallet,
  Briefcase,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Donut, TransactionList } from "../../components/ledger-shared";
import {
  summarize,
  monthRows,
  shiftMonth,
  money,
  categoryKind,
} from "../../domain/analytics";
import type { Ledger, Transaction } from "../../domain/types";
import { UsageChart } from "./usage-chart";
export function DashboardView({
  ledger,
  month,
  onAdd,
  onEdit,
  onDelete,
  onNavigate,
}: {
  ledger: Ledger;
  month: string;
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  onNavigate: (screen: "transactions" | "salary" | "assets") => void;
}) {
  const t = summarize(ledger, month),
    prev = summarize(ledger, shiftMonth(month, -1)),
    diff = prev.expense - t.expense;
  const rows = monthRows(ledger, month);
  const paymentColors = [
    "#3182f6",
    "#18a5a5",
    "#a234c7",
    "#ffc342",
    "#f57800",
    "#6b7684",
    "#b0b8c1",
  ];
  const paymentItems = [
    ...ledger.payments.map((p, i) => ({
      name: p.name,
      amount: rows
        .filter(
          (r) =>
            r.paymentId === p.id &&
            ["fixed", "living"].includes(categoryKind(ledger, r.categoryId)),
        )
        .reduce((n, r) => n + r.amount, 0),
      color: paymentColors[i % paymentColors.length],
    })),
    {
      name: "미선택",
      amount: rows
        .filter(
          (r) =>
            !r.paymentId &&
            ["fixed", "living"].includes(categoryKind(ledger, r.categoryId)),
        )
        .reduce((n, r) => n + r.amount, 0),
      color: "#333d4b",
    },
  ]
    .filter((i) => i.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  return (
    <>
      <section className="hero">
        <p className="hero-label">
          이번 달 {t.free < 0 ? "부족 금액" : "여유자금"}
        </p>
        <div className="hero-value">
          {Math.abs(t.free).toLocaleString("ko-KR")}
          <span>원</span>
        </div>
        <p className="context-note">
          <ChartNoAxesColumn />
          {diff === 0
            ? "지난달과 지출이 같아요"
            : `지난달보다 지출이 ${money(diff)} ${diff >= 0 ? "줄었어요" : "늘었어요"}`}
        </p>
        <div className="summary-strip">
          <div>
            <small>총 수입</small>
            <strong>{money(t.income)}</strong>
          </div>
          <div>
            <small>총 지출</small>
            <strong>{money(t.expense)}</strong>
          </div>
          <div>
            <small>저축 및 투자</small>
            <strong>{money(t.saving)}</strong>
          </div>
        </div>
        <Button className="primary full" onClick={onAdd}>
          <Plus />
          거래 기록하기
        </Button>
      </section>
      <div className="divider" />
      <UsageChart key={month} ledger={ledger} month={month} summary={t} />
      <div className="divider" />
      <section className="section">
        <div className="section-head">
          <h2>최근 기록</h2>
          <button
            className="text-btn"
            onClick={() => onNavigate("transactions")}
          >
            전체 보기
          </button>
        </div>
        <TransactionList
          ledger={ledger}
          rows={rows
            .sort((a, b) => b.date.localeCompare(a.date) || b.seq - a.seq)
            .slice(0, 4)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </section>
      <div className="divider" />
      <section className="section">
        <div className="section-head">
          <h2>결제수단별 지출</h2>
        </div>
        {paymentItems.length ? (
          <Donut items={paymentItems} label="총 지출" total={t.expense} />
        ) : (
          <p className="empty">지출을 기록하면 결제수단별로 보여드려요.</p>
        )}
      </section>
      <div className="divider" />
      <section className="section">
        {[
          ["salary", "급여수입 모아보기"],
          ["assets", "저축 및 투자 현황"],
        ].map(([screen, title]) => (
          <button
            key={screen}
            className="setting-row w-full"
            onClick={() => onNavigate(screen as "salary" | "assets")}
          >
            {screen === "salary" ? <Wallet /> : <Briefcase />}
            <span className="setting-name text-left">{title}</span>
            <ChevronRight />
          </button>
        ))}
      </section>
    </>
  );
}
