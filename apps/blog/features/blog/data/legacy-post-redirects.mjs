// Matched by exact title against the public catalog on 2026-10-04.
// Source IDs: scripts/migration/tistory-output/posts.json (post_tistory_<id>).
export const legacyPostSlugs = {
  39: "verifiable-ai-ui-design",
  37: "gangnamunni-technical-seo-strategy",
  36: "contributing-korean-translation",
  35: "tag-recommendation-to-embedding-recommendation",
  34: "build-faster-with-ai-understand-deeper",
  33: "ssl-tls-certificate-manager",
  32: "moai-adk-talk-review",
  31: "goorm-commit-ai-operations-review",
  30: "aws-overview-for-frontend-developers",
  29: "geobugirin-10000-users-retrospective",
  28: "gguf-mlx-explained",
  27: "electron-webview-to-tauri-native-ui-migration",
  26: "naver-cloud-data-stream",
  25: "typescript-compiler-performance-39-vs-58",
  24: "ai-personal-issue-tracker-linear",
  23: "typescript-compiler-internals",
  21: "ai-agent-skills-vs-multi-agent",
  20: "cs-design-patterns-interview",
  19: "woori-programmers-book-review",
  18: "developer-writing-book-review",
  16: "nextjs-login-implementation",
  15: "nextjs-server-client-components",
  14: "react-router-loader-action",
  13: "ict-internship-2025-review",
  12: "github-actions-ci",
  11: "react-devtools-guide",
  10: "react-ssr-explained",
  9: "sparcs-science-hackathon-2024-retrospective",
  8: "react-throttle-debounce",
  7: "react-memoization-timing",
  6: "github-pages-custom-domain",
  5: "regular-expression",
};

export function legacyPostRedirects() {
  return Object.entries(legacyPostSlugs).flatMap(([id, slug]) =>
    [`/${id}`, `/m/${id}`, `/posts/tistory-${id}`, `/blog/tistory-${id}`].map((source) => ({
      source,
      destination: `https://hozorica.com/blog/${slug}`,
      permanent: true,
    })),
  );
}
