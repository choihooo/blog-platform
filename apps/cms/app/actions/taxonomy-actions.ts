"use server";

import { revalidatePath } from "next/cache";

import { createContentAdapter } from "../../lib/content-adapter/content-adapter";
import { evaluateAccess, getCmsSession } from "../../lib/auth/index";
import { guardMutation } from "../../lib/auth/mutation-guard";
import { repositoryRoot } from "../../lib/editor/root";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/\/-+|-+\//g, "/");
}

function idFromSlug(prefix: string, slug: string) {
  return `${prefix}_${slug.replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
}

async function withTaxonomyAccess<T>(operation: () => Promise<T>) {
  return guardMutation(await evaluateAccess(await getCmsSession(), repositoryRoot()), operation);
}

export async function createCategoryAction(formData: FormData) {
  const parentSlug = normalizeSlug(String(formData.get("parentSlug") ?? ""));
  const childSlug = normalizeSlug(String(formData.get("childSlug") ?? ""));
  const rawSlug = normalizeSlug(String(formData.get("slug") ?? ""));
  const slug = parentSlug && childSlug ? `${parentSlug}/${childSlug}` : rawSlug;
  const name = String(formData.get("name") ?? "").trim();
  if (!slug || !name) {
    return;
  }

  const result = await withTaxonomyAccess(() =>
    createContentAdapter("d1r2").createCategory({
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
  if (!result.ok || !result.value.ok) return;
  revalidatePath("/settings");
}

export async function updateCategoryAction(formData: FormData) {
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
    createContentAdapter("d1r2").updateCategory({
      categoryId,
      category: {
        name,
        slug,
        parentSlug: depth === "2" ? parentSlug : null,
      },
      authorIdentity: "cms-editor",
    }),
  );
  if (!result.ok || !result.value.ok) return;
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath(`/categories/${result.value.data.slug}`);
}

export async function createTagAction(formData: FormData) {
  const slug = normalizeSlug(String(formData.get("slug") ?? "")).replace(/\//g, "-");
  const name = String(formData.get("name") ?? "").trim();
  if (!slug || !name) {
    return;
  }

  const result = await withTaxonomyAccess(() =>
    createContentAdapter("d1r2").createTag({
      tag: {
        id: idFromSlug("tag", slug),
        name,
        slug,
      },
      authorIdentity: "cms-editor",
    }),
  );
  if (!result.ok || !result.value.ok) return;
  revalidatePath("/settings");
}
