import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

test("demo articles, comparison routes and archived assets stay outside public routes", () => {
  for (const name of ["app/color-lab", "public/design-lab", "public/archive", "public/preview", "app/blog/release-smoke"]) {
    assert.equal(existsSync(name), false, `${name} must not be published`);
  }
  for (const entry of readdirSync("app/blog", { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const source = readFileSync(path.join("app/blog", entry.name, "page.mdx"), "utf8");
    assert.doesNotMatch(source, /["']?demo["']?\s*:\s*true/, entry.name);
  }
  for (const name of ["fixtures/demo-posts", "components/demos", "components/DemoContainer.tsx", "components/DemoCaption.tsx", "components/DemoVideo.tsx", "docs/reference", "app/_lab", "app/fonts/spoqa", "app/fonts/noto-serif-kr-700.ttf", "scripts/build-design-lab.mjs"]) {
    assert.equal(existsSync(name), false, `${name} is obsolete`);
  }
});

test("approved visual styles and rendered layout remain byte-identical", () => {
  const approved = JSON.parse(readFileSync("fixtures/approved-design.json", "utf8"));
  const digest = value => createHash("sha256").update(value).digest("hex");
  for (const [name, hash] of Object.entries(approved.sha256)) assert.equal(digest(readFileSync(name)), hash, name);
  const layout = readFileSync("app/layout.tsx", "utf8").split("export default function RootLayout")[1];
  assert.equal(digest(layout), approved.layout_body_sha256);
});

test("archive payload and local credentials are ignored by upload rules", () => {
  const ignore = readFileSync(".vercelignore", "utf8");
  for (const entry of ["archive/", "preview/", ".env", "docs/"]) {
    assert.ok(ignore.split("\n").includes(entry), entry);
  }
});
