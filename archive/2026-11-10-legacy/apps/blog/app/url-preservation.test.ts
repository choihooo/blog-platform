import { describe, expect, it } from "vitest";
import config from "../next.config.mjs";

describe("public URL preservation", () => {
  it("preserves redirect conditions, ordering, destinations and permanent flags", async () => {
    expect(await config.redirects!()).toMatchSnapshot();
  });

  it("preserves canonical rewrites and their ordering", async () => {
    expect(await config.rewrites!()).toMatchSnapshot();
  });
});
