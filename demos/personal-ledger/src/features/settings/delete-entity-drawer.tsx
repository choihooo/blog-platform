"use client";
import { useState } from "react";
import { LedgerDrawer } from "../../components/ledger-drawer";
import { SelectField, SelectOption } from "../../components/select-field";
import { Button } from "../../components/ui/button";
import type { Confirmation } from "../../components/confirm-dialog";
import { categoryKind } from "../../domain/analytics";
import type { Ledger, Command } from "../../domain/types";
import type { EditorTarget } from "./entity-drawer";
export function DeleteEntityDrawer({
  ledger,
  target,
  onClose,
  onDone,
  onCommand,
  onConfirm,
}: {
  ledger: Ledger;
  target: EditorTarget;
  onClose: () => void;
  onDone: () => void;
  onCommand: (command: Command) => Promise<void>;
  onConfirm: (value: Confirmation) => void;
}) {
  const { entity, id } = target;
  const item =
    entity === "group"
      ? ledger.groups.find((x) => x.id === id)
      : entity === "category"
        ? ledger.categories.find((x) => x.id === id)
        : ledger.payments.find((x) => x.id === id);
  const categories =
    entity === "group"
      ? ledger.categories.filter((c) => c.groupId === id).map((c) => c.id)
      : [id];
  const transactions = ledger.transactions.filter((t) =>
    entity === "payment"
      ? t.paymentId === id
      : categories.includes(t.categoryId),
  ).length;
  const assets =
    entity === "payment"
      ? 0
      : ledger.assets.filter((a) => categories.includes(a.categoryId)).length;
  const children = entity === "group" ? categories.length : 0;
  const used = transactions > 0 || assets > 0 || children > 0;
  const kind =
    entity === "group"
      ? ledger.groups.find((g) => g.id === id)?.kind
      : entity === "category"
        ? categoryKind(ledger, id!)
        : undefined;
  const choices =
    entity === "group"
      ? ledger.groups
          .filter(
            (g) =>
              g.id !== id &&
              g.active &&
              g.kind === kind &&
              !ledger.categories.some(
                (destination) =>
                  destination.groupId === g.id &&
                  ledger.categories.some(
                    (source) =>
                      source.groupId === id && source.name === destination.name,
                  ),
              ),
          )
          .map((g) => ({ id: g.id, name: g.name }))
      : entity === "category"
        ? ledger.categories
            .filter(
              (c) =>
                c.id !== id &&
                c.active &&
                categoryKind(ledger, c.id) === kind &&
                ledger.groups.find((g) => g.id === c.groupId)?.active,
            )
            .map((c) => ({
              id: c.id,
              name: `${ledger.groups.find((g) => g.id === c.groupId)?.name} · ${c.name}`,
            }))
        : ledger.payments
            .filter((p) => p.id !== id && p.active)
            .map((p) => ({ id: p.id, name: p.name }));
  const [replacement, setReplacement] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!item) return null;
  const noun =
    entity === "group"
      ? "그룹"
      : entity === "category"
        ? "카테고리"
        : "결제수단";
  const run = async (command: Command) => {
    setBusy(true);
    setError("");
    try {
      await onCommand(command);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "변경하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };
  const hide = () => {
    const common = { ...item, active: false };
    const command: Command =
      entity === "group"
        ? {
            type: "save-group",
            value: {
              ...ledger.groups.find((g) => g.id === id)!,
              active: false,
            },
          }
        : entity === "category"
          ? {
              type: "save-category",
              value: {
                ...ledger.categories.find((c) => c.id === id)!,
                active: false,
              },
            }
          : { type: "save-payment", value: common };
    void run(command);
  };
  const remove = () => {
    const command: Command =
      entity === "group"
        ? { type: "remove-group", id: id!, targetId: replacement || undefined }
        : entity === "category"
          ? {
              type: "remove-category",
              id: id!,
              targetId: replacement || undefined,
            }
          : {
              type: "remove-payment",
              id: id!,
              targetId: replacement || undefined,
            };
    const destination = choices.find((c) => c.id === replacement)?.name;
    onConfirm({
      title: `${item.name} 삭제`,
      description: used
        ? `거래 ${transactions}건·자산 ${assets}개${children ? `·카테고리 ${children}개` : ""}를 ‘${destination}’로 옮기고 삭제해요. 과거 결산도 변경될 수 있어요.`
        : "연결된 기록이 없는 항목을 삭제해요.",
      action: used ? "옮기고 삭제" : "삭제",
      onConfirm: () => void run(command),
    });
  };
  return (
    <LedgerDrawer open title={`${item.name} 삭제`} onClose={onClose}>
      <p className="delete-impact">
        연결된 거래 {transactions}건 · 자산 {assets}개
        {children > 0 ? ` · 카테고리 ${children}개` : ""}
      </p>
      <p className="dialog-helper">
        숨기면 새 거래에서만 보이지 않고 과거 기록은 그대로 남아요.
      </p>
      <Button
        type="button"
        variant="secondary"
        className="secondary full"
        disabled={busy}
        onClick={hide}
      >
        삭제 대신 숨기기
      </Button>
      {used && (
        <label className="field">
          <span>기록을 옮길 {noun}</span>
          <SelectField
            aria-label={`기록을 옮길 ${noun}`}
            value={replacement}
            onValueChange={setReplacement}
            disabled={!choices.length}
          >
            <SelectOption value="" disabled>
              옮길 곳 선택
            </SelectOption>
            {choices.map((choice) => (
              <SelectOption key={choice.id} value={choice.id}>
                {choice.name}
              </SelectOption>
            ))}
          </SelectField>
        </label>
      )}
      {used && !choices.length && (
        <p className="dialog-helper">
          {entity === "group"
            ? "같은 용도이면서 카테고리 이름이 겹치지 않는 그룹이 필요해요. 그룹을 추가하거나 숨기기를 이용해 주세요."
            : "같은 용도의 옮길 곳이 없어요. 항목을 먼저 추가하거나 숨기기를 이용해 주세요."}
        </p>
      )}
      <p className="form-error" role="alert">
        {error}
      </p>
      <Button
        type="button"
        variant="destructive"
        className="delete-confirm full"
        disabled={busy || (used && !replacement)}
        onClick={remove}
      >
        {used ? "옮기고 삭제" : "삭제"}
      </Button>
    </LedgerDrawer>
  );
}
