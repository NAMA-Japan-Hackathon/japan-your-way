import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3333",
    timezoneId: "Asia/Tokyo",
    locale: "en-US",
    colorScheme: "dark",
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/static-server.mjs --port 3333",
    url: "http://127.0.0.1:3333",
    reuseExistingServer: true,
    timeout: 15000,
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        viewport: { width: 390, height: 844 },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
