# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Role Matrix and Smoke E2E >> Financial Analyst Login and Trip Cycle E2E check
- Location: tests\smoke.spec.ts:47:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Fuel Logs' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Fuel Logs' })

```

```yaml
- heading "TransitOps" [level=1]
- heading "One login, four roles." [level=2]
- paragraph: Smart Transport Operations Platform. Access is scoped by role after login to ensure security and streamlined workflows.
- heading "Fleet Manager" [level=3]
- paragraph: Full system access & dispatch
- heading "Driver" [level=3]
- paragraph: View trips & update status
- heading "Safety Officer" [level=3]
- paragraph: Manage compliance & drivers
- heading "Financial Analyst" [level=3]
- paragraph: Track fuel, expenses & ROI
- text: © 2026 TransitOps Platform. All rights reserved.
- heading "Welcome back" [level=2]
- paragraph: Enter your credentials to sign in to your account
- text: Email
- textbox "Email":
  - /placeholder: name@transitops.com
- text: Password
- button "Forgot password?"
- textbox "Password":
  - /placeholder: ••••••••
- button "Sign In"
- paragraph: "Dev Mode: Auto-fill Role"
- combobox: Select a role to test...
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Role Matrix and Smoke E2E', () => {
  4  |   
  5  |   test('Fleet Manager Login and Landing', async ({ page }) => {
  6  |     await page.goto('/login');
  7  |     // We can use the DEV mode autofill
  8  |     await page.getByRole('combobox').click();
  9  |     await page.getByRole('option', { name: 'Fleet Manager' }).click();
  10 |     await page.getByRole('button', { name: 'Sign In' }).click();
  11 |     
  12 |     // Verify lands on dashboard
  13 |     await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  14 |     
  15 |     // Ensure Settings is accessible
  16 |     await page.goto('/settings');
  17 |     await expect(page.getByRole('heading', { name: 'System Settings' })).toBeVisible();
  18 |   });
  19 | 
  20 |   test('Driver Login and Blocked Action', async ({ page }) => {
  21 |     await page.goto('/login');
  22 |     await page.getByRole('combobox').click();
  23 |     await page.getByRole('option', { name: 'Driver' }).click();
  24 |     await page.getByRole('button', { name: 'Sign In' }).click();
  25 |     
  26 |     // Verify lands on dashboard
  27 |     await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  28 |     
  29 |     // Blocked action test
  30 |     await page.goto('/settings');
  31 |     // Driver should see Access Denied or 403
  32 |     await expect(page.getByText('Access Denied')).toBeVisible();
  33 |   });
  34 | 
  35 |   test('Safety Officer Login and Dashboard', async ({ page }) => {
  36 |     await page.goto('/login');
  37 |     await page.getByRole('combobox').click();
  38 |     await page.getByRole('option', { name: 'Safety Officer' }).click();
  39 |     await page.getByRole('button', { name: 'Sign In' }).click();
  40 |     
  41 |     // Blocked from Fleet? 
  42 |     // They are blocked from Fleet in matrix, let's test Maintenance instead
  43 |     await page.goto('/maintenance');
  44 |     await expect(page.getByRole('heading', { name: 'Service Logs' })).toBeVisible();
  45 |   });
  46 | 
  47 |   test('Financial Analyst Login and Trip Cycle E2E check', async ({ page }) => {
  48 |     await page.goto('/login');
  49 |     await page.getByRole('combobox').click();
  50 |     await page.getByRole('option', { name: 'Financial Analyst' }).click();
  51 |     await page.getByRole('button', { name: 'Sign In' }).click();
  52 |     
  53 |     // Verify Financial Analyst has access to Fuel Expenses
  54 |     await page.goto('/fuel-expenses');
> 55 |     await expect(page.getByRole('heading', { name: 'Fuel Logs' })).toBeVisible();
     |                                                                    ^ Error: expect(locator).toBeVisible() failed
  56 |     
  57 |     // Test blocked
  58 |     await page.goto('/trips');
  59 |     await expect(page.getByText('Access Denied')).toBeVisible();
  60 |   });
  61 | });
  62 | 
```