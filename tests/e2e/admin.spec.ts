import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('redirects to login if unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h2')).toHaveText('Admin Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
