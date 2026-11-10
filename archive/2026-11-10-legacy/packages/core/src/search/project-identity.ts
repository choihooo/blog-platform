import { projects } from "../content/catalog/index.js";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
// Product identifiers, not generic technologies or comparison/metric vocabulary.
const aliases: Record<string, string[]> = {
  "nexacro-react-poc": ["nexacro", "넥사크로"],
  kusting: ["kusting", "커스팅"],
  comma: ["comma", "콤마"],
  geobugirin: ["거부기린", "geobugirin"],
  "forensic-agent": ["포렌식", "forensic"],
  "i18n-validation": ["i18n", "다국어"],
  "typescript-migration": ["typescript마이그레이션", "타입스크립트마이그레이션"],
  "api-data-transition": ["api기반데이터전환", "운영변경절차"],
  "ai-workflow": ["ai프론트엔드수정", "ai수정워크플로"],
};

export function referencedProjects(query: string) {
  const q = normalize(query);
  return projects.filter((p) =>
    [p.name, p.slug, ...(aliases[p.slug] ?? [])].some((name) => q.includes(normalize(name))),
  );
}
