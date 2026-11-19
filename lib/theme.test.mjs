import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { themeScript } from './theme.mjs';

function load(saved, dark, blocked = false) {
  const root = { dataset: {} };
  vm.runInNewContext(themeScript, {
    document: { documentElement: root },
    window: {
      localStorage: { getItem() { if (blocked) throw new Error('blocked'); return saved; } },
      matchMedia: () => ({ matches: dark }),
    },
  });
  return root.dataset.theme;
}

test('initial theme respects saved choice over system preference', () => {
  assert.equal(load('light', true), 'light');
  assert.equal(load('dark', false), 'dark');
});
test('missing, invalid or inaccessible storage follows system preference', () => {
  assert.equal(load(null, true), 'dark');
  assert.equal(load('invalid', false), 'light');
  assert.equal(load(null, true, true), 'dark');
});
