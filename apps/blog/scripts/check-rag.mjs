// Live local API regression; this tests retrieval, not browser-model prose quality.
const endpoint = "http://localhost:3001/api/rag";
const catalog = {
  query: "대표 프로젝트",
  titles: ["AI 수정 workflow 자동화", "Nexacro–React 전환 자동화", "AI 포렌식 Evidence UI"],
};
const cases = [
  ...[
    "대표 프로젝트",
    "프로젝트 목록",
    "개인 프로젝트",
    "사이드 프로젝트",
    "주요 프로젝트 알려줘",
    "회사 프로젝트",
    "호조리카 프로젝트",
    "Hozorica 프로젝트",
  ].map((query) => ({ query, path: "/projects/", answer: true })),
  ...[
    "최호",
    "호조리카 소개해줘",
    "Hozorica 누구야",
    "최호랑 호조리카는 같은 사람이야?",
    "기술 스택",
    "개발 경험",
    "활동",
    "수상",
    "아이겐 코리아 경력",
    "야근몬스터 경력",
  ].map((query) => ({ query, path: "/resume", answer: true })),
  { query: "Nexacro 성과", path: "/projects/nexacro-react-poc", answer: true },
  { query: "거부기린 성과", path: "/projects/geobugirin", answer: true },
  { query: "그거 자세히", context: catalog, contains: "어느 항목" },
  { query: "2번 성과", context: catalog, path: "/projects/nexacro-react-poc", answer: true },
  { query: "그거", contains: "이름" },
  { query: "React 글 추천", path: "/blog/", topic: /react|리액트/i },
  { query: "AI 글 있어?", path: "/blog/", topic: /AI|인공지능/i },
  { query: "호조리카가 쓴 React 글", path: "/blog/", topic: /react|리액트/i },
  { query: "메모이제이션 글", path: "/blog/", topic: /메모이제이션|memo/i },
  { query: "첫 번째 더 자세히", context: catalog, path: "/projects/ai-workflow" },
  { query: "관련 글 있어?", context: { query: "React 글", titles: ["React"] }, path: "/blog/" },
  { query: "양자역학 초전도체 수식 글", contains: "단정할 수는 없어요" },
];
let failures = 0;
for (const item of cases) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:3001" },
      body: JSON.stringify({
        query: item.query,
        ...(item.context ? { context: item.context } : {}),
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const data = await res.json();
    const pass =
      res.ok &&
      (!item.path || data.sources?.some((s) => s.url.startsWith(item.path))) &&
      (!item.answer || !!data.answer) &&
      (!item.contains || data.answer?.includes(item.contains)) &&
      (!item.topic || data.sources?.some((s) => item.topic.test(s.title)));
    if (!pass) failures++;
    console.log(
      JSON.stringify({
        query: item.query,
        pass,
        status: res.status,
        titles: data.sources?.map((s) => s.title),
        answer: data.answer?.slice(0, 130),
        resolvedQuery: data.resolvedQuery,
      }),
    );
  } catch (error) {
    failures++;
    console.log(JSON.stringify({ query: item.query, pass: false, error: error.message }));
  }
}
console.log(
  JSON.stringify({ total: cases.length, passed: cases.length - failures, failed: failures }),
);
process.exitCode = failures ? 1 : 0;
