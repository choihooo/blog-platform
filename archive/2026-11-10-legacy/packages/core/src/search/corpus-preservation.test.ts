import { describe, expect, it } from "vitest";
import { chunkDocuments, embeddingText, postDocument, staticDocuments } from "./corpus.js";

describe("corpus preservation across module moves", () => {
  it("preserves public document text, ordering, taxonomy and chunk identifiers", async () => {
    const documents = [
      ...staticDocuments(),
      postDocument({
        id: "fixture-1",
        slug: "공개-본문",
        title: "보존할 본문",
        summary: "검색 요약",
        content: JSON.stringify({
          version: 1,
          nodes: [{ type: "paragraph", text: "보존할 본문입니다." }],
        }),
        tags_json: JSON.stringify([{ name: "리액트", slug: "react" }]),
        category_name: "프론트엔드",
        category_slug: "frontend",
        parent_category_name: "개발",
        parent_category_slug: "development",
      }),
    ];
    const chunks = await chunkDocuments(documents);
    expect({ documents, chunks, embeddingInputs: chunks.map(embeddingText) }).toMatchSnapshot();
  });
});
