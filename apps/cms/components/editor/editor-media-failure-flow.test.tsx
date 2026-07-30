import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MediaUploadStatus } from "./media-upload-status";

describe("editor media failure flow", () => {
  it("keeps failed uploads as status, not public refs", () => {
    render(
      <MediaUploadStatus
        result={{
          ok: false,
          code: "validation-failure",
          retryable: false,
          message: "Only images are allowed",
        }}
      />,
    );
    expect(screen.getByText("Only images are allowed")).toBeTruthy();
    expect(screen.queryByText(/\/media\//)).toBeNull();
  });
});
