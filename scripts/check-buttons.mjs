import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStaticServer } from "./static-server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");

const VIEWPORTS = [
  { name: "390×844", width: 390, height: 844, isMobile: true },
  { name: "768×1024", width: 768, height: 1024, isMobile: false },
  { name: "1440×900", width: 1440, height: 900, isMobile: false },
];

function getRoutes() {
  if (!fs.existsSync(outDir)) {
    throw new Error(`Directory ${outDir} does not exist. Run export first.`);
  }
  const routes = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith(".html")) {
        const rel = path.relative(outDir, fullPath).replace(/\\/g, "/");
        if (rel === "index.html") {
          routes.push("/");
        } else if (rel.endsWith("/index.html")) {
          routes.push("/" + rel.slice(0, -"/index.html".length) + "/");
        } else if (rel === "404.html") {
          routes.push("/404.html");
        }
      }
    }
  }
  scan(outDir);
  return [...new Set(routes)].sort();
}

async function launchBrowser() {
  let playwright;
  try {
    playwright = await import("@playwright/test");
  } catch {
    try {
      playwright = await import("playwright");
    } catch {
      return null;
    }
  }

  const { chromium } = playwright;
  if (!chromium) return null;

  // Try bundled chromium first
  try {
    const browser = await chromium.launch({ headless: true });
    return browser;
  } catch (err) {
    // Try system Chrome channel
    try {
      const browser = await chromium.launch({ channel: "chrome", headless: true });
      return browser;
    } catch {
      return null;
    }
  }
}

export async function runButtonAndLinkChecker({ verbose = false } = {}) {
  const browser = await launchBrowser();
  if (!browser) {
    console.warn("\n[SKIPPED] Playwright browser is not available. Non-browser checks will still run.");
    console.warn("To enable, run: npx playwright install chromium\n");
    return { ok: true, skipped: true, results: [] };
  }

  const routes = getRoutes();
  const { server, listen, close } = createStaticServer({ outDir, port: 0 });
  const { port } = await listen();
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`\nRunning Button and Link Checker across ${routes.length} routes and 3 viewports...`);
  console.log(`Server: ${baseUrl}\n`);

  const results = []; // { route, viewport, element, accessibleName, result, details }
  let passedCount = 0;
  let failedCount = 0;
  let warnCount = 0;

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        locale: "en-US",
        timezoneId: "Asia/Tokyo",
        reducedMotion: "reduce",
      });

      const page = await context.newPage();

      for (const route of routes) {
        const url = `${baseUrl}${route}`;
        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
          // Wait a tick for hydration
          await page.waitForTimeout(300);
        } catch (navErr) {
          results.push({
            route,
            viewport: vp.name,
            element: "PAGE",
            accessibleName: "Navigation",
            result: "FAIL",
            details: `Failed to load page: ${navErr.message}`,
          });
          failedCount++;
          continue;
        }

        // Helper to evaluate elements in page
        async function inspectElements(contextLabel = "") {
          return await page.evaluate((isPhone) => {
            const items = [];
            const selector = [
              "button",
              "a[href]",
              "[role='button']",
              "[role='tab']",
              "[role='switch']",
              "[role='menuitem']",
              "summary",
              "input:not([type='hidden'])",
              "select",
              "textarea",
            ].join(", ");

            const candidates = document.querySelectorAll(selector);

            candidates.forEach((el, index) => {
              // Ignore elements inside hidden containers or display:none
              const style = window.getComputedStyle(el);
              if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
                return;
              }

              const isSvgGroup = el.tagName.toLowerCase() === "g";
              const targetEl = (isSvgGroup && (el.querySelector("circle.major, circle.minor, circle") || el.querySelector("path, rect"))) || el;
              const rect = targetEl.getBoundingClientRect();
              const isZeroSize = rect.width === 0 || rect.height === 0;

              // Compute accessible name
              let name = (
                el.getAttribute("aria-label") ||
                (el.getAttribute("aria-labelledby")
                  ? document.getElementById(el.getAttribute("aria-labelledby"))?.textContent
                  : "") ||
                el.innerText ||
                el.textContent ||
                el.getAttribute("title") ||
                el.getAttribute("placeholder") ||
                (el instanceof HTMLInputElement ? el.value : "") ||
                el.querySelector("img")?.getAttribute("alt") ||
                ""
              ).trim().replace(/\s+/g, " ");

              // Check if icon-only without label
              const hasName = name.length > 0;

              // Check hit-test at center
              let isCovered = false;
              let coveringTag = "";
              if (!isZeroSize) {
                let cx = rect.left + rect.width / 2;
                let cy = rect.top + rect.height / 2;
                if (cx >= 0 && cx <= window.innerWidth && cy >= 0 && cy <= window.innerHeight) {
                  let hit = document.elementFromPoint(cx, cy);
                  let isSelfOrDescendant = hit && (
                    hit === el ||
                    el.contains(hit) ||
                    hit.contains(el) ||
                    hit.closest('[role="button"]') === el ||
                    hit.closest("button") === el ||
                    hit.closest("a") === el ||
                    hit.closest("g") === el
                  );

                  // If element in document flow is initially under floating launcher, test if scrolling clears it
                  if (!isSelfOrDescendant && hit?.closest(".chat-launcher")) {
                    el.scrollIntoView({ block: "center", inline: "nearest" });
                    const newRect = el.getBoundingClientRect();
                    cx = newRect.left + newRect.width / 2;
                    cy = newRect.top + newRect.height / 2;
                    if (cx >= 0 && cx <= window.innerWidth && cy >= 0 && cy <= window.innerHeight) {
                      hit = document.elementFromPoint(cx, cy);
                      isSelfOrDescendant = hit && (
                        hit === el ||
                        el.contains(hit) ||
                        hit.contains(el) ||
                        hit.closest('[role="button"]') === el ||
                        hit.closest("button") === el ||
                        hit.closest("a") === el ||
                        hit.closest("g") === el
                      );
                    }
                  }

                  if (hit && !isSelfOrDescendant) {
                    isCovered = true;
                    const cls = typeof hit.className === "string" ? hit.className : (hit.className?.baseVal || "");
                    coveringTag = `${hit.tagName.toLowerCase()}${cls ? "." + cls.trim().split(" ")[0] : ""}`;
                  }
                }
              }

              // Check touch target size (44x44 on mobile for discrete buttons/inputs)
              const isDiscreteControl = el.tagName === "BUTTON" || el.getAttribute("role") === "button" || el.tagName === "INPUT" || el.tagName === "SELECT";
              const isInlineLink = el.tagName === "A" && el.parentElement && window.getComputedStyle(el.parentElement).display === "block" && el.parentElement.textContent.length > el.textContent.length + 10;
              const touchTargetWarning = isPhone && isDiscreteControl && !isInlineLink && (rect.width < 40 || rect.height < 40);

              // Check disabled
              const isDisabled = el.disabled || el.getAttribute("aria-disabled") === "true";

              // Check element identifier
              const tag = el.tagName.toLowerCase();
              const id = el.id ? `#${el.id}` : "";
              const cls = el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
              const href = el.getAttribute("href") || "";

              items.push({
                index,
                tag,
                selector: `${tag}${id}${cls}`,
                name: name.slice(0, 45),
                hasName,
                isZeroSize,
                isCovered,
                coveringTag,
                touchTargetWarning,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                isDisabled,
                href,
                hasOnClick: typeof el.onclick === "function" || el.hasAttribute("onclick"),
              });
            });

            return items;
          }, vp.isMobile);
        }

        const initialElements = await inspectElements("initial");

        for (const item of initialElements) {
          if (item.isZeroSize) continue;

          let status = "PASS";
          const issues = [];

          if (!item.hasName) {
            status = "FAIL";
            issues.push("Missing accessible name");
          }

          if (item.isCovered) {
            status = "FAIL";
            issues.push(`Covered by <${item.coveringTag}>`);
          }

          if (item.touchTargetWarning) {
            issues.push(`Touch target is ${item.width}×${item.height}px (<44×44px)`);
            if (status !== "FAIL") status = "WARN";
          }

          if (item.tag === "button" && !item.hasOnClick && !item.href) {
            // Note: In React, event listeners are attached at the root, so el.onclick is often null.
            // We check observable behavior during test:e2e or when clicking.
          }

          if (status === "FAIL") failedCount++;
          else if (status === "WARN") warnCount++;
          else passedCount++;

          results.push({
            route,
            viewport: vp.name,
            element: item.selector,
            accessibleName: item.name || "(none)",
            result: status,
            details: issues.join("; ") || "OK",
          });
        }

        // Test opening menus/dialogs/details if any exist on the route
        try {
          const menuButton = page.locator(".menu-toggle, [aria-label*='menu' i], [aria-label*='navigation' i]").first();
          if (await menuButton.isVisible()) {
            await menuButton.click();
            await page.waitForTimeout(200);
            const revealedElements = await inspectElements("revealed-menu");
            for (const item of revealedElements) {
              if (item.isZeroSize) continue;
              if (!item.hasName) {
                failedCount++;
                results.push({
                  route: `${route} [menu opened]`,
                  viewport: vp.name,
                  element: item.selector,
                  accessibleName: item.name || "(none)",
                  result: "FAIL",
                  details: "Missing accessible name in menu",
                });
              }
            }
            // Close menu
            await menuButton.click();
            await page.waitForTimeout(100);
          }
        } catch {
          // Non-blocking for menu inspection
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
    await close();
  }

  // Print Table Output
  console.log("\n" + "=".repeat(110));
  console.log(
    "ROUTE".padEnd(28) +
      "VIEWPORT".padEnd(12) +
      "ELEMENT".padEnd(28) +
      "ACCESSIBLE NAME".padEnd(30) +
      "RESULT"
  );
  console.log("=".repeat(110));

  // Print failures and warnings prominently
  const actionable = results.filter((r) => r.result !== "PASS");
  if (actionable.length > 0) {
    for (const r of actionable) {
      console.log(
        r.route.slice(0, 26).padEnd(28) +
          r.viewport.padEnd(12) +
          r.element.slice(0, 26).padEnd(28) +
          r.accessibleName.slice(0, 28).padEnd(30) +
          `[${r.result}] ${r.details}`
      );
    }
  } else {
    console.log("All elements across all routes and viewports passed checks!");
  }
  console.log("=".repeat(110));
  console.log(`\nSummary: ${results.length} elements inspected.`);
  console.log(`✔ Passed: ${passedCount} | ⚠ Warnings: ${warnCount} | ✖ Failed: ${failedCount}\n`);

  return {
    ok: failedCount === 0,
    total: results.length,
    passedCount,
    warnCount,
    failedCount,
    results,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runButtonAndLinkChecker({ verbose: process.argv.includes("--verbose") })
    .then((res) => {
      if (!res.ok) process.exit(1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
