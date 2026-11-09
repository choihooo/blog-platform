import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

function violations(files: Map<string, string>) {
  const errors: string[] = [];
  for (const [file, text] of files) {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    for (const node of source.statements) {
      if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
      const clause = node.importClause;
      if (clause?.isTypeOnly) continue;
      const bindings = clause?.namedBindings;
      if (
        !clause?.name &&
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.every((element) => element.isTypeOnly)
      )
        continue;
      const specifier = node.moduleSpecifier.text;
      if (!specifier.startsWith(".")) continue;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      if (file === "index.ts" && !target.startsWith("handlers/") && target !== "http/response")
        errors.push(`${file} -> ${target}`);
      if (
        file.startsWith("services/") &&
        (target.startsWith("http/") || target.startsWith("handlers/"))
      )
        errors.push(`${file} -> ${target}`);
      if (
        file.startsWith("providers/") &&
        (target.startsWith("handlers/") || target.startsWith("services/"))
      )
        errors.push(`${file} -> ${target}`);
    }
  }
  return errors.sort();
}

it("allows DTO type imports and rejects reversed service and transport dependencies", () => {
  expect(
    violations(
      new Map([
        [
          "services/answer.ts",
          'import type {DTO} from "../http/types"; import {json} from "../http/response";',
        ],
        ["providers/gemini-http.ts", 'import {answer} from "../services/answer";'],
      ]),
    ),
  ).toEqual(["providers/gemini-http.ts -> services/answer", "services/answer.ts -> http/response"]);
});

it("keeps dispatch, workflows and providers in one direction", () => {
  const files = new Map<string, string>();
  const root = path.resolve("src");
  function collect(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "test-utils") continue;
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) collect(file);
      else if (file.endsWith(".ts") && !file.endsWith(".test.ts") && !file.endsWith(".d.ts"))
        files.set(path.relative(root, file).split(path.sep).join("/"), readFileSync(file, "utf8"));
    }
  }
  collect(root);
  expect(violations(files)).toEqual([]);
});
