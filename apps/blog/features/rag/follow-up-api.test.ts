import { describe, expect, it } from "vitest";
import { POST } from "../../app/api/rag/route";
import { isRagResult } from "@blog-platform/core/search";

const request = (body: unknown) =>
  new Request("http://localhost/api/rag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
describe("follow-up API validation", () => {
  it.each([
    { query: "x", titles: ["x".repeat(201)] },
    { query: "x", titles: [1] },
    { query: "x", titles: ["a", "b", "c", "d"] },
  ])("rejects malformed context %j", async (context) => {
    expect((await POST(request({ query: "그거", context }))).status).toBe(400);
  });
  it("returns a clarification without pretending to have evidence", async () => {
    const response = await POST(request({ query: "그거" }));
    const data = await response.json();
    expect(data.kind).toBe("clarification");
    expect(data.sources).toEqual([]);
    expect(isRagResult(data)).toBe(true);
  });
  it("resolves a project reference into authoritative facts", async () => {
    const response = await POST(
      request({
        query: "2번 성과",
        context: { query: "대표 프로젝트", titles: ["Comma", "Nexacro"] },
      }),
    );
    const data = await response.json();
    expect(data.resolvedQuery).toBe("Nexacro 성과");
    expect(data.answer).toContain("5/5");
    expect(data.answer).not.toContain("41.1%");
  });
});
