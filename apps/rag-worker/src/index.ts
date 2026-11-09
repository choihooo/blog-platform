import { localD1Query } from "./handlers/local-d1";
import { handleSearch } from "./handlers/search";
import { handleSync } from "./handlers/sync";
import { json } from "./http/response";
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/health" && request.method === "GET") return json({ ok: true });
    if (path === "/__local/d1" && request.method === "POST") return localD1Query(request, env);
    if (request.method !== "POST") return json({ error: "not_found" }, 404);
    if (path === "/sync") return handleSync(request, env);
    if (path === "/search" || path === "/answer")
      return handleSearch(request, env, path === "/answer" ? "answer" : "search");
    return json({ error: "not_found" }, 404);
  },
} satisfies ExportedHandler<Env>;
