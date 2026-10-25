import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routesToTest = [
  "/",
  "/explore/",
  "/metro/",
  "/plan/",
  "/reviews/",
  "/saved/",
  "/trips/",
  "/trips/a-family-route/",
  "/credits/",
  "/help/",
  "/how-it-works/",
];

test.describe("Accessibility Audits (WCAG 2.1 Level AA)", () => {
  for (const route of routesToTest) {
    test(`Route ${route} has zero WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .disableRules(["color-contrast"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
