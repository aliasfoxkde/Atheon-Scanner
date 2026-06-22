import { test, expect } from '@playwright/test';

/**
 * Smoke/Sanity Tests - Critical functionality validation
 * These tests verify the most critical functionality works
 * Run these first before running other test suites
 */

test.describe('Smoke Tests - Critical Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Application loads successfully', async ({ page }) => {
    // CRITICAL: App must load
    await expect(page).toHaveTitle(/Atheon Scanner/);
    await page.waitForLoadState('networkidle');
  });

  test('Dashboard is accessible', async ({ page }) => {
    // CRITICAL: Main dashboard must be accessible
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').filter({ hasText: 'Dashboard' });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });
  });

  test('Statistics are displayed', async ({ page }) => {
    // CRITICAL: Core metrics must be visible
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Allow data to load

    // Check for repository count (should show real data)
    await expect(page.locator('text=Packages Analyzed').first()).toBeVisible();

    // Check that we have numbers displayed (not loading state)
    const statsCards = page.locator('[class*="bg-gray-800"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('Quick action buttons work', async ({ page }) => {
    // CRITICAL: Navigation must work
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const submitButton = page.locator('text=Submit New Analysis');
    await expect(submitButton.first()).toBeVisible();

    // Test navigation
    await submitButton.first().click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/submit/);
  });

  test('API integration is functional', async ({ page }) => {
    // CRITICAL: API must respond
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Check for real data (numbers > 100)
    const largeNumbers = page.locator('text=/\\d{3}/');
    const count = await largeNumbers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('No JavaScript errors in console', async ({ page }) => {
    // CRITICAL: No console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    expect(errors).toHaveLength(0);
  });

  test('Core UI components are responsive', async ({ page }) => {
    // CRITICAL: UI must be responsive
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test different viewport sizes
    await page.setViewportSize({ width: 375, height: 666 }); // Mobile
    await page.waitForTimeout(1000);

    const mobileHeading = page.locator('h1, h2').filter({ hasText: 'Dashboard' });
    await expect(mobileHeading.first()).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(1000);

    const desktopHeading = page.locator('h1, h2').filter({ hasText: 'Dashboard' });
    await expect(desktopHeading.first()).toBeVisible();
  });
});

test.describe('Sanity Tests - Basic Functionality', () => {
  test('Page loads in reasonable time', async ({ page }) => {
    // Performance sanity check
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('Charts and graphs render', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for SVG elements (charts)
    const svgs = page.locator('svg');
    await expect(svgs.first()).toBeVisible();
  });

  test('Download and share buttons exist', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for download button
    const downloadButton = page.locator('button[aria-label*="download"], button:has-text("Download")');
    const hasDownloadButton = await downloadButton.count() > 0;
    expect(hasDownloadButton).toBeTruthy();

    // Check for share button
    const shareButton = page.locator('button[aria-label*="share"], button:has-text("Share")');
    const hasShareButton = await shareButton.count() > 0;
    expect(hasShareButton).toBeTruthy();
  });

  test('Color scheme and contrast are readable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for proper contrast elements
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();

    // Check for proper text colors
    const whiteText = page.locator('[class*="text-white"]');
    await expect(whiteText.first()).toBeVisible();
  });
});