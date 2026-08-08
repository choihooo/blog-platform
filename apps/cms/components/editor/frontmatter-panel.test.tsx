import { cleanup, createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { uploadEditorMediaAction } from "../../app/actions/editor-actions";
import { FrontmatterPanel } from "./frontmatter-panel";

vi.mock("../../app/actions/editor-actions", () => ({
  uploadEditorMediaAction: vi.fn(),
}));

describe("FrontmatterPanel media upload", () => {
  beforeEach(() => {
    vi.mocked(uploadEditorMediaAction).mockReset();
  });

  afterEach(() => cleanup());

  it("renders existing cover and cover upload control", () => {
    render(
      <FrontmatterPanel
        frontmatter={{
          title: "Hello",
          status: "draft",
          coverImage: "/media/covers/hello-a.webp",
        }}
        postSlug="hello"
      />,
    );
    expect(screen.getByRole("img", { name: "Hello cover" })).toHaveProperty(
      "src",
      expect.stringContaining("/media/covers/hello-a.webp"),
    );
    expect(screen.getByRole("button", { name: "Upload cover" })).toBeTruthy();
  });

  it("uploads pasted clipboard images as cover media", async () => {
    vi.mocked(uploadEditorMediaAction).mockResolvedValueOnce({
      ok: true,
      media: {
        path: "public/media/covers/hello-pasted.webp",
        publicPath: "/media/covers/hello-pasted.webp",
        sha: "sha",
        sizeBytes: 123,
      },
      reference: {
        target: "cover",
        coverImage: "/media/covers/hello-pasted.webp",
      },
      message: "Image uploaded",
    });
    const onChange = vi.fn();

    render(
      <FrontmatterPanel
        frontmatter={{ title: "Hello", slug: "hello", status: "draft" }}
        onChange={onChange}
        postSlug="hello"
      />,
    );

    const panel = screen.getByText("Cover").closest("aside");
    const file = new File(["image"], "", { type: "image/png" });
    const paste = createEvent.paste(panel!);
    Object.defineProperty(paste, "clipboardData", {
      value: {
        files: [file],
        getData: vi.fn(() => ""),
        items: [],
      },
    });
    fireEvent(panel!, paste);

    await waitFor(() => {
      expect(uploadEditorMediaAction).toHaveBeenCalledWith(expect.any(FormData));
    });
    const formData = vi.mocked(uploadEditorMediaAction).mock.calls[0]?.[0] as FormData;
    expect(formData.get("target")).toBe("cover");
    expect(formData.get("postSlug")).toBe("hello");
    expect((formData.get("file") as File).name).toBe("clipboard-image.png");
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ coverImage: "/media/covers/hello-pasted.webp" }),
      );
    });
  });

  it("edits parent and child categories through dropdowns", () => {
    const onChange = vi.fn();
    render(
      <FrontmatterPanel
        categories={[
          { slug: "engineering", name: "Engineering", depth: 1 },
          { slug: "engineering/fe", name: "FE", depth: 2, parentSlug: "engineering" },
        ]}
        frontmatter={{
          title: "Hello",
          status: "draft",
          category: "engineering/fe",
        }}
        onChange={onChange}
        postSlug="hello"
      />,
    );

    const parentCombobox = screen.getByLabelText("1차 카테고리");
    const childCombobox = screen.getByLabelText("2차 카테고리");
    expect(parentCombobox).toHaveProperty("value", "Engineering");
    expect(childCombobox).toHaveProperty("value", "FE");
    const childClear = childCombobox
      .closest(".hods-combobox")
      ?.querySelector<HTMLButtonElement>('button[aria-label="선택 지우기"]');
    expect(childClear).toBeTruthy();
    fireEvent.click(childClear!);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ category: "engineering" }));
  });

  it("keeps hyphens while editing a slug", () => {
    const onChange = vi.fn();
    render(
      <FrontmatterPanel
        frontmatter={{
          title: "Hello",
          status: "draft",
          slug: "hello",
        }}
        onChange={onChange}
        postSlug="hello"
      />,
    );

    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: "hello-" } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ slug: "hello-" }));
  });
});
