import { profile } from "../content/catalog/index.js";

// Preserve Korean particles, but do not match aliases inside unrelated names/words.
const names = [profile.name, ...profile.aliases].join("|");
const personPattern = () =>
  new RegExp(
    `(^|[^a-z0-9가-힣])(?:${names})(?=$|[^a-z0-9가-힣]|(?:님|은|는|이|가|의|에|을|를|와|랑|하고)(?=$|[^a-z0-9가-힣]))`,
    "gi",
  );

export function hasOwnerName(query: string): boolean {
  return personPattern().test(query);
}

export function canonicalQuery(query: string): string {
  return query.replace(personPattern(), (_, prefix: string) => `${prefix}${profile.name}`);
}

export function searchQuery(query: string): string {
  const canonical = canonicalQuery(query);
  if (!/글|블로그|포스트|프로젝트/i.test(query)) return canonical;
  // This corpus already belongs to the owner; their name overweights resume matches.
  return (
    canonical
      .replace(
        /(^|\s)최호(?:님)?(?:가|이|의|은|는)?(?=\s|$)\s*(?:(?:쓴|작성한|만든|개발한)(?=\s|$))?/g,
        "$1",
      )
      .trim() || canonical
  );
}

/** Only introduction/identity requests; topical and unknown personal questions remain RAG. */
export function isIntroduction(query: string): boolean {
  if (!hasOwnerName(query)) return false;
  const rest = query.replace(personPattern(), "$1").replace(/[\s?!.,？]/g, "");
  return (
    /^(?:(?:님|은|는|이|가|을|를|에대해|에대해서))?(?:누구(?:야|인가요|세요|예요)?|어떤사람(?:이야|인가요)?|소개(?:해줘|해주세요|해줄래)?|알려줘)?$/.test(
      rest,
    ) ||
    /^(?:와|과|랑|하고)?(?:은|는|이|가)?(?:같은사람|동일인)(?:이야|인가요|이니|맞아)?$/.test(rest)
  );
}
