"use client";
import { DateField } from "../../components/date-field";
import { SelectField, SelectOption } from "../../components/select-field";
import { StocksView } from "./stocks-view";
import { isStock } from "../../domain/stocks";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { LedgerDrawer } from "../../components/ledger-drawer";
import type { ManualAsset, Command, Ledger } from "../../domain/types";
import {
  categoryKind,
  money,
  summarize,
  monthRows,
  today,
} from "../../domain/analytics";
export function AssetsView({
  ledger,
  month,
  onCommand,
  ready,
}: {
  ledger: Ledger;
  month: string;
  ready: boolean;
  onCommand: (c: Command) => Promise<void>;
}) {
  const [edit, setEdit] = useState<ManualAsset | null | undefined>();
  const manualAssets = ledger.assets.filter(
    (a): a is ManualAsset => !isStock(a),
  );
  const categories = ledger.categories.filter(
    (c) => categoryKind(ledger, c.id) === "saving",
  );
  return (
    <>
      <section className="hero">
        <p className="hero-label">이번 달 저축 및 투자</p>
        <div className="hero-value">
          {summarize(ledger, month).saving.toLocaleString("ko-KR")}
          <span>원</span>
        </div>
      </section>
      <div className="divider" />
      <section className="section">
        <h2>항목별 납입금</h2>
        {categories.map((c) => (
          <div className="asset-row" key={c.id}>
            <strong>{c.name}</strong>
            <strong>
              {money(
                monthRows(ledger, month)
                  .filter((t) => t.categoryId === c.id)
                  .reduce((n, t) => n + t.amount, 0),
              )}
            </strong>
          </div>
        ))}
      </section>
      <div className="divider" />
      <StocksView ledger={ledger} onCommand={onCommand} ready={ready} />
      <div className="divider" />
      <section className="section">
        <div className="section-head">
          <h2>기타 자산</h2>
          <button className="text-btn" onClick={() => setEdit(null)}>
            자산 추가
          </button>
        </div>
        {manualAssets.map((a) => (
          <button
            className="asset-row w-full text-left"
            key={a.id}
            onClick={() => setEdit(a)}
          >
            <div>
              <strong>{a.name}</strong>
              <small>
                {a.quantity} {a.unit} · {a.asOf} 기준
              </small>
            </div>
            <div className="asset-values">
              <strong>{money(a.valueKrw)}</strong>
              <small>원가 {money(a.costKrw)}</small>
              <small>
                평가손익 {a.valueKrw - a.costKrw < 0 ? "−" : "+"}
                {money(a.valueKrw - a.costKrw)}
                {a.costKrw > 0
                  ? ` (${(((a.valueKrw - a.costKrw) / a.costKrw) * 100).toFixed(1)}%)`
                  : ""}
              </small>
            </div>
          </button>
        ))}
        {!manualAssets.length && (
          <p className="empty">
            보유수량과 원화 평가액을 직접 기록할 수 있어요.
          </p>
        )}
        <p className="settings-note mt-6">
          기타 자산은 원화 평가액을 직접 입력해요. 평가손익은 월별
          수입·여유자금에 합산하지 않아요.
        </p>
      </section>
      {edit !== undefined && (
        <AssetEditor
          key={edit?.id ?? "new"}
          ledger={ledger}
          asset={edit}
          onClose={() => setEdit(undefined)}
          onCommand={onCommand}
        />
      )}
    </>
  );
}
function AssetEditor({
  ledger,
  asset,
  onClose,
  onCommand,
}: {
  ledger: Ledger;
  asset: ManualAsset | null;
  onClose: () => void;
  onCommand: (c: Command) => Promise<void>;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <LedgerDrawer
      open
      title={asset ? "자산 수정" : "자산 추가"}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          try {
            await onCommand({
              type: "save-asset",
              value: {
                id: asset?.id ?? crypto.randomUUID(),
                name: String(f.get("name")),
                categoryId: String(f.get("category")),
                quantity: String(f.get("quantity")),
                unit: String(f.get("unit")),
                costKrw: Number(f.get("cost")),
                valueKrw: Number(f.get("value")),
                asOf: String(f.get("date")),
              },
            });
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "저장 실패");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          <span>자산 이름</span>
          <Input
            name="name"
            defaultValue={asset?.name}
            required
            maxLength={60}
          />
        </label>
        <label className="field">
          <span>저축 및 투자 소분류</span>
          <SelectField
            aria-label="저축 및 투자 소분류"
            name="category"
            defaultValue={asset?.categoryId}
          >
            {ledger.categories
              .filter((c) => categoryKind(ledger, c.id) === "saving")
              .map((c) => (
                <SelectOption key={c.id} value={c.id}>
                  {c.name}
                </SelectOption>
              ))}
          </SelectField>
        </label>
        <div className="two-fields">
          <label className="field">
            <span>보유수량</span>
            <Input
              name="quantity"
              defaultValue={asset?.quantity}
              maxLength={30}
            />
          </label>
          <label className="field">
            <span>단위·통화</span>
            <Input
              name="unit"
              placeholder="USD, g, 주"
              defaultValue={asset?.unit}
              maxLength={12}
            />
          </label>
        </div>
        <label className="field">
          <span>매입원가 (원)</span>
          <Input
            type="number"
            inputMode="numeric"
            name="cost"
            min={0}
            step={1}
            defaultValue={asset?.costKrw ?? 0}
            required
          />
        </label>
        <label className="field">
          <span>평가금액 (원)</span>
          <Input
            type="number"
            inputMode="numeric"
            name="value"
            min={0}
            step={1}
            defaultValue={asset?.valueKrw ?? 0}
            required
          />
        </label>
        <label className="field">
          <span>평가 기준일</span>
          <DateField
            label="평가 기준일"
            name="date"
            defaultValue={asset?.asOf ?? today()}
            required
          />
        </label>
        <p className="form-error" role="alert">
          {error}
        </p>
        <Button className="primary full" disabled={busy}>
          자산 저장
        </Button>
        {asset && (
          <button
            type="button"
            className="text-btn danger w-full mt-3"
            onClick={async () => {
              if (window.confirm("이 자산 기록을 삭제할까요?")) {
                try {
                  await onCommand({ type: "delete-asset", id: asset.id });
                  onClose();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "삭제 실패");
                }
              }
            }}
          >
            자산 삭제
          </button>
        )}
      </form>
    </LedgerDrawer>
  );
}
