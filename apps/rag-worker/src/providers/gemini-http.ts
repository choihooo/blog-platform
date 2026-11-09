const API = "https://generativelanguage.googleapis.com/v1beta/models/";

export class GeminiHttpError extends Error {
  constructor(
    readonly providerStatus: number,
    readonly operation: "embedContent" | "generateContent" | undefined,
    readonly providerReason?: "location_unsupported",
  ) {
    super(providerStatus === 429 ? "rate_limited" : "gemini_unavailable");
    this.name = "GeminiHttpError";
  }
}

export async function requestGemini(
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
    let providerReason: "location_unsupported" | undefined;
    if (response.status === 400) {
      try {
        const payload = (await readGeminiJson(response)) as {
          error?: { message?: unknown };
        } | null;
        if (payload?.error?.message === "User location is not supported for the API use.")
          providerReason = "location_unsupported";
      } catch {
        combined.throwIfAborted();
      }
    } else {
      await response.body?.cancel();
    }
    throw new GeminiHttpError(
      response.status,
      method === "embedContent" || method === "generateContent" ? method : undefined,
      providerReason,
    );
  }
  return readGeminiJson(response);
}

async function readGeminiJson(response: Response): Promise<unknown> {
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
