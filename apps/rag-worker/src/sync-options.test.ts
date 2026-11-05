import { describe, expect, it, vi } from "vitest";
import { parseSyncOptions, runSync } from "../scripts/sync-options.mjs";

describe("paced sync", () => {
  it("defaults to read-only planning and requires explicit remote execution", () => {
    expect(parseSyncOptions([])).toMatchObject({
      endpoint: "http://127.0.0.1:8787",
      execute: false,
      offset: 0,
    });
    expect(() => parseSyncOptions(["--execute"])).toThrow("requests-per-minute");
    expect(() => parseSyncOptions(["--execute", "--requests-per-minute", "-1"])).toThrow();
    expect(() =>
      parseSyncOptions([
        "--execute",
        "--requests-per-minute",
        "30",
        "--endpoint",
        "https://remote.test",
      ]),
    ).toThrow("allow-remote");
    expect(() => parseSyncOptions(["--offset", "16"])).toThrow("revision");
  });
  it("sends dryRun and never loops on a planning response", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json({
          total: 32,
          requests: 32,
          profile: "gemini",
          revision: "abc",
          nextOffset: null,
        }),
      );
    const result = await runSync(parseSyncOptions([]), "key", { fetcher, sleep: vi.fn() });
    expect(JSON.parse(fetcher.mock.calls[0]![1].body).dryRun).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.total).toBe(32);
  });
  it("paces whole pages and stops at quota exhaustion with resumable coordinates", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ total: 32, indexed: 16, revision: "revision1", nextOffset: 16 }),
      )
      .mockResolvedValueOnce(new Response("quota", { status: 429 }));
    const sleep = vi.fn().mockResolvedValue(undefined);
    await expect(
      runSync(parseSyncOptions(["--execute", "--requests-per-minute", "60"]), "key", {
        fetcher,
        sleep,
      }),
    ).rejects.toThrow("offset=16 revision=revision1");
    expect(sleep).toHaveBeenCalledWith(16000);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
