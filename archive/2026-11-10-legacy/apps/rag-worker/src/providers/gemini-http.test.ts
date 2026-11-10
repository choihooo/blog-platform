import { afterEach, expect, it, vi } from "vitest";
import { requestGemini } from "./gemini-http";

afterEach(() => vi.unstubAllGlobals());

it("retains safe provider status and operation for a failed embedding request", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("private upstream diagnostic", { status: 503 })),
  );
  await expect(
    requestGemini("gemini-embedding-001", "embedContent", {}, "private-key", 1000),
  ).rejects.toMatchObject({
    message: "gemini_unavailable",
    providerStatus: 503,
    operation: "embedContent",
  });
});

it("classifies an unsupported provider location without retaining its raw response", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json(
        {
          error: {
            code: 400,
            status: "FAILED_PRECONDITION",
            message: "User location is not supported for the API use.",
          },
        },
        { status: 400 },
      ),
    ),
  );
  await expect(
    requestGemini("gemini-embedding-001", "embedContent", {}, "key", 1000),
  ).rejects.toMatchObject({
    providerStatus: 400,
    providerReason: "location_unsupported",
  });
});

it("rejects invalid configuration before sending credentials", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(requestGemini("../invalid", "generateContent", {}, "key", 1000)).rejects.toThrow(
    "gemini_not_configured",
  );
  await expect(requestGemini("model", "generateContent", {}, "", 1000)).rejects.toThrow(
    "gemini_not_configured",
  );
  expect(fetcher).not.toHaveBeenCalled();
});

it("cancels an oversized response instead of parsing unbounded JSON", async () => {
  const cancel = vi.fn();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(262145));
    },
    cancel,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(stream)),
  );
  await expect(requestGemini("model", "generateContent", {}, "key", 1000)).rejects.toThrow(
    "gemini_invalid_response",
  );
  expect(cancel).toHaveBeenCalledOnce();
});

it("releases quota failure bodies and preserves the rate limit error", async () => {
  const cancel = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(new ReadableStream({ cancel }), { status: 429 })),
  );
  await expect(requestGemini("model", "generateContent", {}, "key", 1000)).rejects.toThrow(
    "rate_limited",
  );
  expect(cancel).toHaveBeenCalledOnce();
});

it("propagates cancellation to an in-flight request", async () => {
  const controller = new AbortController();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
        }),
    ),
  );
  const result = requestGemini("model", "generateContent", {}, "key", 1000, controller.signal);
  controller.abort();
  await expect(result).rejects.toMatchObject({ name: "AbortError" });
});
