// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { useBlogFilter } from "./use-blog-filter";
import type { PostSummary } from "../model/post-summary";
it("combines parent category and all search terms, then resets filters", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const posts: PostSummary[] = [
    {
      slug: "a",
      title: "React",
      excerpt: "Hooks",
      category: "dev/react",
      publishedAt: "",
      readingTimeLabel: "",
      tagEntries: [{ slug: "state", label: "State" }],
    },
    {
      slug: "b",
      title: "Life",
      category: "life",
      publishedAt: "",
      readingTimeLabel: "",
      tagEntries: [],
    },
  ];
  let state: ReturnType<typeof useBlogFilter>;
  function Harness() {
    state = useBlogFilter(posts, [
      { slug: "dev", label: "Dev", depth: 1 },
      { slug: "empty", label: "Empty", depth: 1 },
    ]);
    return null;
  }
  const root = createRoot(document.createElement("div"));
  try {
    await act(async () => root.render(<Harness />));
    await act(async () => {
      state.setCategory("dev");
      state.setQuery("hooks state");
    });
    expect(state!.filtered.map((p) => p.slug)).toEqual(["a"]);
    expect(state!.available.map((c) => c.slug)).toEqual(["dev"]);
    expect(state!.selectedLabel).toBe("Dev");
    await act(async () => {
      state.setCategory("");
      state.setQuery("");
    });
    expect(state!.filtered).toHaveLength(2);
  } finally {
    await act(async () => root.unmount());
  }
});
