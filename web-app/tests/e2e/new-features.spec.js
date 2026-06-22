import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('New Features - Bookmark, Watchlist, Search, Estimate, CSV', () => {

  // --------------------------------------------------------------------------
  // 1. Bookmark feature
  // --------------------------------------------------------------------------
  test.describe('Bookmark feature', () => {
    test('star button bookmarks item and filter shows it, persists after reload', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Get the name from the first row (3rd td: after checkbox and star)
      const firstRow = page.locator('tbody tr').first();
      const itemName = await firstRow.locator('td').nth(2).textContent();
      console.log('Bookmarking item:', itemName);

      // Click the star button on the first row
      const firstStarButton = firstRow.locator('button[aria-label]').first();
      await expect(firstStarButton).toBeVisible();
      await firstStarButton.click();
      await page.waitForTimeout(500);

      // Now click the "Bookmarked" filter button to show only bookmarked
      const bookmarkBtn = page.locator('button:has-text("All"), button:has-text("Bookmarked")').first();
      await bookmarkBtn.click();
      await page.waitForTimeout(1000);

      // Should see the bookmarked item in the list
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      console.log('Rows after bookmark filter:', count);
      expect(count).toBeGreaterThan(0);

      const firstRowName = await rows.first().locator('td').nth(2).textContent();
      expect(firstRowName.trim()).toBe(itemName.trim());

      // Reload and verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // After reload, click the Bookmarked filter again to verify persistence
      const bookmarkBtnAfter = page.locator('button:has-text("All"), button:has-text("Bookmarked")').first();
      await bookmarkBtnAfter.click();
      await page.waitForTimeout(1000);

      const rowsAfterReload = page.locator('tbody tr');
      const firstRowNameAfterReload = await rowsAfterReload.first().locator('td').nth(2).textContent();
      expect(firstRowNameAfterReload.trim()).toBe(itemName.trim());
    });
  });

  // --------------------------------------------------------------------------
  // 2. Clear all filters
  // --------------------------------------------------------------------------
  test.describe('Clear all filters', () => {
    test('applying language filter shows "Clear all filters" button which resets everything', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Get initial row count
      const initialRows = page.locator('tbody tr');
      const initialCount = await initialRows.count();
      expect(initialCount).toBeGreaterThan(0);

      // Apply a language filter
      const langSelect = page.locator('#reports-language');
      await langSelect.selectOption('TypeScript');
      await page.waitForTimeout(1500);

      const afterFilterCount = await page.locator('tbody tr').count();
      console.log('After TypeScript filter:', afterFilterCount, '/ initial:', initialCount);

      // "Clear all filters" link should be visible
      const clearAllBtn = page.getByRole('button', { name: 'Clear all filters' });
      await expect(clearAllBtn).toBeVisible();

      // Click it
      await clearAllBtn.click();
      await page.waitForTimeout(1500);

      // All filters should be reset (language should be empty)
      const langValue = await page.locator('#reports-language').inputValue();
      expect(langValue).toBe('');

      // Rows should be restored
      const afterClearCount = await page.locator('tbody tr').count();
      expect(afterClearCount).toBe(initialCount);
    });
  });

  // --------------------------------------------------------------------------
  // 3. Watchlist feature
  // --------------------------------------------------------------------------
  test.describe('Watchlist feature', () => {
    test('clicking Watch on first item shows "Top Watched" section at top; clicking × removes it', async ({ page }) => {
      await page.goto('/trending');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Get the first repo name - look for h3 inside the repo list cards
      // Repo cards are inside .space-y-3 with hover:border-blue-600
      const firstRepoCard = page.locator('.space-y-3 > div').first();
      const firstRepoName = await firstRepoCard.locator('h3').first().textContent();
      console.log('First repo to watch:', firstRepoName);

      // Click the "Watch" button on the first item
      const watchBtn = firstRepoCard.locator('button:has-text("Watch")').first();
      await expect(watchBtn).toBeVisible();
      await watchBtn.click();
      await page.waitForTimeout(1000);

      // Verify "Top Watched" section appears at the top
      const topWatchedHeading = page.getByRole('heading', { name: 'Top Watched' });
      await expect(topWatchedHeading).toBeVisible({ timeout: 3000 });

      // Verify the watched repo appears in the Top Watched list (section has border)
      const topWatchedSection = page.locator('.bg-gray-800.rounded-lg.p-4.border.border-gray-700').first();
      const watchedItemText = await topWatchedSection.textContent();
      expect(watchedItemText).toContain(firstRepoName.trim());

      // Now remove it by clicking × in the Top Watched section
      const removeBtn = topWatchedSection.locator('button[title="Remove from watchlist"]').first();
      await expect(removeBtn).toBeVisible();
      await removeBtn.click();
      await page.waitForTimeout(1000);

      // After removal, verify Top Watched section is gone (since we only had 1)
      await expect(topWatchedHeading).not.toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // 4. Dashboard search Enter key
  // --------------------------------------------------------------------------
  test.describe('Dashboard search Enter key', () => {
    test('typing in dashboard search and pressing Enter navigates to /reports with q param', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Find the global search input
      const searchInput = page.locator('input[data-search]').first();
      await expect(searchInput).toBeVisible();

      // Type a repo name
      const searchTerm = 'react';
      await searchInput.fill(searchTerm);
      await page.waitForTimeout(300);

      // Press Enter
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);

      // Should navigate to /reports with q param
      await expect(page).toHaveURL(/\/reports\?q=react/);

      // Verify the search input on reports page has the value
      const reportsSearch = page.locator('#reports-search');
      const reportsSearchValue = await reportsSearch.inputValue();
      expect(reportsSearchValue.toLowerCase()).toContain(searchTerm.toLowerCase());
    });
  });

  // --------------------------------------------------------------------------
  // 5. Submit scan estimate
  // --------------------------------------------------------------------------
  test.describe('Submit scan estimate', () => {
    test('typing facebook/react in repo field and blurring shows scan estimate card', async ({ page }) => {
      await page.goto('/submit');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Find the repo input
      const repoInput = page.locator('#submit-repo');
      await expect(repoInput).toBeVisible();

      // Fill in a valid repo name
      await repoInput.fill('facebook/react');
      await page.waitForTimeout(200);

      // Blur the field (trigger onBlur which calls computeScanEstimate)
      await repoInput.blur();
      await page.waitForTimeout(1500);

      // Verify the scan estimate card appears
      const estimateCard = page.getByText('Estimated scan time');
      await expect(estimateCard).toBeVisible({ timeout: 3000 });

      // Verify it shows a time estimate
      const estimateText = await page.locator('text=/~\\d+ (seconds|minutes)/').first().textContent();
      expect(estimateText).toBeTruthy();
      console.log('Scan estimate:', estimateText);
    });

    test('repo field without valid format does not show estimate', async ({ page }) => {
      await page.goto('/submit');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const repoInput = page.locator('#submit-repo');
      await repoInput.fill('invalid');
      await repoInput.blur();
      await page.waitForTimeout(1000);

      // Estimate card should not appear
      const estimateCard = page.getByText('Estimated scan time');
      await expect(estimateCard).not.toBeVisible();
    });
  });

  // --------------------------------------------------------------------------
  // 6. Export CSV injection
  // --------------------------------------------------------------------------
  test.describe('Export CSV injection prevention', () => {
    test('exported CSV does not have unescaped = or + at start of cells', async ({ page }) => {
      await page.goto('/reports');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Set up download listener
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }),
        page.locator('button:has-text("Page CSV")').click(),
      ]);

      const path = await download.path();
      const content = fs.readFileSync(path, 'utf8');

      // Check that no cell starts with =, +, -, @, \t without being escaped with '
      // The safeCsvCell function prefixes these with '
      const lines = content.split('\n');

      for (let i = 1; i < Math.min(lines.length, 20); i++) { // Check first 20 data rows
        const line = lines[i];
        if (!line.trim()) continue;
        const cells = line.split(',');
        for (const cell of cells) {
          const trimmed = cell.trim();
          // Should not start with =, +, -, @, \r, \t unless escaped with '
          if (/^[=+\-@\t\r]/.test(trimmed)) {
            // Allow if it's escaped with a leading single quote
            expect(trimmed.startsWith("'")).toBe(true);
          }
        }
      }

      console.log('CSV injection check passed for', lines.length, 'lines');
    });
  });

});
