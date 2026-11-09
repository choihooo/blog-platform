import { createEmptyEditorDocument, type EditorDocument } from "@blog-platform/core/content";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { EditorCommands } from "../model/commands";
import { readBackup } from "../model/draft-backup";
import { useEditorOperations } from "./use-editor-operations";
import { useEditorSession } from "./use-editor-session";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function commandMocks() {
  return {
    save: vi.fn<EditorCommands["save"]>(),
    publish: vi.fn<EditorCommands["publish"]>(),
    unpublish: vi.fn<EditorCommands["unpublish"]>(),
    archive: vi.fn<EditorCommands["archive"]>(),
    preview: vi.fn<EditorCommands["preview"]>(),
    retry: vi.fn<EditorCommands["retry"]>(),
    upload: vi.fn<EditorCommands["upload"]>(),
  };
}

function documentFixture() {
  const document = createEmptyEditorDocument();
  document.id = "race-draft";
  document.frontmatter.title = "Before";
  document.body = [{ type: "paragraph", text: "Before body" }];
  return document;
}

function mount(document: EditorDocument, commands: EditorCommands) {
  return renderHook(() => {
    const session = useEditorSession(document);
    const operations = useEditorOperations({
      session,
      commands,
      currentDocument: () => session.documentRef.current,
      showToast: vi.fn(),
    });
    return { session, operations };
  });
}

let storage: Storage;
beforeEach(() => {
  const values = new Map<string, string>();
  storage = {
    get length() {
      return values.size;
    },
    key: (index) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
    clear: () => values.clear(),
  };
  vi.stubGlobal("localStorage", storage);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("rebases a delayed save onto newer input and saves that input with the new path and sha next time", async () => {
  const commands = commandMocks();
  const first = deferred<Awaited<ReturnType<EditorCommands["save"]>>>();
  commands.save.mockReturnValueOnce(first.promise).mockResolvedValueOnce({
    ok: true,
    path: "db/posts/before",
    sha: "sha-2",
    slug: "before",
    backupCleared: true,
  });
  const { result } = mount(documentFixture(), commands);
  act(() => result.current.operations.save());
  expect(result.current.operations.isPending).toBe(true);
  act(() =>
    result.current.session.markDirty(
      {
        ...result.current.session.documentRef.current,
        frontmatter: {
          ...result.current.session.documentRef.current.frontmatter,
          title: "New title",
          tags: ["new"],
        },
      },
      [{ type: "paragraph", text: "New body" }],
    ),
  );
  await act(async () =>
    first.resolve({
      ok: true,
      path: "db/posts/before",
      sha: "sha-1",
      slug: "before",
      updatedAt: "2026-11-09T08:00:00Z",
      backupCleared: true,
    }),
  );
  expect(result.current.session.document).toMatchObject({
    path: "db/posts/before",
    sourceSha: "sha-1",
    dirty: true,
    body: [{ text: "New body" }],
    frontmatter: { title: "New title", tags: ["new"], slug: "before" },
  });
  expect(result.current.session.body).toEqual([{ type: "paragraph", text: "New body" }]);
  expect(result.current.session.status).toBe("dirty");
  expect(readBackup(storage, "post:db/posts/before")).toMatchObject({
    sourceSha: "sha-1",
    document: { dirty: true, body: [{ text: "New body" }], frontmatter: { title: "New title" } },
  });
  expect(storage.getItem("draft:race-draft")).toBeNull();
  act(() => result.current.operations.save());
  await act(async () => {});
  expect(commands.save.mock.calls[1]?.[0]).toMatchObject({
    path: "db/posts/before",
    sourceSha: "sha-1",
    body: [{ text: "New body" }],
    frontmatter: { title: "New title", tags: ["new"] },
  });
  expect(result.current.session.document.dirty).toBe(false);
  expect(storage.getItem("post:db/posts/before")).toBeNull();
});

it("keeps a slug changed during save instead of replacing it with the stored slug", async () => {
  const commands = commandMocks();
  const pending = deferred<Awaited<ReturnType<EditorCommands["save"]>>>();
  commands.save.mockReturnValue(pending.promise);
  const { result } = mount(documentFixture(), commands);
  act(() => result.current.operations.save());
  act(() =>
    result.current.session.markDirty({
      ...result.current.session.documentRef.current,
      frontmatter: { ...result.current.session.documentRef.current.frontmatter, slug: "new-slug" },
    }),
  );
  await act(async () =>
    pending.resolve({
      ok: true,
      path: "db/posts/before",
      sha: "sha-1",
      slug: "before",
      backupCleared: true,
    }),
  );
  expect(result.current.session.document).toMatchObject({
    path: "db/posts/before",
    sourceSha: "sha-1",
    frontmatter: { slug: "new-slug" },
    dirty: true,
  });
});

it("preserves newer input and its backup on a validation or storage failure", async () => {
  const commands = commandMocks();
  const pending = deferred<Awaited<ReturnType<EditorCommands["save"]>>>();
  commands.save.mockReturnValue(pending.promise);
  const submitted = documentFixture();
  const { result } = mount(submitted, commands);
  act(() => result.current.operations.save());
  act(() =>
    result.current.session.markDirty(
      { ...submitted, frontmatter: { ...submitted.frontmatter, title: "New title" } },
      [{ type: "paragraph", text: "New body" }],
    ),
  );
  await act(async () =>
    pending.resolve({
      ok: false,
      code: "validation-failure",
      retryable: false,
      message: "Old input invalid",
      submittedDocument: submitted,
    }),
  );
  expect(result.current.session.document.frontmatter.title).toBe("New title");
  expect(result.current.session.documentRef.current.body).toEqual([
    { type: "paragraph", text: "New body" },
  ]);
  expect(readBackup(storage, "draft:race-draft")?.document.frontmatter.title).toBe("New title");
  expect(result.current.session.status).toBe("dirty");
});

it("serializes document operations until the response finishes", async () => {
  const commands = commandMocks();
  const pending = deferred<Awaited<ReturnType<EditorCommands["save"]>>>();
  commands.save.mockReturnValue(pending.promise);
  const { result } = mount(documentFixture(), commands);
  act(() => {
    result.current.operations.save();
    result.current.operations.save();
    result.current.operations.runPublication("publish");
    result.current.operations.openPreview();
  });
  expect(commands.save).toHaveBeenCalledTimes(1);
  expect(commands.publish).not.toHaveBeenCalled();
  expect(commands.preview).not.toHaveBeenCalled();
  await act(async () =>
    pending.resolve({ ok: true, path: "db/posts/before", sha: "sha", backupCleared: true }),
  );
  expect(result.current.operations.isPending).toBe(false);
});

it("clears the old draft backup only when all submitted edits were saved", async () => {
  const commands = commandMocks();
  commands.save.mockResolvedValue({
    ok: true,
    path: "db/posts/before",
    sha: "sha",
    backupCleared: true,
  });
  const { result } = mount(documentFixture(), commands);
  act(() => result.current.session.markDirty(result.current.session.documentRef.current));
  expect(storage.getItem("draft:race-draft")).not.toBeNull();
  act(() => result.current.operations.save());
  await act(async () => {});
  expect(result.current.session.status).toBe("saved");
  expect(storage.length).toBe(0);
});

it.each(["publish", "unpublish", "archive"] as const)(
  "keeps edits made while %s persists the submitted version",
  async (operation) => {
    const commands = commandMocks();
    const pending = deferred<Awaited<ReturnType<EditorCommands["publish"]>>>();
    commands[operation].mockReturnValue(pending.promise);
    const document = documentFixture();
    const { result } = mount(document, commands);
    act(() => result.current.operations.runPublication(operation));
    act(() =>
      result.current.session.markDirty(
        { ...document, frontmatter: { ...document.frontmatter, title: "New title" } },
        [{ type: "paragraph", text: "New body" }],
      ),
    );
    const saved = {
      ...document,
      path: "db/posts/before",
      sourceSha: "sha-1",
      dirty: false,
      frontmatter: {
        ...document.frontmatter,
        slug: "before",
        status: operation === "publish" ? ("published" as const) : ("draft" as const),
      },
    };
    await act(async () =>
      pending.resolve({
        ok: true,
        operation,
        path: "db/posts/before",
        sha: "sha-1",
        repository: { ok: true, summary: "Saved" },
        publicRefresh: { ok: true, targets: ["/"], refreshedAt: "2026-11-09" },
        backupCleared: true,
        document: saved,
      }),
    );
    expect(result.current.session.document).toMatchObject({
      sourceSha: "sha-1",
      dirty: true,
      body: [{ text: "New body" }],
      frontmatter: { title: "New title", status: saved.frontmatter.status },
    });
    expect(result.current.session.status).toBe("dirty");
  },
);

it("keeps newer edits while opening the preview of the saved snapshot", async () => {
  const commands = commandMocks();
  const pending = deferred<Awaited<ReturnType<EditorCommands["preview"]>>>();
  commands.preview.mockReturnValue(pending.promise);
  const open = vi.spyOn(window, "open").mockImplementation(() => null);
  const { result } = mount(documentFixture(), commands);
  act(() => result.current.operations.openPreview());
  act(() =>
    result.current.session.markDirty({
      ...result.current.session.documentRef.current,
      frontmatter: {
        ...result.current.session.documentRef.current.frontmatter,
        title: "New title",
      },
    }),
  );
  await act(async () =>
    pending.resolve({
      ok: true,
      slug: "before",
      path: "db/posts/before",
      sha: "sha-1",
      contentSha: "content-sha",
      expiresInSeconds: 1800,
      url: "/preview/before?token=fixture",
    }),
  );
  expect(result.current.session.document.frontmatter.title).toBe("New title");
  expect(result.current.session.document.sourceSha).toBe("sha-1");
  expect(result.current.session.status).toBe("dirty");
  expect(open).toHaveBeenCalledWith(
    "/preview/before?token=fixture",
    "_blank",
    "noopener,noreferrer",
  );
});

it("keeps newer input after a rejected request and allows the next save", async () => {
  const commands = commandMocks();
  const pending = deferred<Awaited<ReturnType<EditorCommands["save"]>>>();
  commands.save.mockReturnValueOnce(pending.promise).mockResolvedValueOnce({
    ok: true,
    path: "db/posts/before",
    sha: "sha-2",
    backupCleared: true,
  });
  const { result } = mount(documentFixture(), commands);
  act(() => result.current.operations.save());
  act(() =>
    result.current.session.markDirty({
      ...result.current.session.documentRef.current,
      frontmatter: {
        ...result.current.session.documentRef.current.frontmatter,
        title: "New title",
      },
    }),
  );
  await act(async () => pending.reject(new Error("private transport details")));
  expect(result.current.operations.isPending).toBe(false);
  expect(result.current.session.document.frontmatter.title).toBe("New title");
  expect(result.current.session.status).toBe("dirty");
  expect(result.current.session.message).not.toContain("private transport details");
  act(() => result.current.operations.save());
  await act(async () => {});
  expect(commands.save).toHaveBeenCalledTimes(2);
  expect(commands.save.mock.calls[1]?.[0].frontmatter.title).toBe("New title");
});

it("retries only the public refresh while keeping edits newer than a persisted publication", async () => {
  const commands = commandMocks();
  const pending = deferred<Awaited<ReturnType<EditorCommands["publish"]>>>();
  commands.publish.mockReturnValue(pending.promise);
  commands.retry.mockResolvedValue({
    ok: true,
    operation: "retry-public-refresh",
    publicRefresh: { ok: true, targets: ["/"], refreshedAt: "2026-11-09" },
  });
  const document = documentFixture();
  const { result } = mount(document, commands);
  act(() => result.current.operations.runPublication("publish"));
  act(() =>
    result.current.session.markDirty({
      ...result.current.session.documentRef.current,
      frontmatter: { ...document.frontmatter, title: "New title" },
    }),
  );
  const retryToken = {
    operation: "publish" as const,
    targets: ["/"],
    postPath: "db/posts/before",
    postSha: "sha-1",
    issuedAt: "2026-11-09",
  };
  await act(async () =>
    pending.resolve({
      ok: false,
      operation: "publish",
      code: "public-refresh-failed",
      retryable: true,
      message: "Saved; refresh failed",
      repository: { ok: true, summary: "Saved" },
      path: "db/posts/before",
      sha: "sha-1",
      retryToken,
      document: { ...document, frontmatter: { ...document.frontmatter, status: "published" } },
    }),
  );
  expect(result.current.session.document).toMatchObject({
    sourceSha: "sha-1",
    dirty: true,
    frontmatter: { title: "New title", status: "published" },
  });
  act(() => result.current.operations.retryRefresh());
  await act(async () => {});
  expect(commands.retry).toHaveBeenCalledWith({ retryToken });
  expect(commands.publish).toHaveBeenCalledTimes(1);
  expect(commands.save).not.toHaveBeenCalled();
  expect(result.current.session.status).toBe("dirty");
  expect(result.current.session.retryToken).toBeUndefined();
  expect(readBackup(storage, "post:db/posts/before")).toMatchObject({
    sourceSha: "sha-1",
    document: { dirty: true, frontmatter: { title: "New title" } },
  });
});
