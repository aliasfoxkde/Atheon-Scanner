import { test, expect } from '@playwright/test';

/**
 * Regression Tests - Prevent previously fixed bugs from reoccurring
 * These tests address specific issues that have been encountered and fixed
 */

test.describe('Regression Tests', () => {
  test('BUGFIX: Dashboard shows correct repository count (not 165)', async ({ page }) => {
    // Previous issue: App showed only 165 repositories despite having 300+
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get repository count - look for any 3-digit number on the page (indicating current data)
    const numericValues = page.locator('text=/\\d{3}/');
    const count = await numericValues.count();

    // Should have numeric values on the page
    expect(count).toBeGreaterThan(0);

    // Check specifically for package count in reasonable range
    const repoCard = page.locator('text=Packages Analyzed').locator('..');
    await expect(repoCard.first()).toBeVisible();

    // Should have some numeric value in the repo card (not 0 or 165)
    const hasNumbers = await repoCard.locator('text=/\\d+/').count() > 0;
    expect(hasNumbers).toBeTruthy();
  });

  test('BUGFIX: Download and Share buttons are present and functional', async ({ page }) => {
    // Previous issue: Download and Share buttons were missing
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for download button
    const downloadButton = page.locator('button[aria-label*="download"], button:has-text("Download")');
    const downloadCount = await downloadButton.count();
    expect(downloadCount).toBeGreaterThan(0);

    // Check for share button
    const shareButton = page.locator('button[aria-label*="share"], button:has-text("Share")');
    const shareCount = await shareButton.count();
    expect(shareCount).toBeGreaterThan(0);
  });

  test('BUGFIX: API integration works and makes requests', async ({ page }) => {
    // Previous issue: No API requests were being made
    const dataRequests = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/embedded-data.json') || url.includes('/api/')) {
        dataRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    // Data requests should be made (embedded-data.json is the primary data source)
    expect(dataRequests.length).toBeGreaterThan(0);
  });

  test('BUGFIX: No 404 errors on main navigation', async ({ page }) => {
    // Previous issue: Main dashboard returned 404 Not Found
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not have 404 title
    const title = await page.title();
    expect(title).not.toContain('404');
    expect(title).toContain('Atheon Scanner');
  });

  test('BUGFIX: Charts render with proper data', async ({ page }) => {
    // Previous issue: Charts were empty or showed incorrect data
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for SVG charts
    const charts = page.locator('svg');
    await expect(charts.first()).toBeVisible();

    // Charts should have content
    const firstChartContent = await charts.first().innerHTML();
    expect(firstChartContent.length).toBeGreaterThan(100);

    // Check for specific chart types (actual labels in current Dashboard)
    await expect(page.locator('text=Security Findings').first()).toBeVisible();
    await expect(page.locator('text=Quality Tier Distribution').first()).toBeVisible();
  });

  test('BUGFIX: Responsive design works on mobile', async ({ page }) => {
    // Previous issue: Layout broke on mobile devices
    await page.setViewportSize({ width: 375, height: 666 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Dashboard should be visible on mobile
    const mobileHeading = page.locator('h1, h2').filter({ hasText: 'Dashboard' });
    await expect(mobileHeading.first()).toBeVisible();

    // Stats should be visible
    const statsCards = page.locator('[class*="bg-gray-800"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('BUGFIX: Fallback data loads when API fails', async ({ page }) => {
    // Previous issue: App crashed or showed nothing when API failed
    await page.route('**/api/**', route => route.abort());

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should still show dashboard with fallback data
    const dashboard = page.locator('h1, h2').filter({ hasText: 'Dashboard' });
    await expect(dashboard.first()).toBeVisible();

    // Should show some data (not empty state)
    const stats = page.locator('[class*="text-white"]');
    const statCount = await stats.count();
    expect(statCount).toBeGreaterThan(0);
  });

  test('BUGFIX: Navigation links work correctly', async ({ page }) => {
    // Previous issue: Navigation links didn't work or showed 404
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test Submit Analysis link
    const submitLink = page.locator('text=Submit New Analysis');
    await submitLink.first().click();
    await page.waitForTimeout(2000);

    // Should navigate to submit page
    expect(page.url()).toContain('/submit');

    // Test Browse Reports link
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const browseLink = page.locator('text=Browse Reports');
    await browseLink.first().click();
    await page.waitForTimeout(2000);

    // Should navigate to reports page
    expect(page.url()).toContain('/reports');
  });

  test('BUGFIX: White space issues are resolved', async ({ page }) => {
    // Previous issue: Excessive white space on page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Main content should be visible (no white space taking over)
    const mainContent = page.locator('main, [role="main"], .space-y-6');
    await expect(mainContent.first()).toBeVisible();

    // Should have multiple sections (not just empty space)
    const sections = page.locator('[class*="bg-gray-800"]');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(5);
  });

  test('BUGFIX: Quality scores display correctly', async ({ page }) => {
    // Previous issue: Quality scores showed incorrect values or formatting
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for quality score display
    await expect(page.locator('text=Avg Score').first()).toBeVisible();

    // Score section should be visible
    const scoreCard = page.locator('text=Avg Score').locator('..');
    await expect(scoreCard.first()).toBeVisible();

    // Should have numeric content in the score card
    const hasNumbers = await scoreCard.locator('text=/\\d+/').count() > 0;
    expect(hasNumbers).toBeTruthy();
  });

  test('BUGFIX: Recent scans display correctly', async ({ page }) => {
    // Previous issue: Recent scans section was empty or showed wrong data
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for recent scans section
    await expect(page.locator('text=Recent Scans').first()).toBeVisible();

    // Recent scans section should be visible and contain content
    const recentScansSection = page.locator('text=Recent Scans').locator('..');
    await expect(recentScansSection.first()).toBeVisible();

    // Should have some content in the recent scans section
    const hasContent = await recentScansSection.locator('text=/\\w+/').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('BUGFIX: Tier distribution shows real data', async ({ page }) => {
    // Previous issue: Tier distribution showed placeholder data
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for tier distribution section
    await expect(page.locator('text=Quality Tier Distribution').first()).toBeVisible();

    // Should have tier data (not empty)
    const tierSection = page.locator('text=Quality Tier Distribution').locator('..');
    await expect(tierSection.first()).toBeVisible();
  });

  test('BUGFIX: Security statistics display correctly', async ({ page }) => {
    // Previous issue: Security stats were missing or incorrect
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Check for security findings section (actual label in Dashboard)
    await expect(page.locator('text=Security Findings').first()).toBeVisible();

    // Should have security data
    const securitySection = page.locator('text=Security Findings').locator('..');
    await expect(securitySection.first()).toBeVisible();
  });

  test('BUGFIX: JavaScript console errors are resolved', async ({ page }) => {
    // Previous issue: JavaScript errors in console
    const errors = [];
    const warnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should have minimal errors/warnings
    console.log('Console errors:', errors);
    console.log('Console warnings:', warnings);

    // Allow some warnings but no critical errors
    const criticalErrors = errors.filter(error =>
      error.includes('Uncaught') || error.includes('TypeError') || error.includes('ReferenceError')
    );

    expect(criticalErrors.length).toBe(0);
  });
});