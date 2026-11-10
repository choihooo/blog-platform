"use server";

import { revalidatePath } from "next/cache";
import { normalizeSlug } from "../../features/taxonomy/model/slug";

import {
  createCategory,
  createTag,
  deleteCategory,
  updateCategory,
} from "../../features/taxonomy/server/mutations";
import { evaluateAccess, getCmsSession } from "../../lib/auth/index";
import { guardMutation } from "../../lib/auth/mutation-guard";
import { repositoryRoot } from "../../shared/server/repository-root";

async function withTaxonomyAccess<T>(operation: () => Promise<T>) {
  return guardMutation(await evaluateAccess(await getCmsSession(), repositoryRoot()), operation);
}

export async function createCategoryAction(formData: FormData) {
  const result = await createCategory(formData, withTaxonomyAccess);
  if (!result?.ok || !result.value.ok) return;
  revalidatePath("/settings");
}
export async function updateCategoryAction(formData: FormData) {
  const result = await updateCategory(formData, withTaxonomyAccess);
  if (!result?.ok || !result.value.ok) return;
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath(`/categories/${result.value.data.slug}`);
}
export async function deleteCategoryAction(formData: FormData) {
  const result = await deleteCategory(formData, withTaxonomyAccess);
  if (!result?.ok || !result.value.ok) return;
  revalidatePath("/settings");
  revalidatePath("/");
  revalidatePath(
    `/categories/${result.value.data.slug || normalizeSlug(String(formData.get("slug") ?? ""))}`,
  );
}
export async function createTagAction(formData: FormData) {
  const result = await createTag(formData, withTaxonomyAccess);
  if (!result?.ok || !result.value.ok) return;
  revalidatePath("/settings");
}
