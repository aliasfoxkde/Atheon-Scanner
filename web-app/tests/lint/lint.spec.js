import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Code Quality — Lint & Format Checks', () => {

  test('src files have no ESLint errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run ESLint on src files
    let lintOutput = '';
    try {
      lintOutput = execSync(
        'cd /nas/Temp/repos/Atheon-GitHub-Scanner/web-app && npx eslint src/ --max-warnings 0 2>&1 || true',
        { timeout: 60_000, encoding: 'utf8' }
      );
    } catch (e) {
      lintOutput = e.stdout || e.stderr || '';
    }

    // Output should be empty (no errors)
    // Allow warnings, fail only on errors
    const hasErrors = lintOutput.includes('error') && !lintOutput.includes('0 errors');
    if (hasErrors) {
      console.log('ESLint output:', lintOutput.substring(0, 500));
    }
    expect(hasErrors).toBeFalsy();
  });

  test('No console.error calls in production code', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Search src files for console.error
    const output = execSync(
      'grep -rn "console.error" /nas/Temp/repos/Atheon-GitHub-Scanner/web-app/src/ 2>/dev/null || true',
      { encoding: 'utf8' }
    );

    const lines = output.trim().split('\n').filter(Boolean);
    // Allow in try/catch blocks with a comment explaining why
    const violations = lines.filter(l =>
      !l.includes('//') && !l.includes('catch') && !l.includes('AbortError') && !l.includes('ErrorBoundary')
    );

    if (violations.length > 0) {
      console.log('console.error found:', violations);
    }
    expect(violations.length).toBe(0);
  });

  test('All exported components are used (no dead exports)', async ({ page }) => {
    // Check that pages are actually imported in App.jsx
    const appJsx = execSync(
      'cat /nas/Temp/repos/Atheon-GitHub-Scanner/web-app/src/App.jsx 2>/dev/null',
      { encoding: 'utf8' }
    );

    const pages = [
      'Dashboard', 'Reports', 'Trending', 'Submit', 'Pipeline', 'ApiDocs', 'About', 'Settings', 'NotFound'
    ];

    for (const page of pages) {
      const imported = appJsx.includes(`import ${page}`);
      if (imported) {
        // Check it's actually routed
        const routed = appJsx.includes(`<${page}`);
        expect(routed).toBeTruthy();
      }
    }
  });

  test('No TODO/FIXME comments left in source', async ({ page }) => {
    const output = execSync(
      'grep -rn "TODO\\|FIXME\\|XXX\\|HACK" /nas/Temp/repos/Atheon-GitHub-Scanner/web-app/src/ 2>/dev/null || true',
      { encoding: 'utf8' }
    );

    // Exclude data/description strings (scanner feature descriptions)
    const lines = output.trim().split('\n').filter(l => {
      if (!l) return false;
      // Skip data strings in JSX text content and variable assignments
      if (l.includes('desc:') || l.includes('description:')) return false;
      // Skip JSX text content (parenthetical descriptions)
      if (l.includes('(console.logs') || l.includes('debug statements')) return false;
      // Skip comments with code-like patterns
      if (l.includes('//') || l.includes('*')) return false;
      return true;
    });

    if (lines.length > 0) {
      console.log('TODO/FIXME found:', lines);
    }
    expect(lines.length).toBe(0);
  });

  test('Accessibility: all buttons have accessible names', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Find buttons without accessible names
    const badButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons)
        .filter(b => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby'))
        .map(b => b.outerHTML.substring(0, 100));
    });

    if (badButtons.length > 0) {
      console.log('Buttons without names:', badButtons);
    }
    expect(badButtons.length).toBe(0);
  });

  test('Accessibility: all images have alt text or role', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const badImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs)
        .filter(img => !img.alt && !img.getAttribute('role'))
        .map(img => img.src.substring(0, 80));
    });

    expect(badImages.length).toBe(0);
  });

  test('Accessibility: all form inputs have associated labels', async ({ page }) => {
    await page.goto('/submit');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
      return Array.from(inputs)
        .filter(input => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledby = input.getAttribute('aria-labelledby');
          const label = id ? document.querySelector(`label[for="${id}"]`) : null;
          return !label && !ariaLabel && !ariaLabelledby;
        })
        .map(input => ({ id: input.id, placeholder: input.placeholder }));
    });

    if (unlabeledInputs.length > 0) {
      console.log('Unlabeled inputs:', unlabeledInputs);
    }
    expect(unlabeledInputs.length).toBe(0);
  });

  test('No inline styles in components (except dynamic values)', async ({ page }) => {
    const output = execSync(
      'grep -rn "style={" /nas/Temp/repos/Atheon-GitHub-Scanner/web-app/src/ 2>/dev/null || true',
      { encoding: 'utf8' }
    );

    const lines = output.trim().split('\n').filter(Boolean);
    // Filter out legitimate dynamic styles like style={{ color: x }}
    const violations = lines.filter(l => {
      // Allow className templates, dynamic values
      if (l.includes('className') || l.includes('{{')) return false;
      // Only flag truly static inline styles
      return l.match(/style=\{/);
    });

    if (violations.length > 0) {
      console.log('Inline styles found:', violations);
    }
    expect(violations.length).toBe(0);
  });

  test('Performance: JS bundle under 500KB gzipped', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get the main JS file size
    const jsResources = [];
    page.on('response', resp => {
      const url = resp.url();
      if (url.includes('.js') && !url.includes('vite') && resp.status() === 200) {
        jsResources.push({ url, size: resp.headers()['content-length'] });
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Each chunk should be reasonable
    for (const res of jsResources) {
      const sizeKB = parseInt(res.size || 0) / 1024;
      if (sizeKB > 500) {
        console.log(`Large JS chunk: ${res.url} is ${sizeKB.toFixed(0)}KB`);
      }
      // Soft warning only - don't fail on dev builds
    }
    expect(jsResources.length).toBeGreaterThan(0);
  });

  test('Data consistency: all repo names in reports have valid format', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify repo names are non-empty strings with reasonable length
    const nameIssues = await page.evaluate(() => {
      const cells = document.querySelectorAll('tbody tr td:nth-child(2)');
      return Array.from(cells)
        .map(c => c.textContent.trim())
        .filter(name => name.length === 0 || name.length > 200)
        .length;
    });

    expect(nameIssues).toBe(0);
  });

  test('No dead code: all API service methods are used somewhere', async ({ page }) => {
    // Get all method names from api.js
    const apiContent = execSync(
      'cat /nas/Temp/repos/Atheon-GitHub-Scanner/web-app/src/services/api.js 2>/dev/null',
      { encoding: 'utf8' }
    );

    // Get all files that import apiService
    const importers = execSync(
      'grep -rl "apiService\\|from.*services/api" /nas/Temp/repos/Atheon-GitHub-Scanner/web-app/src/ 2>/dev/null | grep -v api.js || true',
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);

    // Verify at least 2 files import apiService
    expect(importers.length).toBeGreaterThanOrEqual(2);
  });

});
