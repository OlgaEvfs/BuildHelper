const { test, expect } = require('@playwright/test');

test('Главная страница должна загружаться', async ({ page }) => {
  // Переходим на главную страницу (baseURL настроен в playwright.config.js как http://localhost:3000)
  await page.goto('/');

  // Проверяем, что заголовок страницы содержит ожидаемый текст
  // Замените 'BuildHelper' на реальный заголовок, если он другой
  await expect(page).toHaveTitle(/BuildHelper/);
});
