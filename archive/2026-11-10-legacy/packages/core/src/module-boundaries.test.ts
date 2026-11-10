import { builtinModules } from "node:module";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const core = path.join(root, "packages/core/src");
const builtins = new Set(builtinModules.flatMap((name) => [name, `node:${name}`]));

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory()
      ? files(full)
      : /\.(ts|tsx|mjs)$/.test(full) && !full.includes(".test.")
        ? [full]
        : [];
  });
}

function imports(file: string): string[] {
  return [
    ...readFileSync(file, "utf8").matchAll(/(?:from\s*|import\s*\(|import\s*)["']([^"']+)["']/g),
  ].map((match) => match[1]!);
}

function relativeTarget(file: string, ref: string) {
  if (!ref.startsWith(".")) return;
  const stem = path.resolve(path.dirname(file), ref).replace(/\.js$/, "");
  return [stem, `${stem}.ts`, `${stem}.tsx`, `${stem}.mjs`, path.join(stem, "index.ts")].find(
    (name) => existsSync(name) && !readdirSafe(name),
  );
}
function readdirSafe(name: string) {
  try {
    readdirSync(name);
    return true;
  } catch {
    return false;
  }
}

describe("workspace module boundaries", () => {
  it("Worker never imports Blog internals", () => {
    const violations = files(path.join(root, "apps/rag-worker/src")).flatMap((file) =>
      imports(file)
        .filter((ref) => relativeTarget(file, ref)?.startsWith(path.join(root, "apps/blog/")))
        .map((ref) => `${file}: ${ref}`),
    );
    expect(violations).toEqual([]);
  });
  it("Blog never imports CMS internals", () => {
    const violations = files(path.join(root, "apps/blog")).flatMap((file) =>
      imports(file)
        .filter((ref) => relativeTarget(file, ref)?.startsWith(path.join(root, "apps/cms/")))
        .map((ref) => `${file}: ${ref}`),
    );
    expect(violations).toEqual([]);
  });
  it("provides explicit pure subpaths without a root barrel", () => {
    const manifest = path.join(root, "packages/core/package.json");
    expect(existsSync(manifest), "core manifest must exist").toBe(true);
    const config = JSON.parse(readFileSync(manifest, "utf8"));
    expect(config.exports["."]).toBeUndefined();
    for (const entry of ["content", "seo", "analytics", "content/catalog", "search"]) {
      expect(config.exports[`./${entry}`]).toBeDefined();
    }
  });

  it("core never imports app internals", () => {
    const violations = files(core).flatMap((file) =>
      imports(file)
        .filter((ref) => relativeTarget(file, ref)?.startsWith(path.join(root, "apps/")))
        .map((ref) => `${file}: ${ref}`),
    );
    expect(violations).toEqual([]);
  });

  it("pure entries never reach storage or Node builtins", () => {
    const seen = new Set<string>();
    const violations: string[] = [];
    function visit(file: string) {
      if (seen.has(file)) return;
      seen.add(file);
      for (const ref of imports(file)) {
        const target = relativeTarget(file, ref);
        if (builtins.has(ref) || target?.startsWith(path.join(core, "storage/")))
          violations.push(`${file}: ${ref}`);
        if (target && /\.(ts|tsx|mjs)$/.test(target)) visit(target);
      }
    }
    for (const name of ["content", "seo", "analytics", "content/catalog", "search"]) {
      const entry = path.join(core, name, "index.ts");
      expect(existsSync(entry), `${name} entry must exist`).toBe(true);
      visit(entry);
    }
    expect(violations).toEqual([]);
  });
});
