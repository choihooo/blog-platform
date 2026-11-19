"use client";
import { useScreenHistory, type Screen } from "./use-screen-history";
import { useState } from "react";
import { Home, List, ChartNoAxesColumn, Settings } from "lucide-react";
import { LaunchScreen } from "../../components/launch-screen";
import { useLedger } from "./use-ledger";
import { usePwa } from "../pwa/use-pwa";
import { DashboardView } from "../dashboard/dashboard-view";
import { TransactionsView } from "../transactions/transactions-view";
import { EntryDrawer } from "../transactions/entry-drawer";
import { ComparisonView } from "../comparison/comparison-view";
import { SalaryView } from "../income/salary-view";
import { SettingsView } from "../settings/settings-view";
import { AssetsView } from "../investments/assets-view";
import { ConfirmDialog, type Confirmation } from "../../components/confirm-dialog";
import { Heading, Period } from "../../components/ledger-shared";
import { LedgerDrawer } from "../../components/ledger-drawer";
import { Button } from "../../components/ui/button";
import { MonthField } from "../../components/date-field";
import { shiftMonth, today } from "../../domain/analytics";
import type { Transaction } from "../../domain/types";

const titles: Record<Screen, string> = {
  home: "차곡차곡, 나의 한 달",
  transactions: "거래 내역",
  compare: "지난달과 비교",
  settings: "설정",
  salary: "급여수입",
  assets: "저축 및 투자",
};
export function LedgerApp() {
  const controller = useLedger(),
    pwa = usePwa();
  const [screen, setScreen] = useScreenHistory();
  const [month, setMonth] = useState(today().slice(0, 7)),
    [monthOpen, setMonthOpen] = useState(false),
    [monthDraft, setMonthDraft] = useState(today().slice(0, 7)),
    [entry, setEntry] = useState<Transaction | null | undefined>(),
    [confirm, setConfirm] = useState<Confirmation | null>(null),
    [category, setCategory] = useState("");
  const currentMonth = today().slice(0, 7);
  const validMonth =
    /^\d{4}-(0[1-9]|1[0-2])$/.test(monthDraft) &&
    monthDraft >= "1900-01" &&
    monthDraft <= currentMonth;
  const navigate = (s: Screen) => {
    setScreen(s);
    setCategory("");
    window.scrollTo(0, 0);
  };
  if (controller.phase === "loading") return <LaunchScreen />;
  if (controller.phase === "error" || !controller.record)
    return (
      <div className="app">
        <main className="login" role="alert">
          <p>{controller.error || "가계부를 열 수 없어요."}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
          {pwa.available && <Button onClick={pwa.update}>업데이트 적용</Button>}
        </main>
      </div>
    );
  const { ledger } = controller.record;
  const deleteEntry = (id: string) =>
    setConfirm({
      title: "거래를 삭제할까요?",
      description: "이 거래가 월별 내역과 결산에서 빠져요.",
      action: "삭제",
      onConfirm: () =>
        void controller
          .execute({ type: "delete-transaction", id })
          .then(() => setEntry(undefined))
          .catch((e) => controller.setError(e.message)),
    });
  return (
    <div className="app">
      {controller.error && (
        <div className="app-message" role="alert">
          {controller.error}
          <button onClick={() => controller.setError("")}>닫기</button>
        </div>
      )}
      {pwa.available && (
        <div className="app-message">
          새 버전이 준비됐어요. 저장한 기록은 유지돼요.
          <button onClick={pwa.update}>업데이트 적용</button>
        </div>
      )}
      {controller.conflict && (
        <div className="app-message" role="alert">
          서버와 이 기기의 변경이 달라요. 유지할 데이터를 선택해 주세요.
          <div className="conflict-actions">
            <button
              onClick={() =>
                setConfirm({
                  title: "이 기기 데이터를 서버에 저장할까요?",
                  description:
                    "다른 기기의 서버 변경을 이 기기 내용으로 교체해요.",
                  action: "기기 데이터 유지",
                  onConfirm: () =>
                    void controller
                      .resolve("local")
                      .catch((e) => controller.setError(e.message)),
                })
              }
            >
              기기 데이터 유지
            </button>
            <button
              onClick={() =>
                setConfirm({
                  title: "서버 데이터를 가져올까요?",
                  description:
                    "이 기기의 미전송 변경을 서버에 저장된 내용으로 교체해요.",
                  action: "서버 데이터 사용",
                  onConfirm: () =>
                    void controller
                      .resolve("server")
                      .catch((e) => controller.setError(e.message)),
                })
              }
            >
              서버 데이터 사용
            </button>
          </div>
        </div>
      )}
      <main>
        <Heading title={titles[screen]} />
        {!["settings", "salary"].includes(screen) && (
          <Period
            month={month}
            onShift={(n) => {
              try {
                const next = shiftMonth(month, n);
                if (next >= "1900-01" && next <= currentMonth) setMonth(next);
              } catch {
                controller.setError(
                  "이동할 수 있는 날짜 범위를 확인해 주세요.",
                );
              }
            }}
            maxMonth={currentMonth}
            onSelect={() => {
              setMonthDraft(month);
              setMonthOpen(true);
            }}
          />
        )}
        {screen === "home" && (
          <DashboardView
            ledger={ledger}
            month={month}
            onAdd={() => setEntry(null)}
            onEdit={setEntry}
            onDelete={(t) => deleteEntry(t.id)}
            onNavigate={navigate}
          />
        )}
        {screen === "transactions" && (
          <TransactionsView
            key={month + category}
            ledger={ledger}
            month={month}
            initialCategory={category}
            onAdd={() => setEntry(null)}
            onEdit={setEntry}
            onDelete={(t) => deleteEntry(t.id)}
          />
        )}
        {screen === "compare" && (
          <ComparisonView
            ledger={ledger}
            month={month}
            onDetail={(id, m) => {
              setCategory(id);
              setMonth(m);
              setScreen("transactions");
              window.scrollTo(0, 0);
            }}
          />
        )}
        {screen === "settings" && (
          <SettingsView
            ledger={ledger}
            onCommand={controller.execute}
            onConfirm={setConfirm}
          />
        )}
        {screen === "salary" && (
          <SalaryView
            ledger={ledger}
            year={Number(month.slice(0, 4))}
            onEdit={setEntry}
            onDelete={(t) => deleteEntry(t.id)}
          />
        )}
        {screen === "assets" && (
          <AssetsView
            ledger={ledger}
            month={month}
            onCommand={controller.execute}
            ready={!controller.record.pending}
          />
        )}
      </main>
      <nav className="bottom-nav" aria-label="주요 메뉴">
        {(
          [
            ["home", "홈", Home],
            ["transactions", "내역", List],
            ["compare", "비교", ChartNoAxesColumn],
            ["settings", "설정", Settings],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            className="nav-item"
            aria-current={
              screen === value ||
              (value === "home" && ["salary", "assets"].includes(screen))
                ? "page"
                : undefined
            }
            onClick={() => navigate(value)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {entry !== undefined && (
        <EntryDrawer
          key={entry?.id ?? "new"}
          ledger={ledger}
          transaction={entry}
          onClose={() => setEntry(undefined)}
          onSave={controller.execute}
          onDelete={deleteEntry}
        />
      )}
      {monthOpen && (
        <LedgerDrawer open title="월 선택" onClose={() => setMonthOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = String(new FormData(e.currentTarget).get("month"));
              if (validMonth && v === monthDraft) {
                setMonth(v);
                setMonthOpen(false);
              }
            }}
          >
            <label className="field">
              <span>보고 싶은 달</span>
              <MonthField
                label="보고 싶은 달"
                name="month"
                min="1900-01"
                max={currentMonth}
                value={monthDraft}
                onValueChange={setMonthDraft}
                required
              />
            </label>
            <Button className="primary full" disabled={!validMonth}>
              이 달 보기
            </Button>
          </form>
        </LedgerDrawer>
      )}
      <ConfirmDialog value={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
