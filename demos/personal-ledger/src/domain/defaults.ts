import type { Category, Kind, Ledger } from "./types";
import { KIND_LABELS } from "./types";
export function emptyLedger(): Ledger {
  const names: Record<Kind, string[]> = {
    fixed: ["교통비", "알뜰요금제", "월세", "관리비", "도시가스", "구독료"],
    living: [
      "식비",
      "쇼핑·뷰티",
      "문화·취미",
      "사회생활",
      "의료·건강",
      "교육·자기개발",
    ],
    income: ["급여수입", "기타수입"],
    saving: ["ISA", "연금저축", "달러", "금", "기타"],
  };
  return {
    schemaVersion: 1,
    nextSequence: 1,
    groups: Object.entries(KIND_LABELS).map(([kind, name], order) => ({
      id: kind,
      name,
      kind: kind as Kind,
      active: true,
      order,
    })),
    categories: Object.entries(names).flatMap(([groupId, list]) =>
      list.map((name, order): Category => ({
        id: `${groupId}-${order}`,
        groupId,
        name,
        salary: groupId === "income" && order === 0,
        active: true,
        order,
      })),
    ),
    payments: [
      "가족카드",
      "토스뱅크",
      "계좌이체",
      "카카오페이",
      "네이버페이",
      "신용카드",
      "기타",
    ].map((name, order) => ({
      id: `payment-${order}`,
      name,
      order,
      active: true,
    })),
    transactions: [],
    assets: [],
  };
}
