import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const nextDir = path.join(root, ".next");
const serverAppDir = path.join(nextDir, "server", "app");
const staticDir = path.join(nextDir, "static");
const publicDir = path.join(root, "public");

export function exportStatic({ forceBuild = false } = {}) {
  const needsBuild = forceBuild || !fs.existsSync(serverAppDir);
  if (needsBuild) {
    console.log("Running production next build...");
    execSync("npx next build", { cwd: root, stdio: "inherit" });
  }

  console.log("Exporting static files to out/...");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Copy public directory contents
  function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyDir(publicDir, outDir);

  // 2. Copy .next/static to out/_next/static
  copyDir(staticDir, path.join(outDir, "_next", "static"));

  // 3. Copy prerendered HTML pages
  function copyPages(dir, relPath = "") {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const srcFile = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "api") continue; // Server-only API routes
        copyPages(srcFile, path.join(relPath, entry.name));
      } else if (entry.name.endsWith(".html")) {
        const pageName = entry.name.replace(/\.html$/, "");
        if (pageName === "index" && !relPath) {
          fs.copyFileSync(srcFile, path.join(outDir, "index.html"));
        } else if (pageName === "_not-found" || pageName === "404") {
          fs.copyFileSync(srcFile, path.join(outDir, "404.html"));
          const notFoundDir = path.join(outDir, "_not-found");
          fs.mkdirSync(notFoundDir, { recursive: true });
          fs.copyFileSync(srcFile, path.join(notFoundDir, "index.html"));
        } else if (pageName === "_global-error") {
          // Internal error page
        } else {
          const targetDir = path.join(outDir, relPath, pageName);
          fs.mkdirSync(targetDir, { recursive: true });
          fs.copyFileSync(srcFile, path.join(targetDir, "index.html"));
        }
      }
    }
  }

  copyPages(serverAppDir);
  console.log("Static export ready in out/");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  exportStatic({ forceBuild: process.argv.includes("--build") });
}
