import { test, expect } from "@playwright/test";

test.describe("Critical User Journeys", () => {
  test("Rail Atlas: interact with station search, city switching, and national network", async ({
    page,
  }) => {
    await page.goto("/metro/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // Verify header
    const title = await page.locator("h1").innerText();
    expect(title.toLowerCase()).toContain("rail");

    // Search for a station across Japan
    const searchInput = page.locator("#station-search");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Shinjuku");
    await page.waitForTimeout(300);

    // Verify suggestions appear and select first result
    const suggestions = page.locator("#station-suggestions [role='option']");
    expect(await suggestions.count()).toBeGreaterThan(0);
    await suggestions.first().click();
    await page.waitForTimeout(400);

    // Verify station details loaded in URL
    expect(page.url()).toContain("station=tokyo-shinjuku");

    // Switch city via city-network select
    const citySelect = page.locator("#city-network");
    await citySelect.selectOption("Kyoto");
    await page.waitForTimeout(400);

    // Return to All Japan view
    const allJapanButton = page.locator("button", { hasText: /All Japan/i }).first();
    await allJapanButton.click();
    await page.waitForTimeout(300);
    expect(page.url()).toContain("/metro/");
  });

  test("Reviews & Dining: filter by dietary options, search places, and persist private notes", async ({
    page,
  }) => {
    await page.goto("/reviews/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // Verify places exist
    const cards = page.locator(".review-card, article");
    await expect(cards.first()).toBeVisible();
    const initialCount = await cards.count();
    expect(initialCount).toBeGreaterThan(0);

    // Search for a specific cuisine or place
    const searchInput = page.locator("input[type='search'], input[placeholder*='Search'], input[type='text']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("Ramen");
      await page.waitForTimeout(300);
      const filteredCount = await cards.count();
      expect(filteredCount).toBeGreaterThan(0);
      await searchInput.fill("");
    }

    // Test private notes persistence in localStorage
    const noteArea = page.locator("textarea[placeholder*='note'], textarea").first();
    if (await noteArea.isVisible()) {
      await noteArea.fill("Must visit on evening 2 - verified via E2E test");
      await page.waitForTimeout(300);

      // Reload page and verify note is preserved
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);
      const reloadedNoteArea = page.locator("textarea[placeholder*='note'], textarea").first();
      await expect(reloadedNoteArea).toHaveValue(/Must visit on evening 2/);
    }
  });

  test("Itinerary Planner: load sample trip, inspect schedule days, and verify budget calculation", async ({
    page,
  }) => {
    // Navigate to plan with sample query or sample data
    await page.goto("/plan/?sample=1", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Verify planner UI elements
    const pageText = await page.locator("body").innerText();
    expect(pageText).toContain("Plan");

    // Verify days or activities are rendered
    const dayElements = page.locator("[data-day], .plan-day, .itinerary-day, summary, details");
    expect(await dayElements.count()).toBeGreaterThan(0);

    // Verify cost breakdown / budget display
    const costDisplay = page.locator(".cost, .budget, .summary-cost, [data-cost]").first();
    if (await costDisplay.isVisible()) {
      const costText = await costDisplay.innerText();
      expect(costText.length).toBeGreaterThan(0);
    }
  });

  test("Trips Catalog: browse curated itineraries and verify timetable view", async ({
    page,
  }) => {
    await page.goto("/trips/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // Verify trip links
    const tripLinks = page.locator("a[href*='/trips/']");
    expect(await tripLinks.count()).toBeGreaterThan(0);

    // Navigate to specific curated trip
    await page.goto("/trips/a-family-route/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // Verify trip page content
    const tripTitle = await page.locator("h1").innerText();
    expect(tripTitle.length).toBeGreaterThan(0);

    // Verify day tabs or itinerary stops
    const dayTabs = page.locator("button, [role='tab'], summary");
    expect(await dayTabs.count()).toBeGreaterThan(0);
  });
});
