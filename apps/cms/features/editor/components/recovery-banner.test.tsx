import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecoveryBanner } from "./recovery-banner";

describe("RecoveryBanner", () => {
  it("renders restore, discard, and retry actions", () => {
    render(
      createElement(RecoveryBanner, {
        message: "backup",
        onRestore: vi.fn(),
        onDiscard: vi.fn(),
        onRetry: vi.fn(),
      }),
    );
    expect(screen.getByText("backup")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Restore" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Discard" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
