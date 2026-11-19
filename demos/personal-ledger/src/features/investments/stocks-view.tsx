"use client";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import type { Ledger, StockAsset, Command } from "../../domain/types";
import { isStock, stockKey, stockPrice } from "../../domain/stocks";
import { StockEditor } from "./stock-editor";
import { useStockQuotes } from "./use-stock-quotes";
export function StocksView({
  ledger,
  onCommand,
  ready,
}: {
  ledger: Ledger;
  onCommand: (c: Command) => Promise<void>;
  ready: boolean;
}) {
  const [edit, setEdit] = useState<StockAsset | null | undefined>();
  const stocks = ledger.assets.filter(isStock),
    prices = useStockQuotes();
  const symbols = stocks.map(stockKey).sort().join(",");
  const refresh = prices.refresh;
  useEffect(() => {
    if (symbols && ready) void refresh();
  }, [symbols, ready, refresh]);
  return (
    <section className="section">
      <div className="section-head">
        <h2>내 주식</h2>
        <Button
          type="button"
          variant="ghost"
          className="text-btn"
          onClick={() => setEdit(null)}
        >
          종목 추가
        </Button>
      </div>
      {stocks.map((stock) => {
        const quote = prices.quotes.get(stockKey(stock));
        return (
          <button
            className="stock-card"
            key={stock.id}
            onClick={() => setEdit(stock)}
            aria-label={`${stock.name} 종목 수정`}
          >
            <div className="stock-card-title">
              <strong>{stock.name}</strong>
              <span>
                {stock.symbol} · {stock.market === "KR" ? "국내" : "미국"} ·{" "}
                {stock.quantity}주
              </span>
            </div>
            <div className="stock-prices">
              <div>
                <small>평균 매입단가</small>
                <strong>
                  {stockPrice(stock.purchasePrice, stock.currency)}
                </strong>
              </div>
              <div>
                <small>현재가</small>
                <strong>
                  {quote ? stockPrice(quote.price, quote.currency) : "—"}
                </strong>
              </div>
            </div>
            <small className="stock-price-time">
              {quote
                ? quote.priceAt
                  ? `${new Date(quote.priceAt).toLocaleString("ko-KR")} 시세`
                  : `시세 시각 미제공 · ${new Date(quote.fetchedAt).toLocaleString("ko-KR")} 조회`
                : "아직 가격을 받지 못했어요."}
            </small>
          </button>
        );
      })}
      {!stocks.length && (
        <p className="empty">
          <strong>종목을 직접 추가해 보세요</strong>수량과 평균 매입단가를
          입력하면 현재가와 함께 볼 수 있어요.
        </p>
      )}
      {stocks.length > 0 && (
        <Button
          type="button"
          variant="secondary"
          className="secondary w-full stock-refresh"
          disabled={prices.busy || !ready}
          onClick={() => void refresh()}
        >
          {prices.busy ? "현재가 확인 중" : "현재가 새로고침"}
        </Button>
      )}
      {prices.error && (
        <p className="form-error" role="status">
          {prices.error}
        </p>
      )}
      {edit !== undefined && (
        <StockEditor
          key={edit?.id ?? "new-stock"}
          ledger={ledger}
          stock={edit}
          onSave={onCommand}
          onClose={() => setEdit(undefined)}
        />
      )}
    </section>
  );
}
