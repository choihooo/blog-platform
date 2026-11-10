import { createContentAdapter } from "@blog-platform/core/storage";
import type { GuardedMutationResult } from "../../../lib/auth/types";
import { normalizeSlug } from "../model/slug";
type TaxonomyAccess = <T>(operation: () => Promise<T>) => Promise<GuardedMutationResult<T>>;
function idFromSlug(prefix: string, slug: string) {
  return `${prefix}_${slug.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
}

export async function createCategory(formData: FormData, withTaxonomyAccess: TaxonomyAccess) {
  const parentSlug = normalizeSlug(String(formData.get("parentSlug") ?? ""));
  const childSlug = normalizeSlug(String(formData.get("childSlug") ?? ""));
  const rawSlug = normalizeSlug(String(formData.get("slug") ?? ""));
  const slug = parentSlug && childSlug ? `${parentSlug}/${childSlug}` : rawSlug;
  const name = String(formData.get("name") ?? "").trim();
  if (!slug || !name) {
    return;
  }

  const result = await withTaxonomyAccess(() =>
    createContentAdapter().createCategory({
      category: {
        id: idFromSlug("cat", slug),
        name,
        slug,
        parentId: null,
        parentSlug: slug.includes("/") ? slug.split("/")[0] : null,
        depth: slug.includes("/") ? 2 : 1,
      },
      authorIdentity: "cms-editor",
    }),
  );
  return result;
}
export async function updateCategory(formData: FormData, withTaxonomyAccess: TaxonomyAccess) {
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const depth = String(formData.get("depth") ?? "");
  const parentSlug = normalizeSlug(String(formData.get("parentSlug") ?? ""));
  const childSlug = normalizeSlug(String(formData.get("childSlug") ?? ""));
  const rawSlug = normalizeSlug(String(formData.get("slug") ?? ""));
  const slug = depth === "2" && parentSlug && childSlug ? `${parentSlug}/${childSlug}` : rawSlug;
  const name = String(formData.get("name") ?? "").trim();
  if (!categoryId || !slug || !name) {
    return;
  }

  const result = await withTaxonomyAccess(() =>
    createContentAdapter().updateCategory({
      categoryId,
      category: {
        name,
        slug,
        parentSlug: depth === "2" ? parentSlug : null,
      },
      authorIdentity: "cms-editor",
    }),
  );
  return result;
}
export async function deleteCategory(formData: FormData, withTaxonomyAccess: TaxonomyAccess) {
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!categoryId) {
    return;
  }

  const result = await withTaxonomyAccess(() =>
    createContentAdapter().deleteCategory({
      categoryId,
      authorIdentity: "cms-editor",
    }),
  );
  return result;
}
export async function createTag(formData: FormData, withTaxonomyAccess: TaxonomyAccess) {
  const slug = normalizeSlug(String(formData.get("slug") ?? "")).replace(/\//g, "-");
  const name = String(formData.get("name") ?? "").trim();
  if (!slug || !name) {
    return;
  }

  const result = await withTaxonomyAccess(() =>
    createContentAdapter().createTag({
      tag: {
        id: idFromSlug("tag", slug),
        name,
        slug,
      },
      authorIdentity: "cms-editor",
    }),
  );
  return result;
}
