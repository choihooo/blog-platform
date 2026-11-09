import { afterEach, expect, it, vi } from "vitest";
import { requestGemini } from "../providers/gemini-http";
import { failureResponse } from "./response";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("logs the safe upstream classification while keeping public errors and secrets separate", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("private upstream body", { status: 503 })),
  );
  let error: unknown;
  try {
    await requestGemini("gemini-embedding-001", "embedContent", {}, "private-key", 1000);
  } catch (caught) {
    error = caught;
  }
  const response = failureResponse(error, "/search", "search");
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: "retrieval_unavailable" });
  const record = JSON.parse(String(log.mock.calls[0]?.[0]));
  expect(record).toMatchObject({
    code: "gemini_unavailable",
    providerStatus: 503,
    providerOperation: "embedContent",
  });
  expect(JSON.stringify(record)).not.toMatch(/private-key|private upstream body/);
});
