import { File as NodeFile } from "node:buffer";
import sharp from "sharp";
import { afterEach, expect, it, vi } from "vitest";

const put = vi.hoisted(() =>
  vi.fn(async () => {
    throw new Error("Unauthorized storage write");
  }),
);
vi.mock("../../lib/auth/session", () => ({ getCmsSession: async () => null }));
vi.mock("@blog-platform/core/storage", async (original) => ({
  ...(await original<object>()),
  createMediaStore: () => ({ put }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  put.mockClear();
});

it("rejects unauthenticated media uploads before any storage write", async () => {
  vi.stubEnv("CMS_DEV_BYPASS_AUTH", "");
  vi.stubGlobal("File", NodeFile);
  const bytes = await sharp({ create: { width: 1, height: 1, channels: 3, background: "#fff" } })
    .png()
    .toBuffer();
  const input = new Map<string, unknown>([
    ["target", "body"],
    ["postSlug", "draft"],
    ["file", new NodeFile([bytes], "image.png", { type: "image/png" })],
  ]);
  const { uploadEditorMediaAction } = await import("./editor-actions");
  expect(await uploadEditorMediaAction(input as unknown as FormData)).toMatchObject({
    ok: false,
    code: "auth-required",
  });
  expect(put).not.toHaveBeenCalled();
});
