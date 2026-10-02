import { projects } from "../projects/project-data";
import { workExperiences, activities, awards, skillGroups } from "../resume/resume-data";
import type { RagResult, RagSource } from "./contracts";
import { profile } from "../resume/profile-data";
import { isIntroduction } from "./identity";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
const careerIntent =
  /경력|근무|재직|인턴|계약직|회사|어디.*(?:일|다녔)|일했|일했다|담당|기간|몇\s*년|몇\s*개월/;
const resultIntent =
  /성과|결과|수치|성공률|검증률|몇\s*(?:개|종)|얼마나|단축|절감|개선율|퍼센트|%|배\s*빨/;
// Distinctive product identifiers only: React/API/AI alone cannot select a project.
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

function source(title: string, url: string, text: string): RagSource {
  return { title, url, text: text.slice(0, 550), score: 1 };
}

/** High-risk facts bypass generation entirely. All prose below comes from public structured data. */
export function factualAnswer(query: string): RagResult | null {
  // Do not let biography keywords hijack a request to find blog posts.
  const articleQuery = /글|블로그|포스트/.test(query);
  if (
    !articleQuery &&
    /^(?:개발\s*)?(?:활동|경험|수상|기술\s*스택)(?:\s*(?:내역|알려줘|보여줘|있어))?[?.!\s]*$/.test(
      query,
    ) &&
    !careerIntent.test(query) &&
    !resultIntent.test(query)
  ) {
    const parts: string[] = [];
    if (/기술\s*스택/.test(query)) {
      parts.push(
        `## 기술 스택\n${skillGroups.map(([name, skills]) => `- ${name}: ${skills.join(", ")}`).join("\n")}`,
      );
    } else if (/수상/.test(query)) {
      parts.push(
        `## 수상\n${awards.map(([title, detail]) => `- ${title} — ${detail}`).join("\n")}`,
      );
    } else {
      if (/경험/.test(query))
        parts.push(
          `## 개발 경험\n${workExperiences.map((w) => `- ${w.company} · ${w.role} — ${w.period}`).join("\n")}`,
        );
      parts.push(
        `## 활동\n${activities.map(([title, detail]) => `- ${title} — ${detail}`).join("\n")}`,
      );
    }
    const answer = `공개 이력서에서 확인되는 내용을 정리했어요.\n\n${parts.join("\n\n")}`;
    return { answer, sources: [source("최호 이력서", "/resume", answer)] };
  }
  if (isIntroduction(query)) {
    const text = `${profile.name} · ${profile.role}\n호조리카(Hozorica)는 최호가 사용하는 이름입니다.\n\n${profile.introduction.join("\n\n")}`;
    return { answer: text, sources: [source(`${profile.name} 소개`, "/resume", text)] };
  }
  const q = normalize(query);
  const companies = workExperiences.filter((w) => q.includes(normalize(w.company)));
  const selectedProjects = projects.filter((p) =>
    [p.name, p.slug, ...(aliases[p.slug] ?? [])].some((name) => q.includes(normalize(name))),
  );
  if (selectedProjects.length === 1 && (resultIntent.test(query) || careerIntent.test(query))) {
    const project = selectedProjects[0]!;
    const metrics = project.metrics.map((m) => `- ${m.label}: ${m.value} — ${m.detail}`).join("\n");
    const metadata = [project.organization, project.period, project.role]
      .filter(Boolean)
      .join(" · ");
    const header = `${project.name}\n${metadata}`;
    const results = metrics ? `\n\n## 주요 결과\n${metrics}` : "";
    const answer = `공개 프로젝트에 기록된 내용입니다.\n\n## ${header}\n\n${project.description}${results}`;
    return {
      answer,
      sources: [
        source(
          project.name,
          `/projects/${project.slug}`,
          `${header}\n${project.description}\n${metrics}`,
        ),
      ],
    };
  }
  if (selectedProjects.length > 1) {
    return {
      answer:
        "여러 프로젝트가 언급됐어요. 수치와 역할을 혼동하지 않도록 프로젝트를 하나씩 질문해 주세요.",
      sources: [],
    };
  }
  if (companies.length) {
    const sections = companies.map((w) => {
      const header = `## ${w.company}\n${w.period} · ${w.role}`;
      const text = `${header}\n\n${w.description}`;
      const results = resultIntent.test(query)
        ? "\n\n## 주요 결과\n" + w.achievements.map((a) => `- ${a.title}: ${a.result}`).join("\n")
        : "";
      return {
        text: text + results,
        source: source(`${w.company} 경력`, "/resume", text + results),
      };
    });
    return {
      answer: `질문의 전제와 별개로, 공개 이력서에서 확인되는 기록은 다음과 같습니다.\n\n${sections.map((s) => s.text).join("\n\n")}`,
      sources: sections.map((s) => s.source),
    };
  }
  if (careerIntent.test(query)) {
    const sections = workExperiences.map((w) => `- ${w.company} · ${w.period} · ${w.role}`);
    return {
      answer: `공개 이력서에 등록된 경력은 아래와 같습니다.\n\n## 경력\n${sections.join("\n")}\n\n이 밖의 회사·근속 기간이나 질문에 포함된 추가 경력은 확인할 수 없습니다.`,
      sources: workExperiences.map((w, i) => source(`${w.company} 경력`, "/resume", sections[i]!)),
    };
  }
  if (resultIntent.test(query)) {
    return {
      answer: "성과 수치는 프로젝트별로 확인해야 해요. 프로젝트명이나 회사명을 함께 질문해 주세요.",
      sources: [],
    };
  }
  return null;
}
