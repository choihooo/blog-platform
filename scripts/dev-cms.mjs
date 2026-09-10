import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { request } from "node:http";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const workerDevVarsPath = `${root}/apps/rag-worker/.dev.vars`;
const workerPort = 8787;

function readDevVar(name) {
  const line = readFileSync(workerDevVarsPath, "utf8")
    .split(/\r?\n/)
    .find((value) => value.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim() || "";
}

function waitForWorker() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      const requestForHealth = request(
        { hostname: "127.0.0.1", port: workerPort, path: "/health", method: "GET" },
        (response) => {
          response.resume();
          if (response.statusCode === 200) {
            resolve();
            return;
          }
          retry();
        },
      );
      requestForHealth.on("error", retry);
      requestForHealth.end();
    };
    const retry = () => {
      if (Date.now() - startedAt > 30_000) {
        reject(new Error("Local D1 worker did not become ready within 30 seconds."));
        return;
      }
      setTimeout(check, 500);
    };
    check();
  });
}

const worker = spawn("pnpm", ["--dir", "apps/rag-worker", "dev"], {
  cwd: root,
  stdio: "inherit",
});

try {
  await waitForWorker();
} catch (error) {
  worker.kill("SIGTERM");
  throw error;
}

const cms = spawn("pnpm", ["--filter", "@blog-platform/cms", "dev"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    CLOUDFLARE_D1_PROXY_URL: `http://127.0.0.1:${workerPort}/__local/d1`,
    CLOUDFLARE_D1_PROXY_TOKEN: readDevVar("RAG_ADMIN_TOKEN"),
  },
});

function shutdown(signal) {
  cms.kill(signal);
  worker.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

const exitCode = await new Promise((resolve) => {
  cms.on("exit", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
});
shutdown("SIGTERM");
process.exitCode = exitCode;
