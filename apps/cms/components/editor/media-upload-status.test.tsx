import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MediaUploadStatus } from "./media-upload-status";

describe("MediaUploadStatus", () => {
  it("renders pending, success, and retryable failures", () => {
    const { rerender } = render(<MediaUploadStatus pending />);
    expect(screen.getByText("Uploading image...")).toBeTruthy();

    rerender(
      <MediaUploadStatus
        result={{
          ok: true,
          media: { path: "p", publicPath: "/media/a.webp", sha: "s", sizeBytes: 1 },
          reference: { target: "cover", coverImage: "/media/a.webp" },
          message: "Done",
        }}
      />,
    );
    expect(screen.getByText("Done")).toBeTruthy();

    rerender(
      <MediaUploadStatus
        result={{ ok: false, code: "temporary-connectivity", retryable: true, message: "Network" }}
      />,
    );
    expect(screen.getByText(/Try again/)).toBeTruthy();
  });
});
