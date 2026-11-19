import assert from 'node:assert/strict';
import test from 'node:test';
import { viewAt, playbackReducer, createPlayback } from '../app/blog/_drafts/nextjs-streaming-ui/visuals/model.ts';

const delays = { body: 200, comments: 3000 };

test('a visible demo plays for three seconds, holds the finished screen for two seconds, then repeats', () => {
  let state = createPlayback();
  state = playbackReducer(state, { type: 'tick', delta: 500, active: false });
  assert.equal(state.time, 0);
  state = playbackReducer(state, { type: 'tick', delta: 200, active: true });
  assert.equal(state.time, 200);
  assert.equal(viewAt('separate', state.time, delays).body, true);
  state = playbackReducer(state, { type: 'tick', delta: 2800, active: true });
  assert.deepEqual(state, { time: 3000, playing: true });
  state = playbackReducer(state, { type: 'tick', delta: 1999, active: true });
  assert.deepEqual(state, { time: 4999, playing: true });
  assert.equal(viewAt('separate', state.time, delays).comments, true);
  assert.deepEqual(playbackReducer(state, { type: 'tick', delta: 500, active: false }), state);
  state = playbackReducer(state, { type: 'tick', delta: 1, active: true });
  assert.deepEqual(state, { time: 0, playing: true });
  assert.equal(viewAt('separate', state.time, delays).body, false);
});

test('one response or one boundary waits for both results, independent boundaries reveal ready body', () => {
  for (const mode of ['blocking', 'single']) {
    assert.deepEqual(viewAt(mode, 200, delays), { body: false, comments: false, outerFallback: true });
  }
  assert.deepEqual(viewAt('separate', 199, delays), { body: false, comments: false, outerFallback: false });
  assert.deepEqual(viewAt('separate', 200, delays), { body: true, comments: false, outerFallback: false });
  for (const mode of ['blocking', 'single', 'separate', 'nested']) {
    assert.deepEqual(viewAt(mode, 3000, delays), { body: true, comments: true, outerFallback: false });
  }
});

test('nested boundary hides ready comments while its outer body is still pending', () => {
  const reversed = { body: 3000, comments: 200 };
  assert.deepEqual(viewAt('separate', 200, reversed), { body: false, comments: true, outerFallback: false });
  assert.deepEqual(viewAt('nested', 200, reversed), { body: false, comments: false, outerFallback: true });
  assert.deepEqual(viewAt('nested', 3000, reversed), { body: true, comments: true, outerFallback: false });
  assert.deepEqual(viewAt('nested', 200, delays), { body: true, comments: false, outerFallback: false });
});

test('manual pause preserves elapsed time during playback or rest; replay always restarts', () => {
  let state = { time: 0, playing: false };
  state = playbackReducer(state, { type: 'toggle' });
  assert.deepEqual(playbackReducer(state, { type: 'tick', delta: 500, active: false }), state);
  state = playbackReducer(state, { type: 'tick', delta: 200, active: true });
  assert.deepEqual(state, { time: 200, playing: true });
  state = playbackReducer(state, { type: 'toggle' });
  assert.deepEqual(playbackReducer(state, { type: 'tick', delta: 500, active: true }), state);
  state = playbackReducer(state, { type: 'restart' });
  assert.deepEqual(state, { time: 0, playing: true });
  state = playbackReducer(state, { type: 'tick', delta: 4000, active: true });
  assert.deepEqual(state, { time: 4000, playing: true });
  state = playbackReducer(state, { type: 'toggle' });
  assert.deepEqual(state, { time: 4000, playing: false });
  assert.deepEqual(playbackReducer(state, { type: 'tick', delta: 1000, active: true }), state);
  state = playbackReducer(state, { type: 'toggle' });
  assert.deepEqual(state, { time: 4000, playing: true });
  assert.deepEqual(playbackReducer(state, { type: 'restart' }), { time: 0, playing: true });
});

test('elapsed time crossing several cycles preserves the next cycle position', () => {
  assert.deepEqual(playbackReducer({ time: 4800, playing: true }, { type: 'tick', delta: 10400, active: true }), { time: 200, playing: true });
});

test('invalid elapsed time never corrupts playback', () => {
  const state = { time: 1000, playing: true };
  assert.deepEqual(playbackReducer(state, { type: 'tick', delta: NaN, active: true }), state);
  assert.deepEqual(playbackReducer(state, { type: 'tick', delta: -100, active: true }), state);
});
