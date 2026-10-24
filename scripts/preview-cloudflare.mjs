import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import "./sites-env.mjs";

const root = new URL("../", import.meta.url);
const cli = new URL("node_modules/wrangler/bin/wrangler.js", root);
const localEnv = fileURLToPath(new URL(".env.local", root));
const args = [fileURLToPath(cli), "dev",
  "--config", "dist/server/wrangler.json", "--local",
  "--persist-to", ".wrangler/state", "--ip", "127.0.0.1",
  "--inspector-port", "0", "--port", "5173",
  ...(existsSync(localEnv) ? ["--env-file", localEnv] : []),
];
const child = spawn(process.execPath, args, { stdio: "inherit" });
child.on("error", () => process.exit(1));
child.on("exit", (code) => process.exit(code ?? 1));
