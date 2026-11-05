import {
  groundedPrompt,
  groundedQuestion,
  type RagSource,
} from "../../blog/features/rag/contracts";

const API = "https://generativelanguage.googleapis.com/v1beta/models/";

async function requestGemini(
  model: string,
  method: string,
  body: unknown,
  apiKey: string,
  timeout: number,
  signal?: AbortSignal,
): Promise<unknown> {
  if (!apiKey || !/^[a-z0-9.-]+$/.test(model)) throw new Error("gemini_not_configured");
  const combined = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeout)])
    : AbortSignal.timeout(timeout);
  combined.throwIfAborted();
  const response = await fetch(`${API}${model}:${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify(body),
    signal: combined,
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(response.status === 429 ? "rate_limited" : "gemini_unavailable");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("gemini_invalid_response");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 262144) {
        await reader.cancel();
        throw new Error("gemini_invalid_response");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

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
  const result = (await requestGemini(
    input.model,
    "generateContent",
    {
      systemInstruction: { parts: [{ text: groundedPrompt(input.sources) }] },
      contents: [{ role: "user", parts: [{ text: groundedQuestion(input.sources, input.query) }] }],
      generationConfig: { maxOutputTokens: 1024 },
    },
    input.apiKey,
    20000,
    input.signal,
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
  const allowedUrls = new Set(input.sources.map((source) => source.url));
  return answer.replace(/\[([^\]\n]+)\]\(([^\s)]+)\)/g, (link, label: string, url: string) =>
    allowedUrls.has(url) ? link : label,
  );
}
