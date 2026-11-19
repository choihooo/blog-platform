import { DomainError, type Command, type Ledger } from "./types";
import { validateLedger } from "./validation";
function upsert<T extends { id: string }>(list: T[], value: T) {
  const index = list.findIndex((x) => x.id === value.id);
  if (index < 0) list.push(value);
  else list[index] = value;
}
export function applyCommand(input: Ledger, command: Command): Ledger {
  const l = structuredClone(input);
  switch (command.type) {
    case "save-transaction": {
      const t = command.value,
        existing = l.transactions.find((x) => x.id === t.id),
        cat = l.categories.find((x) => x.id === t.categoryId),
        group = l.groups.find((x) => x.id === cat?.groupId),
        pay = l.payments.find((x) => x.id === t.paymentId);
      if (!cat || !group) throw new DomainError("분류를 선택해 주세요.");
      if (group.kind !== "income" && !t.paymentId)
        throw new DomainError("지출과 저축에는 결제수단이 필요해요.");
      if (
        (!existing || existing.categoryId !== t.categoryId) &&
        (!cat.active || !group.active)
      )
        throw new DomainError("사용 중지한 분류는 새 거래에 사용할 수 없어요.");
      if (
        t.paymentId &&
        (!pay || (!pay.active && existing?.paymentId !== t.paymentId))
      )
        throw new DomainError("사용할 수 있는 결제수단을 선택해 주세요.");
      upsert(l.transactions, {
        ...t,
        description: t.description.trim(),
        seq: existing?.seq ?? l.nextSequence++,
      });
      break;
    }
    case "delete-transaction":
      l.transactions = l.transactions.filter((t) => t.id !== command.id);
      break;
    case "reorder-items": {
      const list =
        command.entity === "group"
          ? l.groups
          : command.entity === "category"
            ? l.categories
            : l.payments;
      const ids = new Set(command.ids);
      if (
        ids.size !== command.ids.length ||
        ids.size < 2 ||
        command.ids.some((id) => !list.some((item) => item.id === id))
      )
        throw new DomainError("이동할 항목을 확인해 주세요.");
      const parents =
        command.entity === "category"
          ? new Set(
              l.categories.filter((c) => ids.has(c.id)).map((c) => c.groupId),
            )
          : undefined;
      if (parents && parents.size !== 1)
        throw new DomainError("같은 그룹 안에서만 순서를 바꿀 수 있어요.");
      const scope =
        command.entity === "category"
          ? l.categories.filter((c) => parents!.has(c.groupId))
          : list;
      const sorted = [...scope].sort(
        (a, b) => a.order - b.order || a.id.localeCompare(b.id),
      );
      let next = 0;
      const ordered = sorted.map((item) => {
        if (!ids.has(item.id)) return item;
        const replacementId = command.ids[next++];
        return list.find((candidate) => candidate.id === replacementId)!;
      });
      ordered.forEach((item, order) => {
        item.order = order;
      });
      break;
    }
    case "save-group":
      upsert(l.groups, { ...command.value, name: command.value.name.trim() });
      break;
    case "save-category":
      upsert(l.categories, {
        ...command.value,
        name: command.value.name.trim(),
      });
      break;
    case "save-payment":
      upsert(l.payments, { ...command.value, name: command.value.name.trim() });
      break;
    case "save-asset":
      upsert(l.assets, command.value);
      break;
    case "delete-asset":
      l.assets = l.assets.filter((x) => x.id !== command.id);
      break;
    case "remove-category": {
      const used =
        l.transactions.some((t) => t.categoryId === command.id) ||
        l.assets.some((a) => a.categoryId === command.id);
      if (
        used &&
        (!command.targetId ||
          command.targetId === command.id ||
          !l.categories.some((c) => c.id === command.targetId))
      )
        throw new DomainError("기존 기록을 옮길 소분류를 선택해 주세요.");
      l.transactions = l.transactions.map((t) =>
        t.categoryId === command.id
          ? { ...t, categoryId: command.targetId! }
          : t,
      );
      l.assets = l.assets.map((a) =>
        a.categoryId === command.id
          ? { ...a, categoryId: command.targetId! }
          : a,
      );
      l.categories = l.categories.filter((c) => c.id !== command.id);
      break;
    }
    case "remove-payment": {
      if (
        l.transactions.some((t) => t.paymentId === command.id) &&
        (!command.targetId ||
          command.targetId === command.id ||
          !l.payments.some((p) => p.id === command.targetId))
      )
        throw new DomainError("기존 기록을 옮길 결제수단을 선택해 주세요.");
      l.transactions = l.transactions.map((t) =>
        t.paymentId === command.id ? { ...t, paymentId: command.targetId! } : t,
      );
      l.payments = l.payments.filter((p) => p.id !== command.id);
      break;
    }
    case "remove-group": {
      if (
        l.categories.some((c) => c.groupId === command.id) &&
        (!command.targetId ||
          command.targetId === command.id ||
          !l.groups.some((g) => g.id === command.targetId))
      )
        throw new DomainError("소분류를 옮길 대분류를 선택해 주세요.");
      l.categories = l.categories.map((c) =>
        c.groupId === command.id ? { ...c, groupId: command.targetId! } : c,
      );
      l.groups = l.groups.filter((g) => g.id !== command.id);
      break;
    }
  }
  return validateLedger(l);
}
