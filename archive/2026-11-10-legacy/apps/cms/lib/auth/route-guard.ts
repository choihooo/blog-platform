import { evaluateAccess } from "./guard";
import { getCmsSession } from "./session";
import type { CmsSession } from "./types";

export async function requireCmsAccess(root?: string) {
  return evaluateAccess(await getCmsSession(), root);
}

export function resolveRouteAccess(session?: CmsSession | null, root?: string) {
  return evaluateAccess(session, root);
}
