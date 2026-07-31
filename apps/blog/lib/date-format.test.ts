import { describe, expect, it } from "vitest";

import { formatPostDate, formatPostDateTime } from "./date-format";

describe("post date formatting", () => {
  it("formats list dates without time", () => {
    expect(formatPostDate("2026-07-27T15:55:39+09:00")).toBe("2026. 7. 27.");
  });

  it("formats detail dates with local time", () => {
    expect(formatPostDateTime("2026-07-27T15:55:39+09:00")).toBe(
      "2026. 7. 27. 오후 3:55",
    );
  });
});
