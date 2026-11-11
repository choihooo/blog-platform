import assert from 'node:assert/strict';
import test from 'node:test';
import { getSearchListScenario, getSigningNodes, getReleaseNodes } from '../app/blog/_drafts/self-hosted-runner-macos-keychain/visuals/model.ts';
import { makeTimeline } from '../app/blog/typescript-compiler-performance/visuals/flow-model.ts';

const activeIds = nodes => nodes.filter(node => node.enabled !== false).map(node => node.id);

test('restoring A’s saved list loses B, while removing only A preserves B', () => {
  const snapshot = getSearchListScenario('snapshot');
  const owned = getSearchListScenario('owned');
  assert.deepEqual(snapshot.lists[2], ['login', 'A', 'B']);
  assert.deepEqual(snapshot.lists[3], ['login']);
  assert.deepEqual(owned.lists[3], ['login', 'B']);
  assert.equal(snapshot.nodes.at(-1).error, true);
  assert.notEqual(owned.nodes.at(-1).error, true);
  assert.deepEqual(getSearchListScenario('snapshot').lists[0], ['login']);
});

test('a failed signing example still executes cleanup after the failed build', () => {
  const nodes = getSigningNodes('failure');
  assert.equal(nodes.find(node => node.id === 'build').error, true);
  assert.deepEqual(nodes.find(node => node.id === 'cleanup').after, ['build']);
  const timeline = makeTimeline(nodes);
  const build = timeline.steps.find(step => step.id === 'build');
  const cleanup = timeline.steps.find(step => step.id === 'cleanup');
  assert.ok(cleanup.start > build.end);
  assert.notEqual(getSigningNodes('success').find(node => node.id === 'build').error, true);
});

test('PR and branch pushes activate CI without release preparation or secrets jobs', () => {
  assert.deepEqual(activeIds(getReleaseNodes('ci')), ['trigger', 'ci']);
});

test('tag pushes build and upload before updater publication', () => {
  const nodes = getReleaseNodes('tag');
  assert.deepEqual(activeIds(nodes), ['trigger', 'prepare', 'build', 'upload', 'latest']);
  assert.deepEqual(nodes.find(node => node.id === 'latest').after, ['upload']);
});

test('manual branch and dry-run examples prepare the matrix but never release', () => {
  assert.deepEqual(activeIds(getReleaseNodes('manual-branch')), ['trigger', 'prepare']);
  assert.deepEqual(activeIds(getReleaseNodes('manual-tag', { dryRun: true, publishLatest: true })), ['trigger', 'prepare']);
});

test('manual tag updater publication is opt-in and depends on artifact upload', () => {
  assert.deepEqual(activeIds(getReleaseNodes('manual-tag')), ['trigger', 'prepare', 'build', 'upload']);
  const nodes = getReleaseNodes('manual-tag', { publishLatest: true });
  assert.deepEqual(activeIds(nodes), ['trigger', 'prepare', 'build', 'upload', 'latest']);
  for (const trigger of ['ci', 'tag', 'manual-tag', 'manual-branch']) {
    for (const dryRun of [false, true]) {
      for (const publishLatest of [false, true]) {
        assert.doesNotThrow(() => makeTimeline(getReleaseNodes(trigger, { dryRun, publishLatest })));
      }
    }
  }
});

test('each selected route occupies one row without unrelated workflow cards', () => {
  for (const trigger of ['ci', 'tag', 'manual-tag', 'manual-branch']) {
    const nodes = getReleaseNodes(trigger);
    assert.deepEqual(nodes.map(node => node.row), nodes.map(() => 0));
    assert.deepEqual(nodes.map(node => node.column), nodes.map((_, index) => index));
    assert.equal(nodes.some(node => node.id === 'ci'), trigger === 'ci');
    assert.doesNotThrow(() => makeTimeline(nodes));
  }
});
