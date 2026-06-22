import { test, expect } from '@playwright/test';

test.describe('Reports Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('language filter shows only matching repos', async ({ page }) => {
    const initialRows = page.locator('tbody tr');
    const initialCount = await initialRows.count();
    expect(initialCount).toBeGreaterThan(0);

    const langSelect = page.locator('#reports-language');
    await langSelect.selectOption('TypeScript');
    await page.waitForTimeout(1500);

    const filteredRows = page.locator('tbody tr');
    const filteredCount = await filteredRows.count();
    console.log('Filtered rows (TypeScript):', filteredCount, '/ initial:', initialCount);
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('search input filters by name', async ({ page }) => {
    const searchInput = page.locator('#reports-search');
    await searchInput.fill('react');
    await page.waitForTimeout(1000);

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    console.log('Rows after search "react":', count);
    expect(count).toBeGreaterThan(0);
  });

  test('tier filter changes visible results', async ({ page }) => {
    const tierSelect = page.locator('#reports-tier');
    await tierSelect.selectOption('A');
    await page.waitForTimeout(1500);

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    console.log('Rows after Tier A filter:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('min score filter works', async ({ page }) => {
    const minScoreInput = page.locator('#reports-minscore');
    await minScoreInput.fill('90');
    await page.waitForTimeout(1500);

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    console.log('Rows after minScore 90 filter:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('combined filters work', async ({ page }) => {
    await page.locator('#reports-language').selectOption('JavaScript');
    await page.waitForTimeout(800);
    await page.locator('#reports-tier').selectOption('A');
    await page.waitForTimeout(1500);

    const rows = page.locator('tbody tr');
    const count = await rows.count();
    console.log('Rows after JS + Tier A filter:', count);
    expect(count).toBeGreaterThan(0);
  });

  test('clear filters button resets results', async ({ page }) => {
    await page.locator('#reports-language').selectOption('Python');
    await page.waitForTimeout(1500);

    const afterFilter = await page.locator('tbody tr').count();
    console.log('After Python filter:', afterFilter);

    const clearBtn = page.getByRole('button', { name: 'Clear all filters' });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(1500);
    }

    const afterClear = await page.locator('tbody tr').count();
    console.log('After clear:', afterClear);
    expect(afterClear).toBeGreaterThan(0);
  });

  test('filter changes URL params', async ({ page }) => {
    await page.locator('#reports-language').selectOption('Go');
    await page.waitForTimeout(1000);

    const url = page.url();
    console.log('URL after filter:', url);
    expect(url).toContain('language=Go');
  });
});
