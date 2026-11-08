// Optional provider settings keep the legacy deployment valid without local secrets.
interface Env {
  RAG_ADMIN_TOKEN: string;
  RAG_SEARCH_TOKEN: string;
  GEMINI_API_KEY?: string;
  RAG_EMBEDDING_PROVIDER?: string;
  GEMINI_MIN_SCORE?: string;
  GEMINI_EMBED_DELAY_MS?: string;
  GEMINI_GENERATION_MODEL?: string;
}

declare namespace Cloudflare {
  interface Env {
    RAG_ADMIN_TOKEN: string;
    RAG_SEARCH_TOKEN: string;
    GEMINI_API_KEY?: string;
    RAG_EMBEDDING_PROVIDER?: string;
    GEMINI_MIN_SCORE?: string;
    GEMINI_EMBED_DELAY_MS?: string;
    GEMINI_GENERATION_MODEL?: string;
  }
}
