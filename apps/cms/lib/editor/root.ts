import path from "node:path";

export function repositoryRoot(cwd = process.cwd()) {
  return cwd.endsWith(path.join("apps", "cms")) ? path.resolve(cwd, "../..") : cwd;
}
