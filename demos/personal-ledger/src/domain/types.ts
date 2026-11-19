export type Kind = "fixed" | "living" | "income" | "saving";
export type Group = {
  id: string;
  name: string;
  kind: Kind;
  active: boolean;
  order: number;
};
export type Category = {
  id: string;
  groupId: string;
  name: string;
  salary: boolean;
  active: boolean;
  order: number;
};
export type Payment = {
  id: string;
  name: string;
  active: boolean;
  order: number;
};
export type Transaction = {
  id: string;
  seq: number;
  date: string;
  categoryId: string;
  description: string;
  amount: number;
  paymentId: string | null;
};
export type ManualAsset = {
  kind?: "manual";
  id: string;
  name: string;
  categoryId: string;
  quantity: string;
  unit: string;
  costKrw: number;
  valueKrw: number;
  asOf: string;
};
export type StockAsset = {
  id: string;
  kind: "stock";
  name: string;
  categoryId: string;
  quantity: string;
  market: "KR" | "US";
  symbol: string;
  currency: "KRW" | "USD";
  purchasePrice: string;
};
export type Asset = ManualAsset | StockAsset;
export type Ledger = {
  schemaVersion: 1;
  nextSequence: number;
  groups: Group[];
  categories: Category[];
  payments: Payment[];
  transactions: Transaction[];
  assets: Asset[];
};
export type Snapshot = { ledger: Ledger; revision: number; mutationId: string };
export type Command =
  | { type: "save-transaction"; value: Omit<Transaction, "seq"> }
  | { type: "delete-transaction"; id: string }
  | {
      type: "reorder-items";
      entity: "group" | "category" | "payment";
      ids: string[];
    }
  | { type: "save-group"; value: Group }
  | { type: "save-category"; value: Category }
  | { type: "save-payment"; value: Payment }
  | { type: "remove-category"; id: string; targetId?: string }
  | { type: "remove-payment"; id: string; targetId?: string }
  | { type: "remove-group"; id: string; targetId?: string }
  | { type: "save-asset"; value: Asset }
  | { type: "delete-asset"; id: string };
export const KIND_LABELS: Record<Kind, string> = {
  fixed: "고정비용",
  living: "생활비",
  income: "수입",
  saving: "저축 및 투자",
};
export class DomainError extends Error {}
