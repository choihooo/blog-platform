import { emptyLedger } from './domain/defaults';
import { applyCommand } from './domain/ledger';
import { shiftMonth } from './domain/analytics';
import type { Command, Ledger } from './domain/types';
import type { StockListing, StockQuote } from './domain/stocks';

// Fictional examples using the real app's schema, categories and calculation rules.
function sampleLedger(date: string): Ledger {
  let ledger = emptyLedger();
  const month = date.slice(0, 7), previous = shiftMonth(month, -1);
  const examples: [string, string, number, number][] = [
    ['income-0', '급여', 3000000, 1],
    ['fixed-2', '월세', 550000, 2],
    ['saving-0', 'ISA 적립', 400000, 3],
    ['living-0', '점심', 11000, 6],
    ['fixed-0', '교통카드', 62000, 7],
    ['living-2', '영화', 15000, 10],
    ['living-0', '장보기', 48600, 12],
    ['living-0', '커피', 4500, 15],
  ];
  for (const [m, prior] of [[previous, true], [month, false]] as const) {
    examples.forEach(([categoryId, description, amount, day], index) => {
      ledger = applyCommand(ledger, { type: 'save-transaction', value: {
        id: `sample-${m}-${index}`, date: `${m}-${String(prior ? day : Math.min(day, Number(date.slice(8,10)))).padStart(2,'0')}`,
        categoryId, description, amount: prior && categoryId.startsWith('living') ? amount + 3000 : amount,
        paymentId: categoryId.startsWith('income') ? null : 'payment-1',
      }});
    });
  }
  ledger = applyCommand(ledger, { type: 'save-asset', value: {
    id:'sample-stock', kind:'stock', name:'삼성전자', categoryId:'saving-0', quantity:'10',
    market:'KR', symbol:'005930', currency:'KRW', purchasePrice:'65000',
  }});
  return ledger;
}
export function createDemoStore(date: string) {
  const initial = sampleLedger(date);
  let ledger = structuredClone(initial);
  return {
    read: () => structuredClone(ledger),
    execute(command: Command) { ledger = applyCommand(ledger, command); },
    reset() { ledger = structuredClone(initial); },
  };
}
const listings: StockListing[] = [
  {symbol:'005930',name:'삼성전자',market:'KR',currency:'KRW'},
  {symbol:'000660',name:'SK하이닉스',market:'KR',currency:'KRW'},
  {symbol:'AAPL',name:'애플',market:'US',currency:'USD'},
  {symbol:'MSFT',name:'마이크로소프트',market:'US',currency:'USD'},
];
export const sampleQuotes: StockQuote[] = listings.map((s, i) => ({
  symbol:s.symbol, currency:s.currency, price:['70000','180000','225','420'][i],
  priceAt:null, fetchedAt:'2026-11-16T00:00:00Z',
}));
export async function demoApi<T = unknown>(path: string): Promise<T> {
  if (!path.startsWith('/api/')) throw new Error('데모에서 지원하지 않는 요청입니다.');
  const url = new URL(path, 'https://demo.invalid');
  if (url.pathname === '/api/stock-quotes') return {quotes:structuredClone(sampleQuotes)} as T;
  if (url.pathname === '/api/stock-search') {
    const q=(url.searchParams.get('q') ?? '').trim().toLowerCase();
    const market=url.searchParams.get('market');
    return {items:listings.filter(s=>s.market===market && (s.name.toLowerCase().includes(q)||s.symbol.toLowerCase().includes(q)))} as T;
  }
  throw new Error('데모에서 지원하지 않는 요청입니다.');
}
