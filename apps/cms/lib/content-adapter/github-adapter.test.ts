import { describe, expect, it } from "vitest";
import {
  createGitHubContentAdapter,
  createGitHubContentAdapterFromCredential,
} from "./github-adapter.js";

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
          path: "db/posts/a",
          sha: "new",
          commit: { sha: "commit" },
          size: 1,
        });
      },
    });

    await adapter.createFile({
      path: "db/posts/a",
      content: "hello",
      intent: "create-draft",
    });
    await adapter.updateFile({
      path: "db/posts/a",
      content: "bye",
      expectedSha: "old",
      intent: "save-draft",
    });

    expect(bodies[0]).toMatchObject({ branch: "main", message: "post(a): create draft" });
    expect(bodies[0]?.content).toBe(Buffer.from("hello").toString("base64"));
    expect(bodies[1]).toMatchObject({ sha: "old", message: "post(a): save draft" });
  });

  it("uses a ready credential token in the authorization header", async () => {
    let authorization: string | undefined;
    const result = createGitHubContentAdapterFromCredential({
      owner: "me",
      repo: "blog",
      branch: "main",
      credential: { status: "ready", token: "installation-token" },
      fetchImpl: async (_url, init) => {
        authorization = new Headers(init?.headers).get("authorization") ?? undefined;
        return jsonResponse({
          path: "db/posts/a",
          sha: "new",
          commit: { sha: "commit" },
          size: 1,
        });
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    await result.data.createFile({
      path: "db/posts/a",
      content: "hello",
      intent: "create-draft",
    });

    expect(authorization).toBe("Bearer installation-token");
  });

  it("redacts token-like values from repository failure messages", async () => {
    const token = "ghp_1234567890abcdef";
    const adapter = createGitHubContentAdapter({
      owner: "me",
      repo: "blog",
      branch: "main",
      token,
      fetchImpl: async () => jsonResponse({ message: `bad ${token}` }, 403),
    });

    const result = await adapter.updateFile({
      path: "db/posts/a",
      content: "mine",
      expectedSha: "old",
      intent: "save-draft",
    });

    expect(!result.success && result.error.message).not.toContain(token);
  });
});
