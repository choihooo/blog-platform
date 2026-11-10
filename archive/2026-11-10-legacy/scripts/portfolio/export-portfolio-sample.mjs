import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "output/pdf/choiho-portfolio-cover-ai-workflow-sample.pdf");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 3017;
const url = `http://127.0.0.1:${port}/portfolio/print`;

await mkdir(resolve(root, "output/pdf"), { recursive: true });

const server = spawn("pnpm", ["--filter", "@blog-platform/blog", "dev", "--port", String(port)], {
  cwd: root,
  detached: true,
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
  }
  throw new Error(`Portfolio preview server did not start.\n${serverOutput}`);
}

try {
  await waitForServer();
  const chromeProcess = spawn(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-pdf-header-footer",
      "--run-all-compositor-stages-before-draw",
      "--virtual-time-budget=3000",
      `--print-to-pdf=${output}`,
      url,
    ],
    { cwd: root, stdio: "inherit" },
  );
  const exitCode = await new Promise((resolveExit) => chromeProcess.on("exit", resolveExit));
  if (exitCode !== 0) throw new Error(`Chrome PDF export failed with exit code ${exitCode}`);
  console.log(output);
} finally {
  if (server.pid) process.kill(-server.pid, "SIGTERM");
}
