export {
  getCategory,
  getContentCollection,
  getPostBySlug,
  getPostsByCategory,
  getPostsByTag,
  getPublishedPosts,
  getSiteConfig,
  normalizeForDualRunCompare as toDualRunComparable,
} from "../server/content-source";
export type { PublicPost } from "../server/content-source";

export function isDualRunMatch(
  left: import("../server/content-source").PublicPost,
  right: import("../server/content-source").PublicPost,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}
