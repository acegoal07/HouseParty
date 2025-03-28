import { test, expect } from '@playwright/test';
// import { host_id, refresh_token } from './testCookies.json'

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
      await page.waitForTimeout(500); // Test can fails sometimes due to the page not being loaded so this adds a slight delay before checking the URL
      expect(page.url()).toBe("http://127.0.0.1:3000/");
   });



   // Test below cannot be run locally because it does not have access to the servers database and API calls so will fail every time this is for security reasons

   // test('test to make sure the create party page shows if cookies are present', async ({ page, context }) => {
   //    await context.addCookies([
   //       {
   //          name: 'refresh_token',
   //          value: refresh_token,
   //          domain: '127.0.0.1',
   //          path: '/',
   //          expires: Math.floor(Date.now() / 1000) + 3600
   //       },
   //       {
   //          name: 'host_id',
   //          value: host_id,
   //          domain: '127.0.0.1',
   //          path: '/',
   //          expires: Math.floor(Date.now() / 1000) + 3600
   //       }
   //    ]);
   //    await page.goto(basePath, { waitUntil: 'load' });
   //    await page.waitForTimeout(500); // Test can fails sometimes due to the page not being loaded so this adds a slight delay before checking the URL
   //    expect(page.url()).toBe(basePath);
   //    expect(page.locator('div#create-party')).not.toHaveClass(/hide/);
   // });

   // test('test to make sure user can create a party', async ({ page, context }) => {
   //    await context.addCookies([
   //       {
   //          name: 'refresh_token',
   //          value: refresh_token,
   //          domain: '127.0.0.1',
   //          path: '/',
   //          expires: Math.floor(Date.now() / 1000) + 3600
   //       },
   //       {
   //          name: 'host_id',
   //          value: host_id,
   //          domain: '127.0.0.1',
   //          path: '/',
   //          expires: Math.floor(Date.now() / 1000) + 3600
   //       }
   //    ]);
   //    await page.goto(basePath, { waitUntil: 'load' });
   //    await page.waitForTimeout(500); // Test can fails sometimes due to the page not being loaded so this adds a slight delay before checking the URL
   //    expect(page.url()).toBe(basePath);
   //    expect(page.locator('div#create-party')).not.toHaveClass(/hide/);
   //    await page.check('input#personal-use-checkbox');
   //    await page.click('button[aria-label="Create Party"]');
   //    await page.waitForTimeout(500); // Test can fails sometimes due to the page not being loaded so this adds a slight delay before checking the URL
   //    expect(page.locator('div#create-party')).toHaveClass(/hide/);
   //    expect(page.locator('div#settings')).not.toHaveClass(/hide/);
   // });
});