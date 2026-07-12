import { test, expect } from '@playwright/test';

test.describe('Role Matrix and Smoke E2E', () => {
  
  test('Fleet Manager Login and Landing', async ({ page }) => {
    await page.goto('/login');
    // We can use the DEV mode autofill
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Fleet Manager' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Verify lands on dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Ensure Settings is accessible
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'System Settings' })).toBeVisible();
  });

  test('Driver Login and Blocked Action', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Driver' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Verify lands on dashboard
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Blocked action test
    await page.goto('/settings');
    // Driver should see Access Denied or 403
    await expect(page.getByText('Access Denied')).toBeVisible();
  });

  test('Safety Officer Login and Dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Safety Officer' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Blocked from Fleet? 
    // They are blocked from Fleet in matrix, let's test Maintenance instead
    await page.goto('/maintenance');
    await expect(page.getByRole('heading', { name: 'Service Logs' })).toBeVisible();
  });

  test('Financial Analyst Login and Trip Cycle E2E check', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Financial Analyst' }).click();
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Verify Financial Analyst has access to Fuel Expenses
    await page.goto('/fuel-expenses');
    await expect(page.getByRole('heading', { name: 'Fuel Logs' })).toBeVisible();
    
    // Test blocked
    await page.goto('/trips');
    await expect(page.getByText('Access Denied')).toBeVisible();
  });
});
