export {
  getCategory,
  getContentCollection,
  getPostBySlug,
  getPostsByCategory,
  getPostsByTag,
  getPublishedPosts,
  getSiteConfig,
  normalizeForDualRunCompare as toDualRunComparable,
} from "./content-source";
export type { PublicPost } from "./content-source";

export function isDualRunMatch(
  left: import("./content-source").PublicPost,
  right: import("./content-source").PublicPost,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}
