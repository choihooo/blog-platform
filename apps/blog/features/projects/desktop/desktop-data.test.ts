import { expect, it } from "vitest";
import { projectIdFromHash } from "./desktop-data";
it("restores registered project hashes and ignores unknown or malformed ones", () => {
  expect(projectIdFromHash("#kusting")).toBe("kusting");
  expect(projectIdFromHash("#ai%2Dworkflow")).toBe("ai-workflow");
  expect(projectIdFromHash("#missing")).toBeUndefined();
  expect(projectIdFromHash("#%")).toBeUndefined();
});
