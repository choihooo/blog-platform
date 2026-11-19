import { z } from "zod";
import type { Asset, StockAsset } from "./types";
export const decimal = z.string().regex(/^(0|[1-9]\d{0,14})(\.\d{1,8})?$/);
export const stockAssetSchema = z
  .object({
    id: z.string().min(1).max(100),
    kind: z.literal("stock"),
    name: z.string().trim().min(1).max(60),
    categoryId: z.string().min(1).max(100),
    quantity: decimal.refine((v) => /[1-9]/.test(v)),
    market: z.enum(["KR", "US"]),
    symbol: z.string().min(1).max(32),
    currency: z.enum(["KRW", "USD"]),
    purchasePrice: decimal,
  })
  .strict()
  .superRefine((s, ctx) => {
    if (
      (s.market === "KR" &&
        (!/^[0-9A-Z]{6}$/.test(s.symbol) || s.currency !== "KRW")) ||
      (s.market === "US" &&
        (!/^[A-Z][A-Z0-9.\-]{0,14}$/.test(s.symbol) || s.currency !== "USD"))
    )
      ctx.addIssue({
        code: "custom",
        message: "시장과 종목코드·통화를 확인해 주세요.",
      });
  });
export const quoteSchema = z.object({
  symbol: z.string().min(1).max(32),
  currency: z.enum(["KRW", "USD"]),
  price: decimal,
  priceAt: z.string().datetime({ offset: true }).nullable(),
  fetchedAt: z.string().datetime({ offset: true }),
});
export type StockQuote = z.infer<typeof quoteSchema>;
export type StockListing = {
  symbol: string;
  name: string;
  market: "KR" | "US";
  currency: "KRW" | "USD";
};
export const isStock = (a: Asset): a is StockAsset => a.kind === "stock";
export const stockKey = (s: { symbol: string; currency: string }) =>
  `${s.currency}:${s.symbol}`;
export function stockPrice(value: string, currency: "KRW" | "USD") {
  const [whole, fraction] = value.split(".");
  const formatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return currency === "USD"
    ? `$${formatted}.${(fraction ?? "").padEnd(2, "0")}`
    : `${formatted}${fraction ? "." + fraction : ""}원`;
}
