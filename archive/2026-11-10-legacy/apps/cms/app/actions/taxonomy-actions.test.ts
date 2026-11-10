import type { ContentAdapter } from "@blog-platform/core/content";
import { createContentAdapter } from "@blog-platform/core/storage";
import { revalidatePath } from "next/cache";
import { beforeEach, expect, it, vi } from "vitest";
import { evaluateAccess, getCmsSession } from "../../lib/auth/index";
import { createCategoryAction, deleteCategoryAction } from "./taxonomy-actions";
vi.mock("@blog-platform/core/storage", () => ({ createContentAdapter: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../../lib/auth/index", () => ({ evaluateAccess: vi.fn(), getCmsSession: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
it("rejects an expired session before creating a taxonomy adapter", async () => {
  vi.mocked(evaluateAccess).mockResolvedValue({
    status: "expired",
    reason: "expired",
    nextAction: "sign-in",
  });
  vi.mocked(getCmsSession).mockResolvedValue(null);
  const form = new FormData();
  form.set("categoryId", "c");
  await deleteCategoryAction(form);
  expect(createContentAdapter).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});
it("creates a normalized child category and refreshes settings", async () => {
  vi.mocked(evaluateAccess).mockResolvedValue({ status: "authorized" } as Awaited<
    ReturnType<typeof evaluateAccess>
  >);
  const createCategory = vi.fn(async () => ({ ok: true, data: { slug: "dev/java-script" } }));
  vi.mocked(createContentAdapter).mockReturnValue({ createCategory } as unknown as ContentAdapter);
  const form = new FormData();
  form.set("parentSlug", "Dev");
  form.set("childSlug", "Java Script");
  form.set("name", " JavaScript ");
  await createCategoryAction(form);
  expect(createCategory).toHaveBeenCalledWith({
    category: {
      id: "cat_dev_java_script",
      name: "JavaScript",
      slug: "dev/java-script",
      parentId: null,
      parentSlug: "dev",
      depth: 2,
    },
    authorIdentity: "cms-editor",
  });
  expect(revalidatePath).toHaveBeenCalledWith("/settings");
});
