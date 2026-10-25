import { test, expect } from "@playwright/test";

test.describe("Visual Regression (Local Baselines)", () => {
  const routes = [
    { name: "home", path: "/" },
    { name: "metro", path: "/metro/" },
    { name: "explore", path: "/explore/" },
    { name: "plan", path: "/plan/" },
    { name: "reviews", path: "/reviews/" },
    { name: "trips", path: "/trips/" },
  ];

  for (const { name, path } of routes) {
    test(`Visual capture for ${name} (${path})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(600);

      // Verify page element rendered before snapshot
      await expect(page.locator("body")).toBeVisible();

      // Snapshot comparison
      await expect(page).toHaveScreenshot(`${name}.png`, {
        maxDiffPixelRatio: 0.08,
      });
    });
  }
});
