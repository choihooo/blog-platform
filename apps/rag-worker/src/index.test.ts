import { describe, expect, it, vi } from "vitest";
import worker from "./index";

const request = (path: string, token?: string, body = {}) =>
  new Request(`https://rag.example${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
// Only the invoked bindings are provided; a missing mocked binding must throw.
const env = (
  overrides: {
    DB?: Pick<D1Database, "withSession">;
    AI?: Pick<Ai, "run">;
    INDEX?: Partial<VectorizeIndex>;
    SEARCH_LIMIT?: RateLimit;
  } = {},
) => ({ RAG_ADMIN_TOKEN: "admin-test", RAG_SEARCH_TOKEN: "search-test", ...overrides }) as Env;

describe("RAG Worker", () => {
  it("syncs classification into the actual embedding input without duplicating posts", async () => {
    const all = vi.fn().mockResolvedValue({
      success: true,
      results: [
        {
          id: "1",
          slug: "tagged",
          title: "도구 소개",
          summary: "공개 본문",
          content: "",
          tags_json: '[{"name":"React","slug":"react"}]',
          category_name: "프론트엔드",
          parent_category_name: "개발",
        },
      ],
    });
    const bind = vi.fn().mockReturnValue({ all });
    const prepare = vi.fn().mockReturnValue({ bind });
    const run = vi.fn().mockResolvedValue({ data: [Array(1024).fill(0)] });
    const upsert = vi.fn().mockResolvedValue({ mutationId: "test" });
    const response = await worker.fetch(
      request("/sync", "admin-test", { slug: "tagged" }),
      env({
        DB: { withSession: vi.fn().mockReturnValue({ prepare }) },
        AI: { run },
        INDEX: { getByIds: vi.fn().mockResolvedValue([]), upsert },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ indexed: 1, total: 1, nextOffset: null });
    expect(run.mock.calls[0]?.[1].text).toEqual([
      "도구 소개\n카테고리: 개발, 프론트엔드\n태그: React, react\n공개 본문",
    ]);
    expect(bind).toHaveBeenCalledWith("tagged");
    expect(upsert).toHaveBeenCalledOnce();
  });
  it("protects search and sync with different credentials", async () => {
    expect((await worker.fetch(request("/sync", "search-test"), env())).status).toBe(401);
    expect((await worker.fetch(request("/search"), env())).status).toBe(401);
  });
  it("validates input before paid inference", async () => {
    expect(
      (await worker.fetch(request("/search", "search-test", { query: "x".repeat(601) }), env()))
        .status,
    ).toBe(400);
    expect((await worker.fetch(request("/sync", "admin-test", { offset: -1 }), env())).status).toBe(
      400,
    );
  });
  it("enforces an aggregate search rate limit", async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    const response = await worker.fetch(
      request("/search", "search-test", { query: "경력" }),
      env({ SEARCH_LIMIT: { limit } }),
    );
    expect(response.status).toBe(429);
  });
  it("queries only published posts on the primary and rejects stale vectors", async () => {
    const all = vi.fn().mockResolvedValue({ success: true, results: [] });
    const prepare = vi.fn().mockReturnValue({ all });
    const withSession = vi.fn().mockReturnValue({ prepare });
    const run = vi.fn().mockResolvedValue({ data: [Array(1024).fill(0)] });
    const query = vi
      .fn()
      .mockResolvedValue({ matches: [{ id: "unpublished-or-old", score: 0.99 }] });
    const response = await worker.fetch(
      request("/search", "search-test", { query: "비공개삭제문서 글" }),
      env({
        SEARCH_LIMIT: { limit: vi.fn().mockResolvedValue({ success: true }) },
        DB: { withSession },
        AI: { run },
        INDEX: { query },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sources: [] });
    expect(withSession).toHaveBeenCalledWith("first-primary");
    expect(prepare.mock.calls[0]?.[0]).toContain("WHERE p.is_published = 1");
    expect(prepare.mock.calls[0]?.[0]).toContain("JOIN tags");
    expect(prepare.mock.calls[0]?.[0]).toContain("LEFT JOIN categories parent");
  });
});
