import type { RagSource } from "@blog-platform/core/search";

export type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: RagSource[];
};
