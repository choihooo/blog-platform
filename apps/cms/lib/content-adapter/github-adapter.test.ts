import { describe, expect, it } from "vitest";
import { createGitHubContentAdapter } from "./github-adapter.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("github adapter write mapping", () => {
  it("maps create and update requests to contents API payloads", async () => {
    const bodies: Array<Record<string, unknown>> = [];
    const adapter = createGitHubContentAdapter({
      owner: "me",
      repo: "blog",
      branch: "main",
      token: "token",
      fetchImpl: async (_url, init) => {
        bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
        return jsonResponse({
          path: "content/posts/a.mdx",
          sha: "new",
          commit: { sha: "commit" },
          size: 1,
        });
      },
    });

    await adapter.createFile({
      path: "content/posts/a.mdx",
      content: "hello",
      intent: "create-draft",
    });
    await adapter.updateFile({
      path: "content/posts/a.mdx",
      content: "bye",
      expectedSha: "old",
      intent: "save-draft",
    });

    expect(bodies[0]).toMatchObject({ branch: "main", message: "post(a): create draft" });
    expect(bodies[0]?.content).toBe(Buffer.from("hello").toString("base64"));
    expect(bodies[1]).toMatchObject({ sha: "old", message: "post(a): save draft" });
  });
});
