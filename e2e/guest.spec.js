const { test, expect } = require('@playwright/test');

test.describe('Гостевые сценарии', () => {

  test('Посетитель может просматривать новости', async ({ page }) => {
    await page.goto('/news.html');
    // Проверяем наличие заголовка
    await expect(page.locator('h1')).toBeVisible();
    // Проверяем наличие карточек новостей (в news.html используется класс .news-card)
    await expect(page.locator('.news-card').first()).toBeVisible();
  });

  test('Посетитель может открыть детальную страницу новости', async ({ page }) => {
    await page.goto('/news.html');
    // Кликаем по первой новости
    await page.locator('.news-card a').first().click();
    // Проверяем переход
    await expect(page).toHaveURL(/.*news-detail\.html/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Посетитель может использовать калькулятор', async ({ page }) => {
    await page.goto('/index.html');
    
    // Кликаем по карточке калькулятора плитки, чтобы открыть модальное окно
    await page.click('.calc-card[data-calc="tiles"]');
    
    // Ждем появления модального окна
    await expect(page.locator('#calcModal')).toBeVisible();
    
    // Ввод данных в калькулятор (IDs из calculators.js)
    await page.fill('#tile-area', '5');
    await page.fill('#tile-w', '300');
    await page.fill('#tile-h', '300');
    
    // Кликаем "Рассчитать" внутри модалки
    await page.click('#calcModalBody button:has-text("Рассчитать")');
    
    // Проверка результата
    await expect(page.locator('#tiles-result')).toBeVisible();
    await expect(page.locator('#tiles-result')).toContainText('Необходимо плиток');
  });

  test('Посетитель может отметить задачу в чек-листе', async ({ page }) => {
    await page.goto('/index.html#checklist');
    
    // Находим чекбокс
    const checkbox = page.locator('input[data-id="1"]');
    
    // Вместо прямого check() кликаем по тексту рядом, так как инпут может быть скрыт
    // Или используем click() по самому чекбоксу с force: true
    await page.click('text="Замеры и план"');
    
    // Проверяем, что он отмечен
    await expect(checkbox).toBeChecked();
    
    // Проверяем, что прогресс обновился
    await expect(page.locator('#progress-percent')).not.toHaveText('0%');
  });

});
