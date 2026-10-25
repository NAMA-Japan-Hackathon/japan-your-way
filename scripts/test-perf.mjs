import { chromium } from "@playwright/test";
import { createStaticServer } from "./static-server.mjs";

const MAX_LOAD_MS = 4000;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10MB budget for rich media export
const MAX_DOM_NODES = 6000;

const routes = [
  "/",
  "/metro/",
  "/explore/",
  "/plan/",
  "/reviews/",
  "/saved/",
  "/trips/",
  "/trips/a-family-route/",
  "/credits/",
  "/help/",
  "/how-it-works/",
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function runPerfTests() {
  console.log("Running Performance & Payload Audit across core routes...\n");

  const { server, listen, close } = createStaticServer({ port: 0 });
  const { port } = await listen();
  const baseUrl = `http://127.0.0.1:${port}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    try {
      browser = await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      console.warn("Playwright browser not available. Skipping perf tests.");
      await close();
      return { skipped: true, results: [] };
    }
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  const results = [];
  let hasFailure = false;

  console.log("=".repeat(88));
  console.log(
    "ROUTE".padEnd(26) +
      "LOAD TIME".padEnd(14) +
      "REQUESTS".padEnd(12) +
      "TOTAL SIZE".padEnd(16) +
      "DOM NODES".padEnd(12) +
      "RESULT"
  );
  console.log("=".repeat(88));

  for (const route of routes) {
    let totalBytes = 0;
    let requestCount = 0;

    const onResponse = async (res) => {
      requestCount++;
      try {
        const buf = await res.body();
        totalBytes += buf.length;
      } catch {
        // Ignored for non-buffered streams
      }
    };

    page.on("response", onResponse);

    const startTime = Date.now();
    await page.goto(`${baseUrl}${route}`, { waitUntil: "load" });
    const loadTimeMs = Date.now() - startTime;

    const domNodes = await page.evaluate(
      () => document.querySelectorAll("*").length
    );

    page.off("response", onResponse);

    const isSlow = loadTimeMs > MAX_LOAD_MS;
    const isHeavy = totalBytes > MAX_TOTAL_BYTES;
    const isComplex = domNodes > MAX_DOM_NODES;

    const status = isSlow || isHeavy || isComplex ? "FAIL" : "PASS";
    if (status === "FAIL") hasFailure = true;

    const notes = [];
    if (isSlow) notes.push(`Slow (${loadTimeMs}ms)`);
    if (isHeavy) notes.push(`Heavy (${formatBytes(totalBytes)})`);
    if (isComplex) notes.push(`DOM bloated (${domNodes} nodes)`);

    results.push({
      route,
      loadTimeMs,
      requestCount,
      totalBytes,
      domNodes,
      status,
      notes: notes.join(", "),
    });

    console.log(
      route.padEnd(26) +
        `${loadTimeMs}ms`.padEnd(14) +
        `${requestCount}`.padEnd(12) +
        formatBytes(totalBytes).padEnd(16) +
        `${domNodes}`.padEnd(12) +
        (status === "PASS" ? "✔ PASS" : `✖ FAIL (${notes.join(", ")})`)
    );
  }

  console.log("=".repeat(88));
  console.log(
    `\nSummary: ${results.length} routes audited. ${
      hasFailure ? "✖ Performance budget breached." : "✔ All routes within performance budgets."
    }\n`
  );

  await browser.close();
  await close();

  if (hasFailure) {
    process.exitCode = 1;
  }
  return { skipped: false, results };
}

if (process.argv[1].endsWith("test-perf.mjs")) {
  runPerfTests().catch((err) => {
    console.error("Perf test error:", err);
    process.exit(1);
  });
}
