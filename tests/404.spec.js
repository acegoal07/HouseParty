import { test, expect } from '@playwright/test';

const basePath = `http://127.0.0.1:3000/404.html`;

test.describe('House Party 404 Page', () => {
   test.beforeEach(async ({ page, context }) => {
      await context.clearCookies();
      await page.route('https://www.google.com/recaptcha/**', route => {
         route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: 'window.grecaptcha = { execute: () => Promise.resolve("mock-token") };'
         });
      });
      page.on('console', msg => console.log(msg.text()));
   });

   test('go back should redirect to the home page', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const goBackButton = page.locator('a:has-text("Go Back")');
      await goBackButton.click();
      await page.waitForTimeout(500);
      expect(page.url()).toBe("http://127.0.0.1:3000/");
   });
});