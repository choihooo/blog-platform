import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";

function worker(fetch) {
  const handlers = {};
  const stored = new Map();
  const caches = {
    open: async () => ({
      addAll: async (urls) => {
        for (const url of urls) stored.set(url, new Response(url));
      },
      match: async (url) => stored.get(url),
    }),
    keys: async () => ["ho-blog-pwa-old", "unrelated-cache"],
    delete: async (key) => { stored.set(`deleted:${key}`, true); },
  };
  vm.runInNewContext(readFileSync("public/sw.js", "utf8"), {
    self: {
      location: { origin: "https://blog.test" },
      addEventListener: (name, handler) => { handlers[name] = handler; },
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches, fetch, URL, Response,
  });
  return { handlers, stored };
}

async function dispatch(handler, request) {
  let response;
  const pending = [];
  handler({ request, respondWith: (value) => { response = value; }, waitUntil: (value) => pending.push(value) });
  await Promise.all(pending);
  return response;
}

test("offline navigation gets a cached readable fallback; online navigation stays fresh", async () => {
  let offline = false;
  const { handlers } = worker(async () => {
    if (offline) throw new TypeError("offline");
    return new Response("latest article");
  });
  await dispatch(handlers.install);
  const request = { url: "https://blog.test/blog/post", method: "GET", mode: "navigate" };
  assert.equal(await (await dispatch(handlers.fetch, request)).text(), "latest article");
  offline = true;
  assert.equal(await (await dispatch(handlers.fetch, request)).text(), "/offline.html");
});

test("API, mutations, RSC and external requests bypass the worker", async () => {
  const { handlers } = worker(() => { throw new Error("must bypass"); });
  for (const request of [
    { url: "https://blog.test/api/engagement", method: "GET", mode: "navigate" },
    { url: "https://blog.test/blog/post", method: "POST", mode: "navigate" },
    { url: "https://blog.test/blog/post?_rsc=abc", method: "GET", mode: "cors" },
    { url: "https://external.test/", method: "GET", mode: "navigate" },
  ]) assert.equal(await dispatch(handlers.fetch, request), undefined);
});

test("activation removes only this app's outdated caches", async () => {
  const { handlers, stored } = worker();
  await dispatch(handlers.activate);
  assert.equal(stored.get("deleted:ho-blog-pwa-old"), true);
  assert.equal(stored.has("deleted:unrelated-cache"), false);
});
