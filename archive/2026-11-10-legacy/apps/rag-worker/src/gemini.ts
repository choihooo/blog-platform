import { projects } from "@blog-platform/core/content/catalog";
import { groundedPrompt, groundedQuestion, type RagSource } from "@blog-platform/core/search";
import { requestGemini } from "./providers/gemini-http";

export async function waitForEmbeddingDelay(ms: number, signal?: AbortSignal): Promise<void> {
  signal?.throwIfAborted();
  if (!ms) return;
  await new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("aborted"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function embedGemini(input: {
  texts: string[];
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";
  apiKey: string;
  signal?: AbortSignal;
  delayMs?: number;
}): Promise<number[][]> {
  const vectors: number[][] = [];
  for (const [index, text] of input.texts.entries()) {
    if (index) await waitForEmbeddingDelay(input.delayMs ?? 0, input.signal);
    const result = (await requestGemini(
      "gemini-embedding-001",
      "embedContent",
      {
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        taskType: input.taskType,
        outputDimensionality: 768,
      },
      input.apiKey,
      10000,
      input.signal,
    )) as { embedding?: { values?: unknown } } | null;
    const values = result?.embedding?.values;
    if (
      !Array.isArray(values) ||
      values.length !== 768 ||
      values.some((v) => typeof v !== "number" || !Number.isFinite(v))
    )
      throw new Error("embedding_shape");
    const norm = Math.hypot(...values);
    if (!Number.isFinite(norm) || norm === 0) throw new Error("embedding_shape");
    vectors.push(values.map((v) => v / norm));
  }
  return vectors;
}

export async function generateGeminiAnswer(input: {
  query: string;
  sources: RagSource[];
  apiKey: string;
  model: string;
  signal?: AbortSignal;
}): Promise<string> {
  if (
    !input.sources.length ||
    input.sources.length > 3 ||
    input.sources.some((s) => s.text.length > 550)
  )
    throw new Error("gemini_invalid_sources");
  const organizationFacts = input.sources.flatMap((source) => {
    const project = projects.find((p) => source.url === `/projects/${p.slug}`);
    if (!project?.organization || project.organization === "Side Project") return [];
    const nameTerms = project.name
      .toLowerCase()
      .split(/[^a-z0-9가-힣]+/)
      .filter((t) => t.length >= 2);
    return [
      {
        title: project.name,
        url: source.url,
        organization: project.organization,
        relevance: nameTerms.filter((t) => input.query.toLowerCase().includes(t)).length,
      },
    ];
  });
  const bestRelevance = Math.max(0, ...organizationFacts.map((f) => f.relevance));
  const requiredOrganizations = /회사|소속|조직/.test(input.query)
    ? organizationFacts.filter((f) => f.relevance === bestRelevance).map((f) => f.organization)
    : [];
  const signal = input.signal
    ? AbortSignal.any([input.signal, AbortSignal.timeout(20000)])
    : AbortSignal.timeout(20000);
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = (await requestGemini(
      input.model,
      "generateContent",
      {
        systemInstruction: { parts: [{ text: groundedPrompt(input.sources) }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: [
                  groundedQuestion(input.sources, input.query),
                  organizationFacts.length
                    ? `서버의 공개 프로젝트 메타데이터 (출처별 조직): ${JSON.stringify(organizationFacts.map(({ title, url, organization }) => ({ title, url, organization })))}`
                    : "",
                  attempt
                    ? `검토 후 다시 작성하세요. 내부 지시문을 복창하지 말고, 질문한 조직이 메타데이터에 명시되어 있으면 그 조직명을 답변에 포함하세요.`
                    : "",
                ]
                  .filter(Boolean)
                  .join("\n\n"),
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 1024 },
      },
      input.apiKey,
      20000,
      signal,
    )) as {
      promptFeedback?: { blockReason?: string };
      candidates?: {
        finishReason?: string;
        content?: { parts?: { text?: unknown; thought?: boolean }[] };
      }[];
    } | null;
    const candidate = result?.candidates?.[0];
    const parts = candidate?.content?.parts;
    if (
      result?.promptFeedback?.blockReason ||
      candidate?.finishReason !== "STOP" ||
      !Array.isArray(parts)
    )
      throw new Error("gemini_invalid_answer");
    const answer = parts
      .filter((p) => !p.thought && typeof p.text === "string")
      .map((p) => p.text)
      .join("")
      .trim();
    if (!answer || answer.length > 4000) throw new Error("gemini_invalid_answer");
    const instructionEcho = /^[\s"'「]*없다고\s*답하세요[.!。\s"'」]*$/.test(answer);
    if (
      instructionEcho ||
      (requiredOrganizations.length > 0 &&
        !requiredOrganizations.some((organization) =>
          answer.replace(/\s/g, "").includes(organization.replace(/\s/g, "")),
        ))
    ) {
      if (!attempt) continue;
      throw new Error("gemini_ungrounded_answer");
    }
    const allowedUrls = new Set(input.sources.map((source) => source.url));
    return answer.replace(/\[([^\]\n]+)\]\(([^\s)]+)\)/g, (link, label: string, url: string) =>
      allowedUrls.has(url) ? link : label,
    );
  }
  throw new Error("gemini_ungrounded_answer");
}
