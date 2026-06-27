/**
 * Sitemap Generator for Atheon Scanner
 * Auto-generates sitemap.xml during build
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://atheon-scanner.pages.dev';

const routes = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/dashboard', changefreq: 'daily', priority: '0.9' },
  { loc: '/reports', changefreq: 'daily', priority: '0.9' },
  { loc: '/submit', changefreq: 'weekly', priority: '0.7' },
  { loc: '/trending', changefreq: 'daily', priority: '0.8' },
  { loc: '/pipeline', changefreq: 'weekly', priority: '0.6' },
  { loc: '/settings', changefreq: 'monthly', priority: '0.3' },
  { loc: '/about', changefreq: 'monthly', priority: '0.4' },
  { loc: '/api', changefreq: 'weekly', priority: '0.6' },
];

function generateSitemap() {
  const urlEntries = routes
    .map(
      (route) => `  <url>
    <loc>${BASE_URL}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

  const distDir = join(process.cwd(), 'dist');
  const sitemapPath = join(distDir, 'sitemap.xml');

  try {
    mkdirSync(distDir, { recursive: true });
    writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`Sitemap generated: ${sitemapPath}`);
  } catch (error) {
    console.error(`Failed to write sitemap: ${error.message}`);
    process.exit(1);
  }
}

generateSitemap();
