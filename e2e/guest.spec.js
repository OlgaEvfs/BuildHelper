const { test, expect } = require('@playwright/test');

test.describe('Guest Scenarios', () => {

  test('Visitor can view news', async ({ page }) => {
    await page.goto('/news.html');
    // Verify existence of header
    await expect(page.locator('h1')).toBeVisible();
    // Verify existence of news cards
    await expect(page.locator('.news-card').first()).toBeVisible();
  });

  test('Visitor can open news detail page', async ({ page }) => {
    await page.goto('/news.html');
    // Click on the first news item
    await page.locator('.news-card a').first().click();
    // Verify navigation
    await expect(page).toHaveURL(/.*news-detail\.html/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Visitor can use calculator', async ({ page }) => {
    await page.goto('/index.html');
    
    // Click on tiles calculator card to open modal
    await page.click('.calc-card[data-calc="tiles"]');
    
    // Wait for modal appearance
    await expect(page.locator('#calcModal')).toBeVisible();
    
    // Input data into calculator
    await page.fill('#tile-area', '5');
    await page.fill('#tile-w', '300');
    await page.fill('#tile-h', '300');
    
    // Click "Calculate" inside modal
    await page.click('#calcModalBody button:has-text("Рассчитать")');
    
    // Verify result
    await expect(page.locator('#tiles-result')).toBeVisible();
    await expect(page.locator('#tiles-result')).toContainText('Необходимо плиток');
  });

  test('Visitor can mark a task in the checklist', async ({ page }) => {
    await page.goto('/index.html#checklist');
    
    // Find checkbox
    const checkbox = page.locator('input[data-id="1"]');
    
    // Click label text instead of checkbox directly to avoid visibility issues
    await page.click('text="Замеры и план"');
    
    // Verify checkbox is checked
    await expect(checkbox).toBeChecked();
    
    // Verify progress update
    await expect(page.locator('#progress-percent')).not.toHaveText('0%');
  });

});
