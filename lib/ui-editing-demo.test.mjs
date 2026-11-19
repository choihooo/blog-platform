import test from 'node:test';
import assert from 'node:assert/strict';
import { initialStep, moveStep, viewForStep } from '../app/blog/_drafts/ai-ui-editing-dom-guidelines/visuals/model.ts';

test('the request is saved before implementation and approval remains a separate step', () => {
  let step = initialStep;
  assert.equal(viewForStep(step).selected, false);
  step = moveStep(step, 'next');
  assert.equal(viewForStep(step).selected, true);
  step = moveStep(step, 'next');
  assert.equal(viewForStep(step).saved, false);
  step = moveStep(step, 'next');
  assert.equal(viewForStep(step).saved, true);
  assert.equal(viewForStep(step).painted, false);
  step = moveStep(step, 'next');
  assert.equal(viewForStep(step).painted, true);
  assert.equal(viewForStep(step).approved, false);
  step = moveStep(step, 'next');
  assert.equal(viewForStep(step).approved, true);
});

test('previous replays the earlier preview and reset removes the example result', () => {
  let step = initialStep;
  for (let i = 0; i < 5; i++) step = moveStep(step, 'next');
  step = moveStep(moveStep(step, 'previous'), 'previous');
  assert.equal(viewForStep(step).painted, false);
  assert.equal(viewForStep(step).saved, true);
  assert.equal(moveStep(step, 'reset'), initialStep);
  assert.equal(viewForStep(moveStep(step, 'reset')).selected, false);
});

test('navigation cannot go beyond either end', () => {
  assert.equal(moveStep(initialStep, 'previous'), initialStep);
  let step = initialStep;
  for (let i = 0; i < 20; i++) step = moveStep(step, 'next');
  assert.equal(step, 5);
  assert.equal(moveStep(step, 'next'), step);
});

test('each step guides attention to the control or result used at that point', () => {
  let step = initialStep;
  const focus = [];
  for (let i = 0; i < 6; i++) {
    focus.push(viewForStep(step).focus);
    step = moveStep(step, 'next');
  }
  assert.deepEqual(focus, ['tool', 'target', 'request', 'document', 'comparison', 'approval']);
  assert.equal(viewForStep(moveStep(step, 'reset')).focus, 'tool');
});
