"use client";
import { SelectField, SelectOption } from "../../components/select-field";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { DateField } from "../../components/date-field";
import { Input } from "../../components/ui/input";
import { LedgerDrawer } from "../../components/ledger-drawer";
import {
  KIND_LABELS,
  type Kind,
  type Ledger,
  type Transaction,
  type Command,
} from "../../domain/types";
import { categoryKind, today } from "../../domain/analytics";
export function EntryDrawer({
  ledger,
  transaction,
  onClose,
  onSave,
  onDelete,
}: {
  ledger: Ledger;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (c: Command) => Promise<void>;
  onDelete?: (id: string) => void;
}) {
  const [kind, setKind] = useState<Kind>(
    transaction ? categoryKind(ledger, transaction.categoryId) : "living",
  );
  const allowed = ledger.categories
    .filter(
      (c) =>
        (c.active &&
          ledger.groups.some(
            (g) => g.id === c.groupId && g.active && g.kind === kind,
          )) ||
        (c.id === transaction?.categoryId &&
          categoryKind(ledger, c.id) === kind),
    )
    .sort((a, b) => a.order - b.order);
  const [category, setCategory] = useState(
      transaction?.categoryId ?? allowed[0]?.id ?? "",
    ),
    [amount, setAmount] = useState(
      transaction?.amount.toLocaleString("ko-KR") ?? "",
    ),
    [description, setDescription] = useState(transaction?.description ?? ""),
    [date, setDate] = useState(transaction?.date ?? today()),
    [payment, setPayment] = useState(
      transaction?.paymentId ?? ledger.payments.find((p) => p.active)?.id ?? "",
    ),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const changeKind = (k: Kind) => {
    setKind(k);
    setCategory(
      ledger.categories
        .filter(
          (c) =>
            c.active &&
            ledger.groups.some(
              (g) => g.id === c.groupId && g.active && g.kind === k,
            ),
        )
        .sort((a, b) => a.order - b.order)[0]?.id ?? "",
    );
  };
  return (
    <LedgerDrawer
      open
      onClose={onClose}
      title={transaction ? "거래 수정" : "거래 기록"}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setSaving(true);
          try {
            await onSave({
              type: "save-transaction",
              value: {
                id: transaction?.id ?? crypto.randomUUID(),
                date,
                description,
                categoryId: category,
                amount: Number(amount.replaceAll(",", "")),
                paymentId:
                  kind === "income" ? payment || null : payment || null,
              },
            });
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "저장하지 못했어요.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="segmented">
          {Object.entries(KIND_LABELS).map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={kind === k ? "active" : ""}
              aria-pressed={kind === k}
              onClick={() => changeKind(k as Kind)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="field">
          <span>금액</span>
          <Input
            className="amount-input"
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9]/g, "");
              setAmount(v ? Number(v).toLocaleString("ko-KR") : "");
            }}
            aria-label="금액, 원"
            placeholder="0"
            required
          />
        </label>
        <label className="field">
          <span>내용</span>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="어디에 사용했나요?"
            maxLength={100}
            required
          />
        </label>
        <div className="two-fields">
          <label className="field">
            <span>날짜</span>
            <DateField
              label="날짜"
              value={date}
              onValueChange={setDate}
              required
            />
          </label>
          <label className="field">
            <span>소분류</span>
            <SelectField
              aria-label="소분류"
              value={category}
              onValueChange={(value) => setCategory(value)}
              required
            >
              <SelectOption value="" disabled>
                선택
              </SelectOption>
              {allowed.map((c) => (
                <SelectOption key={c.id} value={c.id}>
                  {c.name}
                  {!c.active ? " (사용 중지)" : ""}
                </SelectOption>
              ))}
            </SelectField>
          </label>
        </div>
        <label className="field">
          <span>결제수단</span>
          <SelectField
            aria-label="결제수단"
            value={payment}
            onValueChange={(value) => setPayment(value)}
            required={kind !== "income"}
          >
            <SelectOption value="">미선택</SelectOption>
            {ledger.payments
              .filter((p) => p.active || p.id === transaction?.paymentId)
              .sort((a, b) => a.order - b.order)
              .map((p) => (
                <SelectOption key={p.id} value={p.id}>
                  {p.name}
                </SelectOption>
              ))}
          </SelectField>
        </label>
        <p className="form-error" role="alert">
          {error}
        </p>
        <Button className="primary full" disabled={saving || !allowed.length}>
          {saving ? "저장 중…" : "저장"}
        </Button>
        {!allowed.length && (
          <p className="dialog-helper">
            설정에서 사용할 소분류를 먼저 추가해 주세요.
          </p>
        )}
        {transaction && (
          <button
            className="text-btn danger w-full mt-3"
            type="button"
            onClick={() => onDelete?.(transaction.id)}
          >
            거래 삭제
          </button>
        )}
      </form>
    </LedgerDrawer>
  );
}
