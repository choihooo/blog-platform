import { expect, it, vi } from "vitest";
import worker from "../index";
import { authorized, isLocalRequest } from "./access";

it("fails closed on missing or different credentials", () => {
  const request = new Request("https://rag.test/search", {
    headers: { Authorization: "Bearer search" },
  });
  expect(authorized(request, undefined)).toBe(false);
  expect(authorized(request, "admin")).toBe(false);
  expect(authorized(request, "search")).toBe(true);
  expect(isLocalRequest(new Request("http://localhost:8787/__local/d1"))).toBe(true);
  expect(isLocalRequest(new Request("https://rag.test/__local/d1"))).toBe(false);
});

it("hides local D1 before checking credentials and never touches remote bindings", async () => {
  const withSession = vi.fn();
  const env = { RAG_ADMIN_TOKEN: "admin", DB: { withSession } } as unknown as Env;
  for (const [url, status] of [
    ["https://rag.test/__local/d1", 404],
    ["http://localhost:8787/__local/d1", 401],
  ] as const) {
    const response = await worker.fetch(new Request(url, { method: "POST", body: "{}" }), env);
    expect(response.status).toBe(status);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  }
  expect(withSession).not.toHaveBeenCalled();
});

it("keeps public health and invalid routes independent of configuration", async () => {
  for (const [url, method, status] of [
    ["/health", "GET", 200],
    ["/health", "POST", 404],
    ["/search", "GET", 404],
    ["/missing", "POST", 404],
  ] as const) {
    const response = await worker.fetch(
      new Request(`https://rag.test${url}`, { method }),
      {} as Env,
    );
    expect(response.status).toBe(status);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  }
});
