"use client";
import { SelectField, SelectOption } from "../../components/select-field";
import { useState } from "react";
import { LedgerDrawer } from "../../components/ledger-drawer";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { DeleteEntityDrawer } from "./delete-entity-drawer";
import type { Confirmation } from "../../components/confirm-dialog";
import {
  KIND_LABELS,
  type Ledger,
  type Command,
  type Kind,
} from "../../domain/types";
export type EditorTarget = {
  entity: "group" | "category" | "payment";
  id?: string;
  parent?: string;
};
export function EntityDrawer({
  ledger,
  target,
  onClose,
  onCommand,
  onConfirm,
}: {
  ledger: Ledger;
  target: EditorTarget;
  onClose: () => void;
  onCommand: (c: Command) => Promise<void>;
  onConfirm: (c: Confirmation) => void;
}) {
  const { entity, id } = target;
  const item =
    entity === "group"
      ? ledger.groups.find((g) => g.id === id)
      : entity === "category"
        ? ledger.categories.find((c) => c.id === id)
        : ledger.payments.find((p) => p.id === id);
  const category =
    entity === "category"
      ? ledger.categories.find((c) => c.id === id)
      : undefined;
  const group =
    entity === "group" ? ledger.groups.find((g) => g.id === id) : undefined;
  const [name, setName] = useState(item?.name ?? ""),
    [parent, setParent] = useState(
      category?.groupId ??
        target.parent ??
        ledger.groups.find((g) => g.active)?.id ??
        ledger.groups[0]?.id ??
        "",
    ),
    [kind, setKind] = useState<Kind>(group?.kind ?? "living"),
    [salary, setSalary] = useState(category?.salary ?? false),
    [active, setActive] = useState(item?.active ?? true),
    [advanced, setAdvanced] = useState(false),
    [deleting, setDeleting] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const count = ledger.transactions.filter((t) =>
    entity === "category"
      ? t.categoryId === id
      : entity === "payment"
        ? t.paymentId === id
        : ledger.categories.find((c) => c.id === t.categoryId)?.groupId === id,
  ).length;
  const assetCount =
    entity === "payment"
      ? 0
      : ledger.assets.filter((a) =>
          entity === "category"
            ? a.categoryId === id
            : ledger.categories.find((c) => c.id === a.categoryId)?.groupId ===
              id,
        ).length;
  const title =
    entity === "group"
      ? "그룹"
      : entity === "category"
        ? "카테고리"
        : "결제수단";
  const options =
    entity === "group"
      ? ledger.groups
      : entity === "category"
        ? ledger.categories
        : ledger.payments;
  const execute = async (command: Command) => {
    setBusy(true);
    setError("");
    try {
      await onCommand(command);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "설정을 저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };
  const save = () => {
    const siblings =
      entity === "category"
        ? ledger.categories.filter((c) => c.groupId === parent)
        : options;
    const keepOrder =
      item && (entity !== "category" || parent === category?.groupId);
    const common = {
      id: id ?? crypto.randomUUID(),
      name: name.trim(),
      active,
      order: keepOrder
        ? item.order
        : Math.max(-1, ...siblings.map((item) => item.order)) + 1,
    };
    const command: Command =
      entity === "group"
        ? { type: "save-group", value: { ...common, kind } }
        : entity === "category"
          ? {
              type: "save-category",
              value: {
                ...common,
                groupId: parent,
                salary:
                  ledger.groups.find((g) => g.id === parent)?.kind ===
                    "income" && salary,
              },
            }
          : { type: "save-payment", value: common };
    if (
      item &&
      ((entity === "group" && kind !== group?.kind) ||
        (entity === "category" &&
          (parent !== category?.groupId || salary !== category?.salary)))
    ) {
      onConfirm({
        title: "과거 집계도 바꿀까요?",
        description: `연결된 거래 ${count}건·자산 ${assetCount}개의 집계 기준이 변경돼요. 과거 결산과 전월 비교도 다시 계산돼요.`,
        action: "변경 적용",
        onConfirm: () => void execute(command),
      });
    } else void execute(command);
  };
  return (
    <LedgerDrawer
      open
      title={`${title} ${item ? "수정" : "추가"}`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="field">
          <span>이름</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
          />
        </label>
        <div className="setting-toggle">
          <div>
            <strong>새 거래에서 사용</strong>
            <small>
              {active
                ? "거래를 기록할 때 선택할 수 있어요."
                : "과거 기록은 유지하고 새 거래에서 숨겨요."}
            </small>
          </div>
          <Switch
            aria-label="새 거래에서 사용"
            checked={active}
            onCheckedChange={setActive}
            disabled={busy}
          />
        </div>
        {item && entity !== "payment" && (
          <button
            type="button"
            className="text-btn settings-advanced"
            aria-expanded={advanced}
            onClick={() => setAdvanced(!advanced)}
          >
            추가 설정{advanced ? " 닫기" : ""}
          </button>
        )}
        {entity === "category" && (!item || advanced) && (
          <label className="field">
            <span>그룹</span>
            <SelectField
              aria-label="그룹"
              value={parent}
              onValueChange={setParent}
              required
            >
              {ledger.groups.map((g) => (
                <SelectOption
                  key={g.id}
                  value={g.id}
                  disabled={assetCount > 0 && g.kind !== "saving"}
                >
                  {g.name}
                  {!g.active ? " (숨김)" : ""}
                </SelectOption>
              ))}
            </SelectField>
          </label>
        )}
        {entity === "group" && (!item || advanced) && (
          <label className="field">
            <span>그룹 용도</span>
            <SelectField
              aria-label="그룹 용도"
              value={kind}
              onValueChange={(value) => setKind(value as Kind)}
            >
              {Object.entries(KIND_LABELS).map(([k, n]) => (
                <SelectOption
                  key={k}
                  value={k}
                  disabled={assetCount > 0 && k !== "saving"}
                >
                  {n}
                </SelectOption>
              ))}
            </SelectField>
          </label>
        )}
        {!item && entity !== "payment" && (
          <button
            type="button"
            className="text-btn settings-advanced"
            aria-expanded={advanced}
            onClick={() => setAdvanced(!advanced)}
          >
            추가 설정{advanced ? " 닫기" : ""}
          </button>
        )}
        {advanced &&
          entity === "category" &&
          ledger.groups.find((g) => g.id === parent)?.kind === "income" && (
            <label className="field">
              <span>수입 구분</span>
              <SelectField
                aria-label="수입 구분"
                value={salary ? "salary" : "other"}
                onValueChange={(value) => setSalary(value === "salary")}
              >
                <SelectOption value="salary">급여수입으로 합산</SelectOption>
                <SelectOption value="other">기타수입으로 합산</SelectOption>
              </SelectField>
            </label>
          )}
        <p className="dialog-helper">
          {count || assetCount
            ? `거래 ${count}건 · 자산 ${assetCount}개에 사용 중이에요.`
            : "아직 연결된 기록이 없어요."}
        </p>
        <p className="form-error" role="alert">
          {error}
        </p>
        <Button className="primary full" disabled={busy}>
          {busy ? "저장 중…" : "설정 저장"}
        </Button>
        {item && (
          <button
            type="button"
            className="text-btn danger settings-delete-link"
            onClick={() => setDeleting(true)}
            disabled={busy}
          >
            {title} 삭제
          </button>
        )}
      </form>
      {deleting && (
        <DeleteEntityDrawer
          ledger={ledger}
          target={target}
          onClose={() => setDeleting(false)}
          onDone={onClose}
          onCommand={onCommand}
          onConfirm={onConfirm}
        />
      )}
    </LedgerDrawer>
  );
}
