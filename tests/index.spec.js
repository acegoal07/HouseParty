import { test, expect } from '@playwright/test';
import os from 'os';

const basePath = `http://127.0.0.1:3000/index.html`;

test.describe('House Party Index Page', () => {
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

   test('should hide the Logout button if cookies are not set', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      const logoutButton = page.locator('button#logout-button');
      await expect(logoutButton).toHaveClass(/hide/);
   });

   test('should show the logout button if cookies are set', async ({ page, context }) => {
      await context.addCookies([
         {
            name: 'refresh_token',
            value: 'dummy_token',
            domain: '127.0.0.1',
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 3600
         },
         {
            name: 'host_id',
            value: 'dummy_host',
            domain: '127.0.0.1',
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 3600
         }
      ]);
      await page.goto(basePath, { waitUntil: 'load' });
      await page.evaluate(() => {
         document.cookie = "refresh_token=dummy_token; path=/; domain=127.0.0.1; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString();
         document.cookie = "host_id=dummy_host; path=/; domain=127.0.0.1; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString();
      });
      await page.waitForTimeout(500); // wait to make sure cookies are set
      const logoutButton = page.locator('button#logout-button');
      await expect(logoutButton).not.toHaveClass(/hide/);
   });

   test('should navigate to the dashboard if cookies are set', async ({ page, context }) => {
      await context.addCookies([
         {
            name: 'refresh_token',
            value: 'dummy_token',
            domain: '127.0.0.1',
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 3600
         },
         {
            name: 'host_id',
            value: 'dummy_host',
            domain: '127.0.0.1',
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 3600
         }
      ]);
      await page.goto(basePath, { waitUntil: 'load' });
      await page.evaluate(() => {
         document.cookie = "refresh_token=dummy_token; path=/; domain=127.0.0.1; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString();
         document.cookie = "host_id=dummy_host; path=/; domain=127.0.0.1; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString();
      });
      await page.waitForTimeout(500); // wait to make sure cookies are set
      const partyManagerButton = page.locator('button#party-manager-button');
      await partyManagerButton.click();
      await expect(page).toHaveURL(/dashboard.html/);
   });

   test('should redirect to Spotify login if cookies are not set', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      const partyManagerButton = page.locator('button#party-manager-button');
      await partyManagerButton.click();
      await expect(page).toHaveURL(/accounts\.spotify\.com/);
   });

   test('should remove cookies and reload the page on logout', async ({ page, context }) => {
      await context.addCookies([
         {
            name: 'refresh_token',
            value: 'dummy_token',
            domain: '127.0.0.1',
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 3600
         },
         {
            name: 'host_id',
            value: 'dummy_host',
            domain: '127.0.0.1',
            path: '/',
            expires: Math.floor(Date.now() / 1000) + 3600
         }
      ]);
      await page.goto(basePath, { waitUntil: 'load' });
      await page.evaluate(() => {
         document.cookie = "refresh_token=dummy_token; path=/; domain=127.0.0.1; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString();
         document.cookie = "host_id=dummy_host; path=/; domain=127.0.0.1; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString();
      });
      await page.waitForTimeout(500); // wait to make sure cookies are set
      const logoutButton = page.locator('button#logout-button');
      await logoutButton.click();
      if (browserName === 'webkit') {
         const cookies = await page.evaluate(() => document.cookie);
         expect(cookies).not.toContain('refresh_token=dummy_token');
         expect(cookies).not.toContain('host_id=dummy_host');
      } else {
         const cookies = await context.cookies();
         expect(cookies.find(cookie => cookie.name === 'refresh_token')).toBeUndefined();
         expect(cookies.find(cookie => cookie.name === 'host_id')).toBeUndefined();
      }
      await expect(page).toHaveURL(basePath);
   });

   test('should hide the loading icon after the page loads', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      const loadingIcon = page.locator('div#loading-icon');
      await expect(loadingIcon).toHaveClass(/hide/);
   });

   test('should go to join page when join button is clicked', async ({ page }) => {
      await page.goto(basePath, { waitUntil: 'load' });
      const joinButton = page.locator('a[href="join.html"]');
      await joinButton.click();
      await expect(page).toHaveURL(/join.html/);
   });
});