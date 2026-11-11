import assert from 'node:assert/strict';
import test from 'node:test';
import { transition, initialState, snapSheet } from '../app/blog/moping-retrospective/visuals/model.ts';

// Catches stale selection surviving a participant filter or a blank-map click.
test('selecting another pin replaces selection; filtering and clearing restore the list', () => {
  let state = transition(initialState, { type: 'select', id: 'bread' });
  state = transition(state, { type: 'select', id: 'bar' });
  assert.equal(state.selectedId, 'bar');
  assert.ok(state.reveal >= 0.5);
  state = transition(state, { type: 'clear' });
  assert.equal(state.selectedId, null);
  assert.equal(state.reveal, 0.28, 'blank map returns the sheet to its lowest position');
  state = transition(state, { type: 'select', id: 'bread' });
  state = transition(state, { type: 'filter', member: 2 });
  assert.equal(state.selectedId, null);
  assert.equal(state.member, 2);
  state = transition(state, { type: 'filter', member: 2 });
  assert.equal(state.member, null);
});

// Catches dragging outside the phone and incorrect nearest-stop calculation.
test('drag release snaps to a reachable stop, including out-of-bounds positions', () => {
  assert.equal(snapSheet(-1), 0.28);
  assert.equal(snapSheet(0.48), 0.52);
  assert.equal(snapSheet(0.74), 0.8);
  assert.equal(snapSheet(3), 0.8);
});

test('expanding visits the middle stop before full height and then collapses', () => {
  let state = transition(initialState, { type: 'advance-sheet' });
  assert.equal(state?.reveal, 0.52);
  state = transition(state, { type: 'advance-sheet' });
  assert.equal(state.reveal, 0.8);
  state = transition(state, { type: 'advance-sheet' });
  assert.equal(state.reveal, 0.28);
});
