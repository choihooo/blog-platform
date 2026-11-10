import { it, expect } from "vitest";
import { postDocument, chunkDocuments, currentMatches } from "./corpus.js";

const outcomeChunks = [
  {
    key: "project:geobugirin",
    id: "project",
    title: "거부기린",
    url: "/projects/geobugirin",
    text: "베타 사용자 43명, 약 1,300시간 사용.",
  },
  {
    key: "post:retro",
    id: "retro",
    title: "거부기린 1만 명 사용자 회고",
    url: "/blog/geobugirin-retro",
    text: "사용자 반응을 정리한 회고 글.",
  },
];

it("retains a confident project result when no project name is stated", () => {
  const result = currentMatches(
    [
      {
        key: "project:nexacro-react-poc",
        id: "n",
        title: "Nexacro–React 전환 자동화",
        url: "/projects/nexacro-react-poc",
        text: "화면 유형 5/5 검증.",
      },
      {
        key: "post:verification",
        id: "b",
        title: "전환 검증 성과 회고",
        url: "/blog/verification",
        text: "검증 회고.",
      },
    ],
    [
      { id: "n", score: 0.82 },
      { id: "b", score: 0.9 },
    ],
    "형식 전환 검증 성과",
    0.7,
  );
  expect(result[0]?.url).toBe("/projects/nexacro-react-poc");
});

it("prioritizes a named project's evidence for outcome queries despite a stronger blog metadata match", () => {
  const result = currentMatches(
    outcomeChunks,
    [
      { id: "project", score: 0.82 },
      { id: "retro", score: 0.95 },
    ],
    "거부기린 사용자 성과",
    0.7,
  );
  expect(result[0]?.url).toBe("/projects/geobugirin");
  expect(result[0]?.text).toContain("43명");
});

it("selects recorded project metrics before a generic outcome narrative", async () => {
  const chunks = await chunkDocuments([
    {
      key: "project:geobugirin",
      title: "거부기린",
      url: "/projects/geobugirin",
      text:
        "베타 사용자: 43명. 베타 사용 시간: 약 1,300시간.\n" +
        "설계 배경과 구현 내용. ".repeat(80) +
        "\n사용자 성과를 개선하는 과정과 사용자 성과 회고.\n" +
        "마무리. ".repeat(100),
    },
  ]);
  const result = currentMatches(chunks, [], "거부기린 사용자 성과", 0.7);
  expect(result[0]?.text).toContain("43명");
  expect(result[0]?.text).toContain("1,300시간");
});

it("keeps a confident semantic project match even when blog metadata would otherwise suppress it", () => {
  const chunks = [
    {
      key: "project:nexacro",
      id: "n",
      title: "Nexacro–React 전환 자동화",
      url: "/projects/nexacro-react-poc",
      text: "화면 유형 5/5 검증.",
    },
    {
      key: "post:verification",
      id: "b",
      title: "검증 성과 회고",
      url: "/blog/verification",
      text: "일반 검증 이야기.",
    },
    {
      key: "project:i18n-validation",
      id: "i",
      title: "다국어 리소스 검증 자동화",
      url: "/projects/i18n-validation",
      text: "누락 63건을 검증했습니다.",
    },
  ];
  expect(
    currentMatches(
      chunks,
      [
        { id: "n", score: 0.82 },
        { id: "b", score: 0.9 },
        { id: "i", score: 0.78 },
      ],
      "넥사크로 검증 성과",
      0.7,
    )[0]?.url,
  ).toBe("/projects/nexacro-react-poc");
});

it("does not mistake a generic comparison word for another project's name", () => {
  const result = currentMatches(
    [
      {
        key: "project:compare",
        id: "compare",
        title: "문자열 비교 도구",
        url: "/projects/compare",
        text: "문자열 비교",
      },
      ...outcomeChunks,
    ],
    [
      { id: "project", score: 0.85 },
      { id: "retro", score: 0.95 },
    ],
    "거부기린 성과 비교",
    0.7,
  );
  expect(result[0]?.url).toBe("/projects/geobugirin");
  expect(result.some((s) => s.url === "/projects/compare")).toBe(false);
});

it("uses the requested user-count unit rather than unrelated dense performance measurements", async () => {
  const chunks = await chunkDocuments([
    {
      key: "project:geobugirin",
      title: "거부기린",
      url: "/projects/geobugirin",
      text:
        "거부기린 설계 소개. ".repeat(25) +
        "\n베타 사용자 43명, 약 1,300시간 사용.\n" +
        "설계 배경. ".repeat(90) +
        "\n사용자 성과: 처리율 100%, 오류율 0%, 지연 2초, 검증 5/5.\n" +
        "마무리. ".repeat(100),
    },
  ]);
  const result = currentMatches(chunks, [], "거부기린 사용자 성과", 0.7);
  expect(result[0]?.text).toContain("43명");
  expect(result[0]?.text).toContain("1,300시간");
});

it.each(["거부기린 사용자 성과 글", "거부기린 사용자 성과 회고", "거부기린 사용자 성과 후기"])(
  "respects explicit article intent: %s",
  (query) => {
    expect(
      currentMatches(
        outcomeChunks,
        [
          { id: "project", score: 0.9 },
          { id: "retro", score: 0.8 },
        ],
        query,
        0.7,
      )[0]?.url,
    ).toBe("/blog/geobugirin-retro");
  },
);

it("does not promote an unrelated weak project or revive stale project matches for outcome queries", () => {
  const result = currentMatches(
    [
      {
        key: "project:other",
        id: "other",
        title: "다른 제품",
        url: "/projects/other",
        text: "무관한 내용.",
      },
      {
        key: "post:target",
        id: "target",
        title: "태양광 성과",
        url: "/blog/solar",
        text: "태양광 관련 내용.",
      },
    ],
    [
      { id: "other", score: 0.2 },
      { id: "deleted-project", score: 0.99 },
      { id: "target", score: 0.8 },
    ],
    "태양광 성과",
    0.7,
  );
  expect(result.map((s) => s.url)).toEqual(["/blog/solar"]);
});

it("keeps separate career documents sharing /resume from exchanging evidence", () => {
  const result = currentMatches(
    [
      {
        key: "resume:career:0",
        id: "a",
        title: "최호 · 회사A 경력",
        url: "/resume",
        text: "프론트엔드 업무를 담당했습니다.",
      },
      {
        key: "resume:career:1",
        id: "b",
        title: "최호 · 회사B 경력",
        url: "/resume",
        text: "회사A와 연동하는 외부 서비스를 개발했습니다.",
      },
    ],
    [],
    "회사A",
  );
  expect(result).toHaveLength(1);
  expect(result[0]?.title).toBe("최호 · 회사A 경력");
  expect(result[0]?.text).not.toContain("외부 서비스");
});

it("projects table-bearing published content into readable RAG evidence", () => {
  const doc = postDocument({
    id: "table",
    slug: "table",
    title: "측정",
    summary: "요약",
    content: JSON.stringify({
      version: 1,
      nodes: [
        { type: "paragraph", text: "측정 결과" },
        { type: "table", rows: [[{ body: [{ type: "paragraph", text: "2.37s" }] }]] },
      ],
    }),
  });
  expect(doc.text).toContain("측정 결과\n\n2.37s");
  expect(doc.text).not.toContain('"nodes"');
});

it("selects the relevant body rather than replacing it with the metadata introduction", async () => {
  const chunks = await chunkDocuments([
    {
      key: "post:formats",
      title: "GGUF MLX 모델 형식",
      url: "/blog/formats",
      text:
        "회사에서 모델을 실행한 배경.\n\n" +
        "설치 기록과 배경 이야기. ".repeat(55) +
        "\nGGUF는 CPU 실행 형식, MLX는 Apple Silicon 실행 형식이다. 두 형식의 차이를 비교한다.\n" +
        "정리. ".repeat(100),
    },
  ]);
  const selected = currentMatches(chunks, [], "GGUF MLX 차이 글", 0.7);
  expect(selected[0]?.text).toContain("두 형식의 차이");
  expect(selected[0]?.text).toContain("회사에서 모델을 실행한 배경");
  expect(selected[0]?.text.length).toBeLessThanOrEqual(550);
});
