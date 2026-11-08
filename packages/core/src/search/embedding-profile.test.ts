import { describe, expect, it } from "vitest";
import { chunkDocuments, currentMatches } from "./corpus.js";
import { embeddingProfile } from "./embedding-profile.js";

const document = { key: "a", title: "Title", url: "/resume", text: "Public text" };

describe("embedding profile isolation", () => {
  it("preserves legacy ids and separates Gemini dimensions and input versions", async () => {
    const legacy = await chunkDocuments([document]);
    expect(legacy[0]!.id).toBe("c9be1ba4e10bec4891f17696fc2c8d37bf99a37b6119344b7fb6d6519f2b1b26");
    const profile = embeddingProfile("gemini", 0.65);
    const gemini = await chunkDocuments([document], profile);
    expect(await chunkDocuments([document], embeddingProfile("workers-ai"))).toEqual(legacy);
    expect(gemini[0]!.id).not.toBe(legacy[0]!.id);
    expect(await chunkDocuments([document], profile)).toEqual(gemini);
    for (const change of [{ dimensions: 1536 }, { inputVersion: "v2" }]) {
      expect((await chunkDocuments([document], { ...profile, ...change }))[0]!.id).not.toBe(
        gemini[0]!.id,
      );
    }
    expect(currentMatches(gemini, [{ id: legacy[0]!.id, score: 0.99 }])).toEqual([]);
  });
  it("requires a calibrated Gemini cutoff and applies it to semantic matches", async () => {
    expect(() => embeddingProfile("gemini")).toThrow("gemini_min_score_required");
    const chunks = await chunkDocuments([document]);
    expect(currentMatches(chunks, [{ id: chunks[0]!.id, score: 0.6 }], "", 0.65)).toEqual([]);
    expect(currentMatches(chunks, [{ id: chunks[0]!.id, score: 0.7 }], "", 0.65)).toHaveLength(1);
  });
});
