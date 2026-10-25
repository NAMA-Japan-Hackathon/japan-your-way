import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportsDir = path.join(root, "reports");
const reportFile = path.join(reportsDir, "TEST_REPORT.md");

const suites = [
  {
    id: "export",
    name: "Fresh Production Build and Static Test Export",
    command: "npm run export:static -- --build",
    browser: false,
  },
  {
    id: "check",
    name: "Static Checks (TypeCheck, Unit Tests, Data Validation)",
    command: "npm run check",
    browser: false,
  },
  {
    id: "links",
    name: "Link, Anchor & Asset Crawler",
    command: "npm run check:links",
    browser: false,
  },
  {
    id: "buttons",
    name: "Interactive Element & Hit-Test Matrix",
    command: "npm run check:buttons",
    browser: true,
  },
  {
    id: "e2e",
    name: "End-to-End Suite (Smoke, A11y, Journeys)",
    command: "npm run test:e2e",
    browser: true,
  },
  {
    id: "perf",
    name: "Performance & Payload Budgets",
    command: "npm run test:perf",
    browser: true,
  },
];

async function main() {
  console.log("========================================================");
  console.log("  JAPAN, YOUR WAY — COMPREHENSIVE TEST & QUALITY RUN");
  console.log("========================================================\n");

  fs.mkdirSync(reportsDir, { recursive: true });

  const startTime = Date.now();
  const results = [];
  let overallSuccess = true;

  for (const suite of suites) {
    console.log(`\n▶ [START] ${suite.name}...`);
    const suiteStart = Date.now();
    let status = "PASSED";
    let output = "";
    try {
      output = execSync(suite.command, {
        cwd: root,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      console.log(`✔ [PASS] ${suite.name} (${((Date.now() - suiteStart) / 1000).toFixed(1)}s)`);
    } catch (err) {
      status = "FAILED";
      overallSuccess = false;
      output = `${err.stdout || ""}\n${err.stderr || ""}\n${err.message || ""}`;
      console.error(`✖ [FAIL] ${suite.name} (${((Date.now() - suiteStart) / 1000).toFixed(1)}s)`);
    }

    results.push({
      ...suite,
      status,
      durationSec: ((Date.now() - suiteStart) / 1000).toFixed(1),
      output,
    });
  }

  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // Generate Markdown report
  const now = new Date().toISOString();
  let markdown = `# Test & Quality Report — Japan, Your Way\n\n`;
  markdown += `**Run Timestamp:** ${now}  \n`;
  markdown += `**Overall Status:** ${overallSuccess ? "✅ ALL CHECKS PASSED" : "❌ SOME CHECKS FAILED"}  \n`;
  markdown += `**Total Duration:** ${totalTimeSec} seconds  \n`;
  markdown += `**Environment:** Node ${process.version} · ${process.platform} (${process.arch}) · Asia/Tokyo  \n\n`;

  markdown += `## Executive Summary\n\n`;
  markdown += `| Test Suite | Command | Duration | Status |\n`;
  markdown += `|---|---|---|---|\n`;
  for (const r of results) {
    const badge = r.status === "PASSED" ? "✅ PASSED" : "❌ FAILED";
    markdown += `| **${r.name}** | \`${r.command}\` | ${r.durationSec}s | ${badge} |\n`;
  }
  markdown += `\n---\n\n`;

  markdown += `## Suite Details\n\n`;
  for (const r of results) {
    markdown += `### ${r.name} (\`${r.command}\`)\n\n`;
    markdown += `**Status:** ${r.status} (${r.durationSec}s)  \n\n`;
    markdown += `\`\`\`text\n${r.output.trim()}\n\`\`\`\n\n`;
  }

  fs.writeFileSync(reportFile, markdown, "utf-8");
  console.log(`\nReport written to: ${reportFile}`);
  console.log("========================================================");
  console.log(overallSuccess ? "  RESULT: ALL SUITES PASSED" : "  RESULT: SOME SUITES FAILED");
  console.log("========================================================\n");

  if (!overallSuccess) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
