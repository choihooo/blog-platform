import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(join(tmpdir(), 'ledger-demo-test-'));
const bundle = join(dir, 'model.mjs');
await build({ entryPoints: ['demos/personal-ledger/src/demo-model.ts'], outfile: bundle, bundle: true, platform: 'node', format: 'esm' });
const { createDemoStore, demoApi } = await import(pathToFileURL(bundle).href);
test.after(() => rm(dir, { recursive: true, force: true }));

test('demo saves, edits and deletes using ledger rules without changing another reader’s data', () => {
 const a = createDemoStore('2026-11-17'), b = createDemoStore('2026-11-17');
 const before = b.read();
 const value = { id:'test', date:'2026-11-17', categoryId:'living-0', description:'점심', amount:10000, paymentId:'payment-1' };
 a.execute({type:'save-transaction',value});
 assert.equal(a.read().transactions.find(t=>t.id==='test').amount,10000);
 a.execute({type:'save-transaction',value:{...value,amount:12000}});
 assert.equal(a.read().transactions.filter(t=>t.id==='test').length,1);
 assert.equal(a.read().transactions.find(t=>t.id==='test').amount,12000);
 a.execute({type:'delete-transaction',id:'test'});
 assert.equal(a.read().transactions.some(t=>t.id==='test'),false);
 assert.deepEqual(b.read(),before);
});
test('reset restores sample data and invalid commands leave records intact', () => {
 const store=createDemoStore('2026-01-01'), initial=store.read();
 assert.ok(initial.transactions.some(t=>t.date.startsWith('2025-12')));
 assert.ok(initial.transactions.some(t=>t.date.startsWith('2026-01')));
 assert.ok(initial.transactions.every(t=>t.date<='2026-01-01'));
 assert.throws(()=>store.execute({type:'save-transaction',value:{id:'bad',date:'2026-01-01',categoryId:'missing',description:'',amount:100,paymentId:null}}));
 assert.deepEqual(store.read(),initial);
 store.execute({type:'delete-transaction',id:initial.transactions[0].id});
 store.reset();
 assert.deepEqual(store.read(),initial);
 const leaked=store.read(); leaked.transactions.length=0;
 assert.ok(store.read().transactions.length>0);
});
test('sample API supports stock search and rejects all unknown routes without a network call', async () => {
 const result=await demoApi('/api/stock-search?market=KR&q=삼성');
 assert.equal(result.items[0].symbol,'005930');
 assert.equal((await demoApi('/api/stock-search?market=US&q=애플')).items[0].symbol,'AAPL');
 const quotes=await demoApi('/api/stock-quotes');
 assert.ok(quotes.quotes.some(q=>q.symbol==='005930'&&q.price==='70000'));
 await assert.rejects(()=>demoApi('/api/ledger'));
 await assert.rejects(()=>demoApi('https://example.com/api/stock-quotes'));
});
