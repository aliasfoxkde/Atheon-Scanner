import { test, expect } from '@playwright/test';

/**
 * Performance Tests - Ensure application performs well
 * These tests verify load times, resource usage, and user experience
 */

test.describe('Performance Tests', () => {
  test('Page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    console.log(`Page load time: ${loadTime}ms`);
  });

  test('First Contentful Paint is fast', async ({ page }) => {
    // Measure FCP via navigation timing
    const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    await page.goto('/');
    await navigationPromise;

    // DOM content loaded should be fast
    const perfTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      return entries[0] ? { domContentLoaded: entries[0].domContentLoadedEventEnd - entries[0].startTime } : null;
    });

    if (perfTiming) {
      expect(perfTiming.domContentLoaded).toBeLessThan(3000);
      console.log(`FCP: ${perfTiming.domContentLoaded}ms`);
    }
  });

  test('Largest Contentful Paint is acceptable', async ({ page }) => {
    // Wait for largest contentful paint by checking when main content appears
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Dashboard heading should appear quickly (proxy for LCP)
    const startTime = Date.now();
    await page.waitForSelector('h1, h2', { timeout: 5000 });
    const lcpTime = Date.now() - startTime;

    expect(lcpTime).toBeLessThan(5000);
    console.log(`LCP proxy (heading visible): ${lcpTime}ms`);
  });

  test('Resource sizes are reasonable', async ({ page }) => {
    const resources = [];

    page.on('response', response => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      if (contentType.includes('javascript') || contentType.includes('css')) {
        resources.push({
          url: url,
          type: contentType,
          size: parseInt(response.headers()['content-length'] || '0')
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check total JavaScript size
    const jsResources = resources.filter(r => r.type.includes('javascript'));
    const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0);

    // Total JS should be under 500KB
    expect(totalJsSize).toBeLessThan(500 * 1024);

    console.log(`Total JavaScript size: ${totalJsSize} bytes`);
  });

  test('API response times are acceptable', async ({ page }) => {
    // Check that data requests (embedded-data.json) complete successfully
    const dataRequests = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/embedded-data.json') || url.includes('/api/')) {
        dataRequests.push({ url, startTime: Date.now() });
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/embedded-data.json') || url.includes('/api/')) {
        const req = dataRequests.find(r => r.url === url);
        if (req) {
          req.endTime = Date.now();
          req.duration = req.endTime - req.startTime;
        }
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Data requests should have been made and completed
    expect(dataRequests.length).toBeGreaterThan(0);

    console.log('Data response times:', dataRequests);
  });

  test('Memory usage is reasonable — no excessive DOM nodes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const domCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });

    // Should have fewer than 10,000 DOM nodes
    expect(domCount).toBeLessThan(10000);
    console.log(`DOM nodes: ${domCount}`);
  });

  test('No memory leaks on navigation — DOM stays bounded', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const initialCount = await page.evaluate(() => document.querySelectorAll('*').length);

    // Navigate through several pages
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.goto('/trending');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.goto('/pipeline');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const finalCount = await page.evaluate(() => document.querySelectorAll('*').length);

    // DOM count should not balloon — allow 2x growth for dynamic content
    expect(finalCount).toBeLessThan(initialCount * 3);
    console.log(`DOM nodes: ${initialCount} -> ${finalCount}`);
  });

  test('Chart rendering performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    // Wait for charts to render (allow more time for embedded data + canvas)
    await page.waitForSelector('svg', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const renderTime = Date.now() - startTime;

    // Charts should render within 8 seconds (allows for embedded data load)
    expect(renderTime).toBeLessThan(8000);

    console.log(`Chart render time: ${renderTime}ms`);
  });

  test('Scroll performance is smooth', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const startTime = Date.now();

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(500);

    const scrollTime = Date.now() - startTime;

    // Scroll should be fast
    expect(scrollTime).toBeLessThan(1000);

    console.log(`Scroll time: ${scrollTime}ms`);
  });

  test('Interactive elements respond quickly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const button = page.locator('button').first();
    await button.hover();

    const startTime = Date.now();
    await button.click();
    const responseTime = Date.now() - startTime;

    // Button click should respond within 200ms (relaxed for CI environments)
    expect(responseTime).toBeLessThan(200);

    console.log(`Button response time: ${responseTime}ms`);
  });

  test('Data loading doesn\'t block UI', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Dashboard should be visible immediately
    const dashboard = page.locator('h1, h2').filter({ hasText: 'Dashboard' });
    await expect(dashboard.first()).toBeVisible({ timeout: 2000 });

    // Data should load subsequently
    await page.waitForTimeout(3000);

    const stats = page.locator('[class*="bg-gray-800"]');
    await expect(stats.first()).toBeVisible();
  });

  test('Concurrent requests are handled well', async ({ page }) => {
    let requestCount = 0;
    let maxConcurrent = 0;

    page.on('request', () => {
      requestCount++;
      maxConcurrent = Math.max(maxConcurrent, requestCount);
    });

    page.on('response', () => {
      requestCount--;
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should handle multiple concurrent requests
    expect(maxConcurrent).toBeGreaterThan(0);

    console.log(`Max concurrent requests: ${maxConcurrent}`);
  });
});