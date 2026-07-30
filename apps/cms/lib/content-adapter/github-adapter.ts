import { commitSummary } from "./commit-intent.js";
import { assertAllowedPath } from "./paths.js";
import { normalizeHttpFailure, repositoryFailure } from "./repository-error.js";
import type {
  AdapterResult,
  ContentAdapter,
  ContentChangeRequest,
  ContentChangeResult,
  RepositoryContentFile,
  RepositoryFileSummary,
} from "./types.js";

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

type GitHubAdapterOptions = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  fetchImpl?: FetchLike;
};

type GitHubContentResponse = {
  path: string;
  sha: string;
  size: number;
  content?: string;
  commit?: { sha?: string };
};

function endpoint(options: GitHubAdapterOptions, repoPath: string): string {
  const encodedPath = encodeURIComponent(repoPath).replaceAll("%2F", "/");
  return `https://api.github.com/repos/${options.owner}/${options.repo}/contents/${encodedPath}`;
}

async function readMessage(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message;
  } catch {
    return undefined;
  }
}

export function createGitHubContentAdapter(options: GitHubAdapterOptions): ContentAdapter {
  const fetchImpl = options.fetchImpl ?? fetch;
  const headers = {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${options.token}`,
    "content-type": "application/json",
    "x-github-api-version": "2022-11-28",
  };

  async function request<T>(
    repoPath: string,
    init: RequestInit,
    submittedContent?: string,
  ): Promise<AdapterResult<T>> {
    try {
      const response = await fetchImpl(endpoint(options, repoPath), {
        ...init,
        headers: { ...headers, ...init.headers },
      });
      if (!response.ok) {
        return {
          success: false,
          error: normalizeHttpFailure(response.status, {
            path: repoPath,
            submittedContent,
            message: await readMessage(response),
          }),
        };
      }
      return { success: true, data: (await response.json()) as T };
    } catch {
      return {
        success: false,
        error: repositoryFailure("temporary-connectivity", { path: repoPath, submittedContent }),
      };
    }
  }

  async function write(
    input: ContentChangeRequest,
    method: "PUT" | "DELETE",
  ): Promise<AdapterResult<ContentChangeResult>> {
    const allowed = assertAllowedPath(input.path);
    if (!allowed) {
      return {
        success: false,
        error: repositoryFailure("validation-failure", {
          path: input.path,
          submittedContent: input.content,
        }),
      };
    }
    const message = commitSummary(input.intent, allowed.path);
    const body = {
      branch: options.branch,
      message,
      content: Buffer.from(input.content).toString("base64"),
      sha: input.expectedSha,
    };
    const result = await request<GitHubContentResponse>(
      allowed.path,
      { method, body: JSON.stringify(body) },
      input.content,
    );
    if (!result.success) return result;
    return {
      success: true,
      data: {
        path: allowed.path,
        sha: result.data.sha,
        commitId: result.data.commit?.sha,
        status: method === "DELETE" ? "deleted" : input.expectedSha ? "updated" : "created",
        summary: message,
      },
    };
  }

  return {
    async listFiles(input) {
      const repoPath =
        input.root === "config"
          ? "content"
          : input.root === "media"
            ? "public/media"
            : `content/${input.root}`;
      const result = await request<GitHubContentResponse[]>(repoPath, { method: "GET" });
      if (!result.success) return result;
      const files = result.data
        .map((file): RepositoryFileSummary | null => {
          const allowed = assertAllowedPath(file.path);
          return allowed
            ? { path: allowed.path, kind: allowed.kind, sha: file.sha, sizeBytes: file.size }
            : null;
        })
        .filter((file): file is RepositoryFileSummary => file !== null);
      return { success: true, data: { files } };
    },
    async readFile(input) {
      const allowed = assertAllowedPath(input.path);
      if (!allowed)
        return {
          success: false,
          error: repositoryFailure("validation-failure", { path: input.path }),
        };
      const result = await request<GitHubContentResponse>(allowed.path, { method: "GET" });
      if (!result.success) return result;
      const rawContent = (result.data.content ?? "").replaceAll(/\s/g, "");
      const file: RepositoryContentFile = {
        path: allowed.path,
        kind: allowed.kind,
        content:
          allowed.kind === "media"
            ? rawContent
            : Buffer.from(rawContent, "base64").toString("utf8"),
        encoding: allowed.kind === "media" ? "base64" : "utf8",
        sha: result.data.sha,
        sizeBytes: result.data.size,
      };
      return { success: true, data: { file } };
    },
    createFile(input) {
      return write(input, "PUT");
    },
    updateFile(input) {
      return write(input, "PUT");
    },
    deleteFile(input) {
      return write({ ...input, content: "" }, "DELETE");
    },
    commitMedia(input) {
      return write(
        {
          path: input.path,
          content: input.contentBase64,
          expectedSha: input.expectedSha,
          intent: input.intent,
        },
        "PUT",
      );
    },
  };
}
