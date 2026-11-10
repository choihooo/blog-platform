import assert from 'node:assert/strict';
import test from 'node:test';
import { makeTimeline, flowState, curvePoint } from './flow-model.ts';

const nodes = [
  { id: 'parse', title: '파싱', column: 0, row: 0, duration: 400 },
  { id: 'bind', title: '바인딩', column: 1, row: 0, duration: 300, after: ['parse'] },
  { id: 'check', title: '검사', column: 2, row: 0, duration: 500, after: ['bind'] },
  { id: 'emit', title: '출력', column: 2, row: 1, duration: 200, after: ['bind'] },
  { id: 'result', title: '완료', column: 3, row: 0, duration: 100, after: ['check', 'emit'] },
];

test('dependent nodes wait for incoming travel; parallel work starts together and joins after both finish', () => {
  const timeline = makeTimeline(nodes, 200);
  assert.deepEqual(timeline.steps.map(s => [s.id, s.start, s.end]), [
    ['parse', 0, 400], ['bind', 600, 900], ['check', 1100, 1600], ['emit', 1100, 1300], ['result', 1800, 1900],
  ]);
  assert.equal(flowState(timeline.steps[1], 500), 'idle');
  assert.equal(flowState(timeline.steps[1], 700), 'running');
  assert.equal(flowState(timeline.steps[1], 900), 'done');
  assert.equal(timeline.duration, 1900);
});

test('inactive error branches never run or send particles', () => {
  const timeline = makeTimeline([
    { id: 'check', title: '검사', column: 0, row: 0, duration: 400 },
    { id: 'error', title: '오류', column: 1, row: 0, duration: 200, after: ['check'], enabled: false },
    { id: 'ok', title: '성공', column: 1, row: 1, duration: 200, after: ['check'] },
  ], 200);
  assert.deepEqual(timeline.steps.map(s => s.id), ['check', 'ok']);
  assert.deepEqual(timeline.edges.map(e => e.to), ['ok']);
});

test('invalid dependency graphs fail instead of silently inventing an execution order', () => {
  assert.throws(() => makeTimeline([{ ...nodes[0], after: ['missing'] }]), /missing/);
  assert.throws(() => makeTimeline([nodes[0], nodes[0]]), /duplicate/);
  assert.throws(() => makeTimeline([{ ...nodes[0], after: ['bind'] }, nodes[1]]), /cycle/);
});

test('particles follow the same cubic curve as their connection, including both endpoints', () => {
  const curve = { x1: 10, y1: 20, x2: 110, y2: 80 };
  assert.deepEqual(curvePoint(curve, 0), { x: 10, y: 20 });
  assert.deepEqual(curvePoint(curve, 1), { x: 110, y: 80 });
  assert.deepEqual(curvePoint(curve, .5), { x: 60, y: 50 });
});
