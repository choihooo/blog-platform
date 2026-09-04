import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { projects } from "../../apps/blog/features/projects/project-data";

const outputPath = resolve(process.argv[2] ?? "tmp/pdfs/project-portfolio-data.json");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(projects, null, 2)}\n`, "utf8");

console.log(`Exported ${projects.length} projects to ${outputPath}`);
