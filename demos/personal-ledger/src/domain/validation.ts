import { z } from "zod";
import { stockAssetSchema } from "./stocks";
import { DomainError, type Ledger } from "./types";
const id = z.string().min(1).max(100);
const name = z.string().trim().min(1).max(60);
const amount = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export function isDate(value: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "1900-01-01" ||
    value > "2200-12-31"
  )
    return false;
  const d = new Date(value + "T00:00:00Z");
  return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === value;
}
const date = z.string().refine(isDate, "올바른 날짜를 입력해 주세요.");
const group = z
  .object({
    id,
    name,
    kind: z.enum(["fixed", "living", "income", "saving"]),
    active: z.boolean(),
    order: z.number().int().min(0),
  })
  .strict();
const category = z
  .object({
    id,
    groupId: id,
    name,
    salary: z.boolean(),
    active: z.boolean(),
    order: z.number().int().min(0),
  })
  .strict();
const payment = z
  .object({ id, name, active: z.boolean(), order: z.number().int().min(0) })
  .strict();
const transaction = z
  .object({
    id,
    seq: z.number().int().positive(),
    date,
    categoryId: id,
    description: z.string().trim().min(1).max(100),
    amount: amount.refine((n) => n > 0),
    paymentId: id.nullable(),
  })
  .strict();
const manualAsset = z
  .object({
    id,
    kind: z.literal("manual").optional(),
    name,
    categoryId: id,
    quantity: z.string().max(30),
    unit: z.string().max(12),
    costKrw: amount,
    valueKrw: amount,
    asOf: date,
  })
  .strict();
const schema = z
  .object({
    schemaVersion: z.literal(1),
    nextSequence: z
      .number()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER - 1),
    groups: z.array(group).min(1).max(100),
    categories: z.array(category).max(500),
    payments: z.array(payment).max(100),
    transactions: z.array(transaction).max(10000),
    assets: z.array(z.union([manualAsset, stockAssetSchema])).max(500),
  })
  .strict();
export function validateLedger(input: unknown): Ledger {
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    throw new DomainError(
      "데이터 형식이 올바르지 않아요. 금액·날짜·필수 항목을 확인해 주세요.",
    );
  const l = parsed.data;
  for (const list of [
    l.groups,
    l.categories,
    l.payments,
    l.transactions,
    l.assets,
  ])
    if (new Set(list.map((x) => x.id)).size !== list.length)
      throw new DomainError("중복된 식별자가 있어요.");
  for (const list of [l.groups, l.payments, l.categories]) {
    const seen = new Set<string>();
    for (const item of list) {
      const scope = "groupId" in item ? item.groupId : "";
      const key = scope + "\0" + item.name;
      if (seen.has(key))
        throw new DomainError("같은 위치에 같은 이름이 있어요.");
      seen.add(key);
    }
  }
  const groups = new Map(l.groups.map((g) => [g.id, g]));
  const cats = new Map(l.categories.map((c) => [c.id, c]));
  const pays = new Set(l.payments.map((p) => p.id));
  if (l.categories.some((c) => !groups.has(c.groupId)))
    throw new DomainError("소분류의 대분류가 없어요.");
  if (
    l.transactions.some(
      (t) =>
        !cats.has(t.categoryId) ||
        (t.paymentId !== null && !pays.has(t.paymentId)),
    )
  )
    throw new DomainError("거래가 참조하는 분류·결제수단이 없어요.");
  if (
    new Set(l.transactions.map((t) => t.seq)).size !== l.transactions.length ||
    l.transactions.some((t) => t.seq >= l.nextSequence)
  )
    throw new DomainError("거래 순서가 올바르지 않아요.");
  if (
    l.assets.some(
      (a) =>
        groups.get(cats.get(a.categoryId)?.groupId ?? "")?.kind !== "saving",
    )
  )
    throw new DomainError("자산은 저축 및 투자 분류에 연결해 주세요.");
  if (
    l.transactions.reduce((n, t) => n + BigInt(t.amount), BigInt(0)) >
    BigInt(Number.MAX_SAFE_INTEGER)
  )
    throw new DomainError("합산 가능한 금액 범위를 초과했어요.");
  const stockKeys = l.assets
    .filter((a) => a.kind === "stock")
    .map((a) => `${a.market}:${a.symbol}`);
  if (stockKeys.length > 100)
    throw new DomainError("주식은 최대 100종목까지 추가할 수 있어요.");
  if (new Set(stockKeys).size !== stockKeys.length)
    throw new DomainError("이미 추가한 종목이에요. 기존 종목을 수정해 주세요.");
  if (new TextEncoder().encode(JSON.stringify(l)).byteLength > 950000)
    throw new DomainError(
      "첫 버전의 저장 용량을 초과했어요. 저장 구조 확장이 필요해요.",
    );
  return l;
}
