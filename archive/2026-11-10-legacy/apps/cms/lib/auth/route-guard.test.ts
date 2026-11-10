import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { resolveRouteAccess } from "./route-guard";
import type { CmsSession } from "./types";

let roots: string[] = [];

const session: CmsSession = {
  githubLogin: "ho",
  githubUserId: "123",
  expiresAt: "2099-01-01T00:00:00.000Z",
};

async function rootWithSite(config: unknown) {
  const root = await mkdtemp(path.join(tmpdir(), "cms-route-"));
  roots.push(root);
  await mkdir(path.join(root, "content"));
  await writeFile(path.join(root, "content/site.json"), JSON.stringify(config));
  return root;
}

afterEach(async () => {
  await Promise.all(roots.map((root) => rm(root, { force: true, recursive: true })));
  roots = [];
});

describe("resolveRouteAccess", () => {
  it("covers admin, anonymous, non-admin, partial mismatch, and misconfigured states", async () => {
    const root = await rootWithSite({ adminGithubLogin: "ho", adminGithubUserId: "123" });

    await expect(resolveRouteAccess(session, root)).resolves.toMatchObject({
      status: "authorized",
    });
    await expect(resolveRouteAccess(null, root)).resolves.toMatchObject({
      status: "unauthenticated",
    });
    await expect(
      resolveRouteAccess({ ...session, githubLogin: "other" }, root),
    ).resolves.toMatchObject({
      status: "forbidden",
    });
    await expect(
      resolveRouteAccess({ ...session, githubUserId: "999" }, root),
    ).resolves.toMatchObject({
      status: "forbidden",
    });
    await expect(resolveRouteAccess(session, await rootWithSite({}))).resolves.toMatchObject({
      status: "misconfigured",
    });
  });

  it("resolves the repository site config when called from an app directory", async () => {
    const root = await rootWithSite({ adminGithubLogin: "ho", adminGithubUserId: "123" });
    const appRoot = path.join(root, "apps/cms");
    await mkdir(appRoot, { recursive: true });

    const cwd = process.cwd();
    try {
      process.chdir(appRoot);
      await expect(resolveRouteAccess(session)).resolves.toMatchObject({
        status: "authorized",
      });
    } finally {
      process.chdir(cwd);
    }
  });
});
