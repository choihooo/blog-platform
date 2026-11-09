import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

function valueImports(source: ts.SourceFile) {
  const imports: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const typesOnly =
        clause?.isTypeOnly ||
        (!clause?.name &&
          bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.every((element) => element.isTypeOnly));
      if (!typesOnly) imports.push(node.moduleSpecifier.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const bindings = node.exportClause;
      const typesOnly =
        node.isTypeOnly ||
        (bindings &&
          ts.isNamedExports(bindings) &&
          bindings.elements.every((element) => element.isTypeOnly));
      if (!typesOnly) imports.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      imports.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return imports;
}

function violations(files: Map<string, string>) {
  const parsed = new Map(
    [...files].map(([file, text]) => [
      file,
      ts.createSourceFile(
        file,
        text,
        ts.ScriptTarget.Latest,
        true,
        file.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      ),
    ]),
  );
  const errors = new Set<string>();
  function resolve(file: string, specifier: string) {
    if (!specifier.startsWith(".")) return;
    const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
    return [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(
      (candidate) => files.has(candidate),
    );
  }
  for (const [file, source] of parsed) {
    for (const specifier of valueImports(source)) {
      const target = resolve(file, specifier);
      if (file.startsWith("features/") && target?.startsWith("app/"))
        errors.add(`${file} -> ${target}`);
      if (file.startsWith("features/analytics/") && target?.startsWith("features/editor/"))
        errors.add(`${file} -> ${target}`);
    }
    const first = source.statements[0];
    if (
      !first ||
      !ts.isExpressionStatement(first) ||
      !ts.isStringLiteral(first.expression) ||
      first.expression.text !== "use client"
    )
      continue;
    const visited = new Set<string>();
    function walk(current: string) {
      if (visited.has(current)) return;
      visited.add(current);
      const module = parsed.get(current);
      if (!module) return;
      if (current.includes("/server/")) errors.add(`${file} reaches ${current}`);
      function checkEnvironment(node: ts.Node) {
        if (
          ts.isPropertyAccessExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === "process" &&
          node.name.text === "env"
        )
          errors.add(`${file} reaches process.env in ${current}`);
        ts.forEachChild(node, checkEnvironment);
      }
      checkEnvironment(module);
      for (const specifier of valueImports(module)) {
        if (specifier.startsWith("node:") || specifier === "@blog-platform/core/storage")
          errors.add(`${file} reaches ${specifier}`);
        const target = resolve(current, specifier);
        if (target) walk(target);
      }
    }
    walk(file);
  }
  return [...errors].sort();
}

it("allows DTO type imports but detects transitive browser server dependencies", () => {
  const files = new Map([
    [
      "features/editor/client.ts",
      '"use client"; import {value} from "./barrel"; import type {DTO} from "./server/dto";',
    ],
    ["features/editor/barrel.ts", 'export {value} from "./server/value";'],
    ["features/editor/server/dto.ts", 'import "node:crypto"; export type DTO = string;'],
    [
      "features/editor/server/value.ts",
      'import "node:fs"; export const value = process.env.SECRET;',
    ],
  ]);
  expect(violations(files)).toEqual([
    "features/editor/client.ts reaches features/editor/server/value.ts",
    "features/editor/client.ts reaches node:fs",
    "features/editor/client.ts reaches process.env in features/editor/server/value.ts",
  ]);
  files.set("features/editor/barrel.ts", 'export const value = "safe";');
  expect(violations(files)).toEqual([]);
});

it("keeps feature composition and browser dependencies within their boundaries", () => {
  const files = new Map<string, string>();
  function collect(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (["node_modules", ".next", ".turbo"].includes(entry.name)) continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(file);
      else if (
        /\.tsx?$/.test(file) &&
        !/\.(test|d)\.tsx?$/.test(file) &&
        !file.includes("test-utils/")
      ) {
        files.set(
          path.relative(process.cwd(), file).split(path.sep).join("/"),
          readFileSync(file, "utf8"),
        );
      }
    }
  }
  for (const directory of ["app", "components", "features", "lib", "shared"])
    collect(path.resolve(directory));
  expect(violations(files)).toEqual([]);
});
