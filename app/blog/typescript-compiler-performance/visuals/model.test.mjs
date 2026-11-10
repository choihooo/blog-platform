import test from 'node:test';
import assert from 'node:assert/strict';
import { compareShape, shouldEmit, reduction, buildTimings, phaseTimings } from './model.ts';

test('structural comparison accepts extra properties but rejects missing and mismatched types', () => {
  assert.deepEqual(compareShape({ name: 'string', age: 'number', extra: 'boolean' }, { name: 'string', age: 'number' }), []);
  assert.deepEqual(compareShape({ name: 'string' }, { name: 'string', age: 'number' }), ['age 속성이 없습니다.']);
  assert.deepEqual(compareShape({ name: 'string', age: 'string' }, { name: 'string', age: 'number' }), ['age: string → number에 대입할 수 없습니다.']);
});

test('ordinary tsc output is blocked only when errors and noEmitOnError are both enabled', () => {
  assert.equal(shouldEmit(true, true), false);
  assert.equal(shouldEmit(true, false), true);
  assert.equal(shouldEmit(false, true), true);
  assert.equal(shouldEmit(false, false), true);
});

test('charts preserve recorded seconds and compute time saved relative to the older version', () => {
  assert.deepEqual(buildTimings.map(row => [row.label, row.before, row.after]), [['클린 빌드', 2.54, 2.37], ['증분 빌드', 1.28, 1.10]]);
  assert.deepEqual(phaseTimings.total.map(row => [row.before, row.after]), [[0.53, 0.47], [0.83, 0.42]]);
  assert.deepEqual(phaseTimings.package.map(row => [row.before, row.after]), [[0.36, 0.12], [0.32, 0.21]]);
  assert.equal(reduction(2.54, 2.37), '6.7');
  assert.equal(reduction(1.28, 1.10), '14.1');
});
