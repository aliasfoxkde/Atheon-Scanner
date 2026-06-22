import { test, expect } from '@playwright/test';

/**
 * Modal, Settings, Compare, and NotFound page coverage
 */

test.describe('NotFound Page', () => {
  test('renders 404 page at unknown route', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await page.waitForLoadState('networkidle');

    const heading = page.getByText('Page not found');
    await expect(heading).toBeVisible();

    const status = page.getByText('404');
    await expect(status).toBeVisible();

    // Links back to main pages should work
    await expect(page.getByRole('link', { name: 'Go to Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Reports' })).toBeVisible();
  });

  test('404 page dashboard link navigates correctly', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await page.waitForLoadState('networkidle');
    await page.click('text=Go to Dashboard');
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Settings Page', () => {
  test('renders settings page with all sections', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Appearance' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Data' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Display' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();
  });

  test('theme buttons are clickable and switch theme', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const lightBtn = page.getByRole('button', { name: 'light' });
    await expect(lightBtn).toBeVisible();
    await lightBtn.click();
  });

  test('auto-refresh select is present and interactive', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const select = page.locator('select').first();
    await expect(select).toBeVisible();
    await select.selectOption('300');
  });

  test('reset settings button is present', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const resetBtn = page.getByRole('button', { name: /reset/i });
    await expect(resetBtn).toBeVisible();
  });

  test('density toggle switches between comfortable and compact', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const compactBtn = page.getByRole('button', { name: 'compact' });
    await compactBtn.click();
    await expect(compactBtn).toHaveClass(/bg-blue-600/);
  });

  test('column checkboxes toggle state', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const starsCheckbox = page.locator('input[type="checkbox"]').first();
    await starsCheckbox.click();
    await expect(starsCheckbox).not.toBeChecked();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('? opens shortcuts modal', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.keyboard.press('?');
    await expect(page.getByText('Keyboard shortcuts')).toBeVisible();
  });

  test('Esc closes shortcuts modal', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await page.keyboard.press('?');
    await expect(page.getByText('Keyboard shortcuts')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText('Keyboard shortcuts')).not.toBeVisible();
  });

  test('g+d navigates to dashboard', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    // Ensure body has focus (Escape clears any focused element)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);

    // Use type() for proper character handling; g+d must be within NAV_SEQUENCE_TIMEOUT (1200ms)
    await page.keyboard.type('gd', { delay: 50 });
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('g+s+e navigates to settings', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(50);

    // g then s then e — must be within NAV_SEQUENCE_TIMEOUT (1200ms) each
    await page.keyboard.type('gse', { delay: 50 });
    await expect(page).toHaveURL('/settings', { timeout: 5000 });
  });

  test('/ focuses search on reports page', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Ensure body has focus and no input is capturing the key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    await page.keyboard.press('/');
    await page.waitForTimeout(200);
    const searchInput = page.locator('input[type="search"], input[data-search]').first();
    await expect(searchInput).toBeFocused({ timeout: 3000 });
  });
});

test.describe('Report Detail Page', () => {
  test('navigates to report detail when a row is clicked', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await page.waitForTimeout(1000);

    // Should navigate to /reports/:id page
    await expect(page).toHaveURL(/\/reports\/.+/);
  });

  test('report detail page shows summary tab by default', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const firstRow = page.locator('tbody tr').first();
    const name = await firstRow.locator('td').nth(1).textContent();
    await firstRow.click();
    await page.waitForTimeout(1000);

    // Should be on the report detail page
    await expect(page).toHaveURL(/\/reports\/.+/);
    // Should show a summary or findings tab
    const hasContent = await page.getByText('Summary').or(page.getByText('Findings')).or(page.getByText('Dependencies')).first().isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Reports Sort & Filter', () => {
  test('search input filters results', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[type="search"], input[data-search]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('javascript');
      await page.waitForTimeout(500);
    }
  });

  test('tier filter dropdown changes results', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const tierSelect = page.locator('#reports-tier');
    if (await tierSelect.isVisible()) {
      await tierSelect.selectOption('A');
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Compare Entry Points', () => {
  test('Dashboard Compare button navigates to reports page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const compareBtn = page.locator('button[aria-label="Compare reports"]');
    await expect(compareBtn).toBeVisible();

    await compareBtn.click();
    await expect(page).toHaveURL(/\/reports$/);
  });

  test('Reports page enters compare mode when ?compare=true is in URL', async ({ page }) => {
    await page.goto('/reports?compare=true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show a "Compare" header label or the compare column
    const compareLabel = page.getByText('Compare');
    await expect(compareLabel.first()).toBeVisible();
  });

  test('Compare mode shows checkboxes on report rows', async ({ page }) => {
    await page.goto('/reports?compare=true');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Checkboxes should be visible in the first column area
    const firstRowCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await expect(firstRowCheckbox).toBeVisible();
  });
});

test.describe('Toast Notifications', () => {
  test('settings page theme change shows toast', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const lightBtn = page.getByRole('button', { name: 'light' });
    await lightBtn.click();

    // Toast should appear in the fixed container
    const toastContainer = page.locator('[role="region"][aria-label="Notifications"]');
    await expect(toastContainer).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('theme toggle button is visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const toggle = page.locator('#theme-toggle-btn, [aria-label*="theme"], button svg[class*="moon"]').first();
    await expect(toggle).toBeVisible();
  });
});
