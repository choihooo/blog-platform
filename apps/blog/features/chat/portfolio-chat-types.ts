import type { ChatArticle } from "./chat-answer";
import type { ModelLoadTiming } from "./kanana-load";
import type { RagSource } from "@blog-platform/core/search";

export type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: RagSource[];
  articles?: ChatArticle[];
};

export type ModelState = "checking" | "unsupported" | "idle" | "loading" | "ready" | "error";
export type Profile = "baseline" | "optimized";

export type Measurement = {
  model: "q8" | "q4";
  question?: string;
  answer?: string;
  profile: Profile;
  firstTextMs: number | null;
  totalMs: number;
  tokensPerSecond: number | null;
  outputTokens: number | null;
  promptTokens: number | null;
  uiUpdates: number;
  stopped: boolean;
};

export type ChatDiagnosticsData = {
  modelVariant: "q8" | "q4";
  loadMs: number | null;
  loadTiming: ModelLoadTiming | null;
  runtimeLogs: string[];
  measurements: Measurement[];
};
