const { test, expect } = require('@playwright/test');

test('Main page should load', async ({ page }) => {
  // Go to the main page (baseURL is configured in playwright.config.js as http://localhost:3000)
  await page.goto('/');

  // Check that the page title contains the expected text
  // Replace 'BuildHelper' with the actual title if it is different
  await expect(page).toHaveTitle(/BuildHelper/);
});
