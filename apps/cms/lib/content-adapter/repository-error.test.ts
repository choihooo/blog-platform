import { describe, expect, it } from "vitest";
import { normalizeHttpFailure, repositoryFailure } from "./repository-error.js";

describe("repository errors", () => {
  it("normalizes contract error categories", () => {
    expect(normalizeHttpFailure(401).code).toBe("unauthorized");
    expect(normalizeHttpFailure(404).code).toBe("missing-file");
    expect(normalizeHttpFailure(409).code).toBe("stale-file");
    expect(normalizeHttpFailure(422).code).toBe("validation-failure");
    expect(normalizeHttpFailure(429).code).toBe("rate-limit");
    expect(normalizeHttpFailure(503).code).toBe("temporary-connectivity");
    expect(normalizeHttpFailure(418).code).toBe("unknown");
  });

  it("preserves submitted content", () => {
    expect(repositoryFailure("stale-file", { submittedContent: "draft" }).submittedContent).toBe(
      "draft",
    );
  });
});
