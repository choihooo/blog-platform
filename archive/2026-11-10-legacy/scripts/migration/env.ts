import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnvLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const index = trimmed.indexOf("=");
  if (index < 0) return;
  const key = trimmed.slice(0, index).trim();
  const rawValue = trimmed.slice(index + 1).trim();
  if (!key || process.env[key] !== undefined) return;
  const quoted =
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"));
  process.env[key] = quoted ? rawValue.slice(1, -1) : rawValue;
}

for (const filename of [
  "scripts/migration/.env.local",
  "scripts/migration/.env",
  ".env.local",
  ".env",
]) {
  const filepath = resolve(process.cwd(), filename);
  if (!existsSync(filepath)) continue;
  for (const line of readFileSync(filepath, "utf8").split(/\r?\n/)) {
    parseEnvLine(line);
  }
}
