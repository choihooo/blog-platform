import { describe, expect, it } from "vitest";

export const validMdxSource = `---
title: Hello MDX
status: published
slug: hello-mdx
author: ho
publishedAt: "2026-07-30"
tags:
  - mdx
---

# Intro

본문입니다.

## Detail

\`\`\`ts
# not a heading
console.log("hi");
\`\`\`
`;

export const invalidFrontmatterSource = `---
title: [broken
---

# Broken
`;

export const unsafeMdxSource = `---
title: Unsafe
status: draft
---

<script>alert("x")</script>
`;

describe("mdx fixtures", () => {
  it("keeps shared fixtures available", () => {
    expect(validMdxSource).toContain("# Intro");
    expect(invalidFrontmatterSource).toContain("broken");
    expect(unsafeMdxSource).toContain("<script>");
  });
});
