// Secret bindings are supplied by the deployment environment and must also be
// typed when Wrangler generates bindings without a local .dev.vars file.
interface Env {
  RAG_ADMIN_TOKEN: string;
  RAG_SEARCH_TOKEN: string;
}

declare namespace Cloudflare {
  interface Env {
    RAG_ADMIN_TOKEN: string;
    RAG_SEARCH_TOKEN: string;
  }
}
