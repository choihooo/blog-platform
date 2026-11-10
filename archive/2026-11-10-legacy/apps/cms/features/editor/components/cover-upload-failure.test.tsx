import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { FrontmatterPanel } from "./frontmatter-panel";

it("keeps the current cover when a cover upload fails", async () => {
  const onChange = vi.fn();
  const upload = vi.fn().mockResolvedValue({
    ok: false,
    code: "temporary-connectivity",
    retryable: true,
    message: "Upload failed",
  });
  render(
    <FrontmatterPanel
      upload={upload}
      frontmatter={{ title: "Existing", status: "draft", coverImage: "/media/existing.png" }}
      postSlug="existing"
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getByLabelText("Cover image file"), {
    target: { files: [new File(["image"], "new.png", { type: "image/png" })] },
  });
  await waitFor(() => expect(screen.getByText(/Upload failed/)).toBeTruthy());
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole("img", { name: "Existing cover" }).getAttribute("src")).toBe(
    "/media/existing.png",
  );
});
