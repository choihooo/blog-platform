import { sampleQuotes } from '../../demo-model';
import { stockKey } from '../../domain/stocks';
export function useStockQuotes() {
  return {quotes: new Map(sampleQuotes.map(q=>[stockKey(q),q])), error:'예시 시세 · 실시간 가격이 아닙니다.', busy:false, async refresh() {}};
}
