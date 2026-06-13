import { test, expect } from '@playwright/test';

test('landing page loads and shows CTA', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText('CARBONSENSE')).toBeVisible();
  await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
});

test('auth page accessible from landing', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.getByRole('button', { name: /get started/i }).click();
  await expect(page).toHaveURL(/\/auth/);
});
