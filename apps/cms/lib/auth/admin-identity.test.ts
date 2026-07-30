import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadAdminIdentity, parseAdminIdentity } from "./admin-identity";

let roots: string[] = [];

async function writeSite(config: unknown) {
  const root = await mkdtemp(path.join(tmpdir(), "cms-auth-"));
  roots.push(root);
  await mkdir(path.join(root, "content"));
  await writeFile(path.join(root, "content/site.json"), JSON.stringify(config));
  return root;
}

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { force: true, recursive: true })));
  roots = [];
});

describe("admin identity", () => {
  it("parses configured admin identity", () => {
    expect(parseAdminIdentity({ adminGithubLogin: "ho", adminGithubUserId: "123" })).toMatchObject({
      success: true,
      identity: { githubLogin: "ho", githubUserId: "123", sourcePath: "content/site.json" },
    });
  });

  it("rejects missing, blank, and placeholder values", () => {
    expect(parseAdminIdentity({ adminGithubUserId: "123" })).toMatchObject({ success: false });
    expect(parseAdminIdentity({ adminGithubLogin: "ho", adminGithubUserId: " " })).toMatchObject({
      success: false,
    });
    expect(
      parseAdminIdentity({ adminGithubLogin: "replace-me", adminGithubUserId: "0" }),
    ).toMatchObject({ success: false });
  });

  it("keeps login and immutable user id as separate required values", () => {
    expect(parseAdminIdentity({ adminGithubLogin: "ho", adminGithubUserId: "123" })).toMatchObject({
      success: true,
    });
    expect(parseAdminIdentity({ adminGithubLogin: "ho" })).toMatchObject({ success: false });
    expect(parseAdminIdentity({ adminGithubUserId: "123" })).toMatchObject({ success: false });
  });

  it("loads identity from content/site.json", async () => {
    const root = await writeSite({ adminGithubLogin: "ho", adminGithubUserId: "123" });
    await expect(loadAdminIdentity(root)).resolves.toMatchObject({
      success: true,
      identity: { githubLogin: "ho", githubUserId: "123" },
    });
  });

  it("fails closed when site config is unreadable", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "cms-auth-"));
    roots.push(root);
    await expect(loadAdminIdentity(root)).resolves.toMatchObject({ success: false });
  });
});
