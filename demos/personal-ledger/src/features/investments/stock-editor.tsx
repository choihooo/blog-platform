"use client";
import { useState } from "react";
import { LedgerDrawer } from "../../components/ledger-drawer";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { SelectField, SelectOption } from "../../components/select-field";
import { categoryKind } from "../../domain/analytics";
import type { Ledger, StockAsset, Command } from "../../domain/types";
import type { StockListing } from "../../domain/stocks";
import { api } from "../../lib/sync/client";
export function StockEditor({
  ledger,
  stock,
  onSave,
  onClose,
}: {
  ledger: Ledger;
  stock: StockAsset | null;
  onSave: (c: Command) => Promise<void>;
  onClose: () => void;
}) {
  const [market, setMarket] = useState<"KR" | "US">(stock?.market ?? "KR"),
    [symbol, setSymbol] = useState(stock?.symbol ?? ""),
    [name, setName] = useState(stock?.name ?? ""),
    [query, setQuery] = useState(""),
    [results, setResults] = useState<StockListing[]>([]),
    [error, setError] = useState(""),
    [searching, setSearching] = useState(false),
    [busy, setBusy] = useState(false);
  const categories = ledger.categories.filter(
    (c) => c.active && categoryKind(ledger, c.id) === "saving",
  );
  return (
    <LedgerDrawer
      open
      title={stock ? "종목 수정" : "종목 추가"}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          const f = new FormData(e.currentTarget);
          try {
            await onSave({
              type: "save-asset",
              value: {
                id: stock?.id ?? crypto.randomUUID(),
                kind: "stock",
                name: name.trim() || symbol.trim(),
                market,
                symbol: symbol.trim().toUpperCase(),
                currency: market === "KR" ? "KRW" : "USD",
                quantity: String(f.get("quantity")).replaceAll(",", "").trim(),
                purchasePrice: String(f.get("purchasePrice"))
                  .replaceAll(",", "")
                  .trim(),
                categoryId: String(f.get("category")),
              },
            });
            onClose();
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "종목을 저장하지 못했어요.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          <span>시장</span>
          <SelectField
            aria-label="시장"
            value={market}
            onValueChange={(value) => {
              setMarket(value as "KR" | "US");
              setResults([]);
            }}
          >
            <SelectOption value="KR">국내 주식 · KRW</SelectOption>
            <SelectOption value="US">미국 주식 · USD</SelectOption>
          </SelectField>
        </label>
        <label className="field">
          <span>종목 검색</span>
          <div className="stock-search">
            <Input
              aria-label="종목 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="종목명 또는 코드"
              maxLength={60}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={searching || query.trim().length < 2}
              onClick={async () => {
                setSearching(true);
                setError("");
                try {
                  const data = await api<{ items: StockListing[] }>(
                    `/api/stock-search?market=${market}&q=${encodeURIComponent(query.trim())}`,
                  );
                  setResults(data.items);
                  if (!data.items.length)
                    setError(
                      "검색 결과가 없어요. 종목코드를 직접 입력할 수도 있어요.",
                    );
                } catch (e) {
                  setError(
                    e instanceof Error ? e.message : "검색하지 못했어요.",
                  );
                } finally {
                  setSearching(false);
                }
              }}
            >
              {searching ? "검색 중" : "검색"}
            </Button>
          </div>
        </label>
        {results.length > 0 && (
          <div className="stock-search-results">
            {results.map((r) => (
              <Button
                key={r.currency + ":" + r.symbol}
                type="button"
                variant="ghost"
                onClick={() => {
                  setSymbol(r.symbol);
                  setName(r.name);
                  setMarket(r.market);
                  setResults([]);
                  setError("");
                }}
              >
                {r.name} · {r.symbol}
              </Button>
            ))}
          </div>
        )}
        <div className="two-fields">
          <label className="field">
            <span>종목코드·티커</span>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder={market === "KR" ? "005930" : "AAPL"}
              required
              maxLength={32}
              autoCapitalize="characters"
              autoCorrect="off"
            />
          </label>
          <label className="field">
            <span>종목명</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="직접 입력 가능"
              maxLength={60}
            />
          </label>
        </div>
        <div className="two-fields">
          <label className="field">
            <span>보유수량</span>
            <Input
              name="quantity"
              inputMode="decimal"
              defaultValue={stock?.quantity ?? ""}
              placeholder="10"
              required
              maxLength={24}
            />
          </label>
          <label className="field">
            <span>평균 매입단가 ({market === "KR" ? "원" : "USD"})</span>
            <Input
              name="purchasePrice"
              inputMode="decimal"
              defaultValue={stock?.purchasePrice ?? ""}
              placeholder={market === "KR" ? "70000" : "180.50"}
              required
              maxLength={24}
            />
          </label>
        </div>
        <label className="field">
          <span>저축 및 투자 소분류</span>
          <SelectField
            name="category"
            aria-label="저축 및 투자 소분류"
            defaultValue={
              stock?.categoryId ?? categories.find((c) => c.name === "기타")?.id
            }
          >
            {categories.map((c) => (
              <SelectOption key={c.id} value={c.id}>
                {c.name}
              </SelectOption>
            ))}
          </SelectField>
        </label>
        <p className="dialog-helper">
          수량과 매입단가는 직접 입력해요. 현재가만 토스증권에서 가져와요.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button className="primary full" disabled={busy || !categories.length}>
          {busy ? "저장 중" : "종목 저장"}
        </Button>
        {stock && (
          <Button
            type="button"
            variant="ghost"
            className="danger w-full mt-3"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm("이 종목을 삭제할까요?")) return;
              setBusy(true);
              try {
                await onSave({ type: "delete-asset", id: stock.id });
                onClose();
              } catch (e) {
                setError(e instanceof Error ? e.message : "삭제 실패");
              } finally {
                setBusy(false);
              }
            }}
          >
            종목 삭제
          </Button>
        )}
      </form>
    </LedgerDrawer>
  );
}
