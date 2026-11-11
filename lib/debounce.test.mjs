import assert from "node:assert/strict";
import test from "node:test";
import { createDebouncedTask } from "./debounce.ts";

test("rapid typing runs once with the last value after 300ms of inactivity", context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const calls = [];
  const task = createDebouncedTask(value => calls.push(value), 300);
  task.schedule("A");
  context.mock.timers.tick(200);
  task.schedule("AI");
  context.mock.timers.tick(299);
  assert.deepEqual(calls, []);
  context.mock.timers.tick(1);
  assert.deepEqual(calls, ["AI"]);
  context.mock.timers.tick(1000);
  assert.deepEqual(calls, ["AI"]);
});

test("cancel prevents stale work after closing, clearing or unmounting", context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const calls = [];
  const task = createDebouncedTask(value => calls.push(value), 300);
  task.schedule("호");
  context.mock.timers.tick(299);
  task.cancel();
  context.mock.timers.tick(1000);
  assert.deepEqual(calls, []);
  task.schedule("호기심");
  context.mock.timers.tick(300);
  assert.deepEqual(calls, ["호기심"]);
});
