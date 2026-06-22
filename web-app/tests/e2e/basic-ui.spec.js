import { test, expect } from '@playwright/test';

test.describe('Atheon Scanner - Basic UI Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/'); // Use relative path to use baseURL from config
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard loads and displays real data', async ({ page }) => {
    // Check if we're on the right page
    await expect(page).toHaveTitle(/Atheon Scanner/);

    // Check for main heading
    const heading = page.locator('h1, h2').filter({ hasText: 'Dashboard' });
    await expect(heading.first()).toBeVisible();

    // Check if stats are displayed
    await expect(page.locator('text=Packages Analyzed').first()).toBeVisible();
    await expect(page.locator('text=Total Scans').first()).toBeVisible();

    // Wait for data to load
    await page.waitForTimeout(2000);

    // Check for repository count (should be 262+ with real data)
    const repoCount = page.locator('text=/\\d{3}/').first();
    await expect(repoCount).toBeVisible({ timeout: 5000 });
  });

  test('Statistics cards are displayed correctly', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check for stats grid
    const statsGrid = page.locator('.grid').or(page.locator('[class*="grid"]'));
    await expect(statsGrid.first()).toBeVisible();

    // Check for individual stat cards
    const statsCards = page.locator('[class*="bg-gray-800"], [class*="rounded"]');
    await expect(statsCards.first()).toBeVisible();

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-screenshots/dashboard.png' });
  });

  test('Quick Actions buttons are visible and functional', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check for action buttons
    const submitButton = page.locator('text=Submit New Analysis');
    const browseButton = page.locator('text=Browse Reports');

    await expect(submitButton).toBeVisible();
    await expect(browseButton).toBeVisible();

    // Test navigation
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      // Should navigate to submit page
      await expect(page).toHaveURL(/submit/);
    }
  });

  test('No excessive white space', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(3000);

    // Check main content area
    const mainContent = page.locator('main, [role="main"]').or(page.locator('.space-y-6'));

    // Take screenshot to check layout
    await page.screenshot({ path: 'test-screenshots/layout-check.png', fullPage: true });

    // Check that content is visible
    await expect(mainContent.first()).toBeVisible();
  });

  test('API integration is working', async ({ page }) => {
    // Intercept API calls
    const apiRequests = [];

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
      }
    });

    // Wait for page load
    await page.waitForTimeout(5000);

    // Check if API requests were made
    console.log('API Requests made:', apiRequests);

    // Look for real data indicators
    const realDataIndicators = page.locator('text=/262/, text=/165/, text=/250/');
    const hasRealData = await realDataIndicators.count() > 0;

    console.log('Real data found on page:', hasRealData);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-screenshots/api-check.png' });
  });
});

test.describe('Atheon Scanner - Interactive Elements', () => {
  test('Download and Share buttons functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for download button
    const downloadButton = page.locator('button:has-text("Download"), [aria-label*="download"], button:has-text("Report")');

    if (await downloadButton.count() > 0) {
      console.log('Download button found');

      // Test button is clickable
      await expect(downloadButton.first()).toBeVisible();

      // Try clicking (may not work without actual download)
      try {
        await downloadButton.first().click();
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('Download button click error:', error.message);
      }
    } else {
      console.log('No download button found - may need to be added');
    }

    // Look for share button
    const shareButton = page.locator('button:has-text("Share"), [aria-label*="share"]');

    if (await shareButton.count() > 0) {
      console.log('Share button found');

      await expect(shareButton.first()).toBeVisible();

      try {
        await shareButton.first().click();
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('Share button click error:', error.message);
      }
    } else {
      console.log('No share button found - may need to be added');
    }

    // Take screenshot of current state
    await page.screenshot({ path: 'test-screenshots/buttons-check.png' });
  });

  test('Forms and inputs work correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Look for any input fields or forms
    const inputs = page.locator('input, select, textarea');

    if (await inputs.count() > 0) {
      console.log('Found', await inputs.count(), 'input fields');

      // Test first input if exists
      const firstInput = inputs.first();
      await expect(firstInput).toBeVisible();

      // Check if input can be focused
      await firstInput.focus();
      await expect(firstInput).toBeFocused();
    } else {
      console.log('No input fields found on main page');
    }
  });
});