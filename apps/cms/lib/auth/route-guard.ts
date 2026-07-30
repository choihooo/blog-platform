import { evaluateAccess } from "./guard";
import { getCmsSession } from "./session";
import type { CmsSession } from "./types";

export async function requireCmsAccess(root = process.cwd()) {
  return evaluateAccess(await getCmsSession(), root);
}

export function resolveRouteAccess(session?: CmsSession | null, root = process.cwd()) {
  return evaluateAccess(session, root);
}
