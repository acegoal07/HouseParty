import { test, expect } from '@playwright/test';

const basePath = `http://127.0.0.1:3000/loginerror.html?error=`;

test.describe('House Party Dashboard Page', () => {
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

   test('should display general error message', async ({ page }) => {
      await page.goto(basePath + '1', { waitUntil: 'load' });
      const errorMessage = await page.locator('div#main-error').getAttribute('class');
      expect(errorMessage).toBe("");
   });

   test('should display in development error', async ({ page }) => {
      await page.goto(basePath + '2', { waitUntil: 'load' });
      const errorMessage = await page.locator('div#development-error').getAttribute('class');
      expect(errorMessage).toBe("");
   });

   test('should display not a premium account error', async ({ page }) => {
      await page.goto(basePath + '3', { waitUntil: 'load' });
      const errorMessage = await page.locator('div#premium-account-error').getAttribute('class');
      expect(errorMessage).toBe("");
   });

   test('should display spotify api rate limit exceeded error', async ({ page }) => {
      await page.goto(basePath + '4', { waitUntil: 'load' });
      const errorMessage = await page.locator('div#request-limit-error').getAttribute('class');
      expect(errorMessage).toBe("");
   });

   test('go back should redirect to the home page', async ({ page }) => {
      await page.goto(basePath + '1', { waitUntil: 'load' });
      const goBackButton = page.locator('a:has-text("Go Back")');
      await goBackButton.click();
      await page.waitForTimeout(500);
      expect(page.url()).toBe("http://127.0.0.1:3000/");
   });

   test('should be sent back to the home page if error is not selected', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      expect(page.url()).toBe("http://127.0.0.1:3000/");
   });
});