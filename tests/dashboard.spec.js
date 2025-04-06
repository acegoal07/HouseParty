import { test, expect } from '@playwright/test';

const basePath = `http://127.0.0.1:3000/dashboard.html`;

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

   test('should be sent back to the home page if cookies are not set', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      expect(page.url()).toBe("http://127.0.0.1:3000/");
   });
});