import { describe, expect, it } from "vitest";

import { validateContentCollection } from "./collection.js";
import { collectionInput } from "./content-fixtures.test.js";

describe("content file structure", () => {
  it("validates the required content file contract from fixtures", () => {
    const result = validateContentCollection(collectionInput());

    expect(result.success).toBe(true);
    expect(result.data?.posts[0]?.path).toBe("content/posts/hello-world.mdx");
    expect(result.data?.authors[0]?.id).toBe("ho");
    expect(result.data?.site.siteName).toBe("Ho's Blog");
  });
});
