import { test, expect } from '@playwright/test';

const ROLES = [
  { role: 'FLEET_MANAGER', email: 'fleet@transitops.com', password: 'password123', expectedUrl: /.*\/dashboard/ },
  { role: 'DRIVER', email: 'driver@transitops.com', password: 'password123', expectedUrl: /.*\/trips/ },
  { role: 'SAFETY_OFFICER', email: 'safety@transitops.com', password: 'password123', expectedUrl: /.*\/drivers/ },
  { role: 'FINANCIAL_ANALYST', email: 'finance@transitops.com', password: 'password123', expectedUrl: /.*\/fuel-expenses/ },
];

test.describe('Authentication and RBAC Smoke Tests', () => {
  for (const { role, email, password, expectedUrl } of ROLES) {
    test(`Login as ${role} and verify landing page`, async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');

      // Wait for navigation
      await page.waitForURL(expectedUrl, { timeout: 10000 });
      expect(page.url()).toMatch(expectedUrl);
    });
  }

  test('Driver is blocked from accessing settings', async ({ page }) => {
    // Login as driver
    await page.goto('/login');
    await page.fill('input[name="email"]', 'driver@transitops.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/trips/);

    // Attempt to access settings
    await page.goto('/settings');

    // Should be redirected or see a 403 / unauthorized message
    // If next.js middleware is configured, it might redirect to /login or /unauthorized
    const url = page.url();
    if (url.includes('/settings')) {
      // Check if there is an unauthorized message
      const text = await page.textContent('body');
      expect(text?.toLowerCase()).toMatch(/(unauthorized|403|access denied|forbidden)/);
    } else {
      expect(page.url()).not.toMatch(/.*\/settings/);
    }
  });
});

test.describe('End-to-End Trip Lifecycle (Fleet Manager)', () => {
  test('Complete one full trip lifecycle', async ({ page }) => {
    // Login as Fleet Manager
    await page.goto('/login');
    await page.fill('input[name="email"]', 'fleet@transitops.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*\/dashboard/);

    // Go to Trips page
    await page.goto('/trips');
    await page.waitForURL(/.*\/trips/);

    // Fill in the new trip form (CreateTripCard)
    await page.fill('input[name="source"]', 'New York');
    await page.fill('input[name="destination"]', 'Boston');
    await page.fill('input[name="cargoWeightKg"]', '1000');
    await page.fill('input[name="plannedDistanceKm"]', '350');
    
    // Select Vehicle
    await page.click('button:has-text("Select an available vehicle")');
    await page.click('div[role="option"]:nth-child(1)'); // Select first available
    
    // Select Driver
    await page.click('button:has-text("Select an available driver")');
    await page.click('div[role="option"]:nth-child(1)'); // Select first available

    // Submit
    await page.click('button:has-text("Dispatch Trip")');

    // Wait for the form to clear or a success state
    await expect(page.locator('input[name="source"]')).toBeEmpty({ timeout: 10000 });
  });
});
