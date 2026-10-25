import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.join(root, "out");

function discoverRoutes() {
  const routes: string[] = ["/"];
  function scan(dir: string, baseRoute: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name === "_next" || entry.name === "images" || entry.name === "media") continue;
        const subDir = path.join(dir, entry.name);
        const subRoute = `${baseRoute}${entry.name}/`;
        if (fs.existsSync(path.join(subDir, "index.html"))) {
          routes.push(subRoute);
        }
        scan(subDir, subRoute);
      }
    }
  }
  scan(outDir, "/");
  return Array.from(new Set(routes)).sort();
}

const routes = discoverRoutes();

test.describe("Console & Runtime Smoke Tests", () => {
  for (const route of routes) {
    test(`Route ${route} loads with 0 console errors and 0 page exceptions`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: Error[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (err) => {
        pageErrors.push(err);
      });

      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect([200, 404]).toContain(response?.status());

      // Wait a moment for dynamic hydration and any client-side initializers
      await page.waitForTimeout(400);

      // Verify page content rendered
      const body = await page.locator("body").innerText();
      expect(body.trim().length).toBeGreaterThan(10);

      // Assert zero page errors or console errors
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }

  test("Non-existent route returns 404 page with 0 errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: Error[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        // Exclude the expected HTTP 404 message for the non-existent document itself
        if (msg.text().includes("404 (Not Found)")) return;
        consoleErrors.push(msg.text());
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(err);
    });

    const response = await page.goto("/route-does-not-exist/", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(404);
    await page.waitForTimeout(400);

    const body = await page.locator("body").innerText();
    expect(body.trim().length).toBeGreaterThan(10);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
