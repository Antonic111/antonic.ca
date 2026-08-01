import { test, expect } from '@playwright/test';

test.describe('Public Homepage', () => {
  test('renders desktop layout correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check main title
    await expect(page.locator('h1')).toHaveText('Antonic');
    
    // Check location
    await expect(page.getByText('Canada')).toBeVisible();

    // Check Ultimate Dex Tracker link
    const udtLink = page.getByRole('link', { name: /My Website!/i });
    await expect(udtLink).toBeVisible();
    await expect(udtLink).toHaveAttribute('href', 'https://ultimatedextracker.com');
  });

  test('store redirect works', async ({ page }) => {
    // Navigate to /store and verify it redirects
    // Depending on dev config it goes to Fourthwall
    await page.goto('/store');
    // Just verify the redirect happens (URL changes)
    await expect(page).not.toHaveURL(/.*\/store/);
  });
});
