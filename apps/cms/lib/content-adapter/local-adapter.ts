import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { commitSummary } from "./commit-intent.js";
import { assertAllowedPath, classifyRepositoryPath, listRootToPath } from "./paths.js";
import { repositoryFailure } from "./repository-error.js";
import type {
  AdapterResult,
  ContentAdapter,
  ContentChangeRequest,
  ContentChangeResult,
  RepositoryContentFile,
  RepositoryFileSummary,
} from "./types.js";

function fileSha(content: Buffer | string): string {
  return createHash("sha256").update(content).digest("hex");
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((entry) => {
        const next = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(next) : Promise.resolve([next]);
      }),
    );
    return nested.flat();
  } catch {
    return [];
  }
}

export function createLocalContentAdapter(rootDir = process.cwd()): ContentAdapter {
  const diskPath = (repoPath: string) => path.join(rootDir, repoPath);

  async function readAllowed(input: {
    path: string;
  }): Promise<AdapterResult<{ file: RepositoryContentFile }>> {
    const allowed = assertAllowedPath(input.path);
    if (!allowed)
      return {
        success: false,
        error: repositoryFailure("validation-failure", { path: input.path }),
      };
    try {
      const buffer = await readFile(diskPath(allowed.path));
      const stats = await stat(diskPath(allowed.path));
      const encoding = allowed.kind === "media" ? "base64" : "utf8";
      return {
        success: true,
        data: {
          file: {
            path: allowed.path,
            kind: allowed.kind,
            content: encoding === "base64" ? buffer.toString("base64") : buffer.toString("utf8"),
            encoding,
            sha: fileSha(buffer),
            sizeBytes: buffer.byteLength,
            updatedAt: stats.mtime.toISOString(),
          },
        },
      };
    } catch {
      return { success: false, error: repositoryFailure("missing-file", { path: allowed.path }) };
    }
  }

  async function writeText(
    input: ContentChangeRequest,
    status: "created" | "updated",
  ): Promise<AdapterResult<ContentChangeResult>> {
    const allowed = assertAllowedPath(input.path);
    if (!allowed || allowed.kind === "media") {
      return {
        success: false,
        error: repositoryFailure("validation-failure", {
          path: input.path,
          submittedContent: input.content,
        }),
      };
    }
    const target = diskPath(allowed.path);
    const alreadyExists = await exists(target);
    if (status === "created" && alreadyExists) {
      return {
        success: false,
        error: repositoryFailure("duplicate-file", {
          path: allowed.path,
          submittedContent: input.content,
        }),
      };
    }
    if (status === "updated") {
      if (!input.expectedSha) {
        return {
          success: false,
          error: repositoryFailure("validation-failure", {
            path: allowed.path,
            submittedContent: input.content,
          }),
        };
      }
      const current = await readAllowed({ path: allowed.path });
      if (!current.success)
        return { success: false, error: { ...current.error, submittedContent: input.content } };
      if (current.data.file.sha !== input.expectedSha) {
        return {
          success: false,
          error: repositoryFailure("stale-file", {
            path: allowed.path,
            submittedContent: input.content,
          }),
        };
      }
    }
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, input.content, "utf8");
    return {
      success: true,
      data: {
        path: allowed.path,
        sha: fileSha(input.content),
        status,
        summary: commitSummary(input.intent, allowed.path),
      },
    };
  }

  return {
    async listFiles(input) {
      const roots = listRootToPath(input.root);
      const files = (
        await Promise.all(
          roots.map(async (repoRoot) => {
            const root = diskPath(repoRoot);
            const rootExists = await exists(root);
            if (!rootExists) return [];
            const diskFiles = (await stat(root)).isDirectory() ? await walk(root) : [root];
            return Promise.all(
              diskFiles.map(async (filePath): Promise<RepositoryFileSummary | null> => {
                const repoPath = path.relative(rootDir, filePath).split(path.sep).join("/");
                const kind = classifyRepositoryPath(repoPath);
                if (!kind) return null;
                const buffer = await readFile(filePath);
                return { path: repoPath, kind, sha: fileSha(buffer), sizeBytes: buffer.byteLength };
              }),
            );
          }),
        )
      )
        .flat()
        .filter((file): file is RepositoryFileSummary => file !== null)
        .sort((a, b) => a.path.localeCompare(b.path));
      return { success: true, data: { files } };
    },
    readFile: readAllowed,
    createFile(input) {
      return writeText(input, "created");
    },
    updateFile(input) {
      return writeText(input, "updated");
    },
    async deleteFile(input) {
      const allowed = assertAllowedPath(input.path);
      if (!allowed)
        return {
          success: false,
          error: repositoryFailure("validation-failure", { path: input.path }),
        };
      const current = await readAllowed({ path: allowed.path });
      if (!current.success) return current;
      if (current.data.file.sha !== input.expectedSha) {
        return {
          success: false,
          error: repositoryFailure("stale-file", {
            path: allowed.path,
            submittedContent: current.data.file.content,
          }),
        };
      }
      await rm(diskPath(allowed.path));
      return {
        success: true,
        data: {
          path: allowed.path,
          status: "deleted",
          summary: commitSummary(input.intent, allowed.path),
        },
      };
    },
    async commitMedia(input) {
      const allowed = assertAllowedPath(input.path);
      if (!allowed || allowed.kind !== "media") {
        return {
          success: false,
          error: repositoryFailure("validation-failure", {
            path: input.path,
            submittedContent: input.contentBase64,
          }),
        };
      }
      const target = diskPath(allowed.path);
      const status: "created" | "updated" = (await exists(target)) ? "updated" : "created";
      if (status === "updated" && input.expectedSha) {
        const current = await readAllowed({ path: allowed.path });
        if (current.success && current.data.file.sha !== input.expectedSha) {
          return {
            success: false,
            error: repositoryFailure("stale-file", {
              path: allowed.path,
              submittedContent: input.contentBase64,
            }),
          };
        }
      }
      const buffer = Buffer.from(input.contentBase64, "base64");
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, buffer);
      return {
        success: true,
        data: {
          path: allowed.path,
          sha: fileSha(buffer),
          status,
          summary: commitSummary(input.intent, allowed.path),
        },
      };
    },
  };
}
