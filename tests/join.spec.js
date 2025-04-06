import { test, expect } from '@playwright/test';

const basePath = `http://127.0.0.1:3000/join.html`;

test.describe('House Party Join Page', () => {
   test.beforeEach(async ({ page }) => {
      await page.route('https://www.google.com/recaptcha/**', route => {
         route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: 'window.grecaptcha = { execute: () => Promise.resolve("mock-token") };'
         });
      });
      page.on('console', msg => console.log(msg.text()));
   });

   test('should show error message if no room code is provided', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      const joinButton = page.locator('button[type="submit"]');
      await joinButton.click();
      const errorMessage = page.locator('span#no-party-found-error');
      await expect(errorMessage).not.toHaveClass(/hide/);
   });

   test('should be sent back to the home page if go back button is clicked', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      const backButton = page.locator('a[href="./"]');
      await backButton.click();
      expect(page.url()).toBe("http://127.0.0.1:3000/");
   });
});