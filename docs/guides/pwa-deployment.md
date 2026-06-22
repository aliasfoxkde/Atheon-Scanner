# PWA Deployment Guide

Complete guide for deploying the Atheon-Scanner PWA to Cloudflare Pages and Workers.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Cloudflare Setup](#cloudflare-setup)
- [PWA Configuration](#pwa-configuration)
- [Workers Deployment](#workers-deployment)
- [Pages Deployment](#pages-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

1. **Cloudflare Account** - Free tier available
2. **GitHub Account** - For GitHub integration
3. **Domain Name** (optional) - For custom domain

### Required Tools

- **Node.js 18+** - For building the PWA
- **npm or yarn** - Package manager
- **Wrangler** - Cloudflare CLI tool
- **Git** - Version control

### Optional Tools

- **PostgreSQL** - For production database
- **GitHub Token** - For enhanced scanning

## Cloudflare Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler

# Verify installation
wrangler --version
```

### 2. Authenticate with Cloudflare

```bash
# Login to Cloudflare
wrangler login

# This will open a browser for authentication
```

### 3. Create Cloudflare Project

```bash
# Create project directory
mkdir atheon-pwa
cd atheon-pwa

# Initialize project
wrangler init
```

### 4. Configure Project Settings

```bash
# Edit wrangler.toml
nano wrangler.toml
```

Add the following configuration:

```toml
name = "atheon-scanner"
main = "workers/api/scan.worker.js"
compatibility_date = "2024-01-01"

# Environment variables
[vars]
GITHUB_TOKEN = ""
DATABASE_URL = ""

# KV namespace for caching
[[kv_namespaces]]
binding = "CACHE"
id = "atheon_cache"

# D1 database
[[d1_databases]]
binding = "DB"
database_name = "atheon_scanner"
database_id = "your-database-id"

# R2 storage
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "atheon-reports"
```

## PWA Configuration

### 1. Build the PWA

```bash
# Navigate to web-app directory
cd web-app

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Configure PWA Manifest

Create `public/manifest.json`:

```json
{
  "name": "Atheon Scanner",
  "short_name": "Atheon Scanner",
  "description": "Automated GitHub repository scanning and quality analysis",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#4f46e5",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "categories": ["developer-tools", "productivity", "security"],
  "scope": "/",
  "service_worker": "/service-worker.js"
}
```

### 3. Configure Service Worker

Create `public/service-worker.js`:

```javascript
const CACHE_VERSION = 'v1';
const CACHE_NAME = `atheon-scanner-${CACHE_VERSION}`;

// Cache static assets
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/submit',
  '/reports',
  '/api/docs'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 4. Update Build Configuration

Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "pwa:generate": "vite-plugin-pwa"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.20.0",
    "@vitejs/plugin-react": "^4.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

## Workers Deployment

### 1. Deploy API Workers

```bash
# Deploy scan worker
wrangler deploy workers/api/scan.worker.js

# Deploy reports worker
wrangler deploy workers/api/reports.worker.js
```

### 2. Test Workers

```bash
# Test scan worker
curl -X POST https://atheon-scanner.workers.dev/api/scan \
  -H "Content-Type: application/json" \
  -d '{"type":"github","repo":"facebook/react"}'

# Check status
curl https://atheon-scanner.workers.dev/api/scan/analysis-id
```

### 3. Configure Worker Routes

Update `wrangler.toml`:

```toml
# Worker routes
[[routes]]
pattern = "/api/scan"
type = "javascript"
worker = "workers/api/scan.worker.js"

[[routes]]
pattern = "/api/reports"
type = "javascript"
worker = "workers/api/reports.worker.js"
```

## Pages Deployment

### 1. Build for Production

```bash
cd web-app

# Install dependencies
npm install

# Build production bundle
npm run build

# Test build locally
npm run preview
```

### 2. Deploy to Cloudflare Pages

```bash
# Using Wrangler
wrangler pages deploy dist --project-name=atheon-scanner

# Or using Git integration
git add .
git commit -m "Deploy PWA to Cloudflare Pages"
git push origin main
```

### 3. Configure Pages Settings

In Cloudflare Dashboard:

1. Go to **Workers & Pages** → **Pages**
2. Create new project or select existing
3. Connect to GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
   - **Branch**: `main`

### 4. Configure Custom Domain (Optional)

```bash
# Add custom domain
wrangler pages deploy dist --project-name=atheon-scanner --branch=main

# Set custom domain in Cloudflare Dashboard
# Add DNS records and SSL certificates
```

## Environment Configuration

### 1. Set Secrets in Cloudflare

In Cloudflare Dashboard:

1. Go to **Workers & Pages** → **Settings** → **Environment Variables**
2. Add secrets:
   - `GITHUB_TOKEN`: Your GitHub personal access token
   - `DATABASE_URL`: PostgreSQL connection string
   - `ENCRYPTION_KEY`: For data encryption

### 2. Configure Database

```bash
# Create D1 database
wrangler d1 create atheon_scanner atheon_scanner

# Run migrations
wrangler d1 execute atheon_scanner --file=../pkg/database/schema.sql

# Or use Wrangler SQL
wrangler d1 execute atheon_scanner --command="SELECT 1"
```

### 3. Configure KV Namespace

```bash
# Create KV namespace
wrangler kv:namespace create "atheon_cache"

# Bind in wrangler.toml (already configured above)
```

### 4. Configure R2 Bucket

```bash
# Create R2 bucket
wrangler r2 bucket create atheon-reports

# Upload sample reports
wrangler r2 object put atheon-reports/sample-report.md --file=../reports/sample.md
```

## Advanced Configuration

### 1. Configure Analytics

Add analytics to monitor usage:

```javascript
// Add to scan worker
addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/scan')) {
    // Track scan request
    event.waitUntil(analytics.track('scan_request', {
      timestamp: Date.now(),
      userAgent: event.request.headers.get('User-Agent')
    }));
  }
});
```

### 2. Configure Rate Limiting

Add rate limiting to prevent abuse:

```javascript
// Add to scan worker
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];

  // Remove requests older than 1 hour
  const recentRequests = requests.filter(t => now - t < 3600000);

  if (recentRequests.length > 100) {
    return false; // Rate limited
  }

  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}
```

### 3. Configure Caching

Add caching for improved performance:

```javascript
// Cache scan results for 1 hour
const CACHE_TTL = 3600;

async function getFromCache(key) {
  const cached = await CACHE.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  return null;
}

async function setCache(key, value) {
  await CACHE.put(key, JSON.stringify(value), {
    expirationTtl: CACHE_TTL
  });
}
```

## Monitoring

### 1. Cloudflare Analytics

View analytics in Cloudflare Dashboard:
- **Pages Analytics**: Page views, visitors, geography
- **Workers Analytics**: Requests, errors, CPU time
- **R2 Analytics**: Storage usage, requests

### 2. Custom Monitoring

```javascript
// Add monitoring endpoints
export async function onRequestGet(context) {
  const stats = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    scans: await getScanCount(),
    reports: await getReportCount()
  };

  return Response.json(stats);
}
```

### 3. Error Tracking

```javascript
// Add error tracking
addEventListener('error', (event) => {
  console.error('Worker error:', event.error);

  // Send to monitoring service
  fetch('https://monitoring.example.com/error', {
    method: 'POST',
    body: JSON.stringify({
      error: event.error.message,
      stack: event.error.stack,
      timestamp: Date.now()
    })
  });
});
```

## Troubleshooting

### Common Issues

#### Issue: "Build fails with module resolution errors"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Update dependencies
npm update
```

#### Issue: "Worker deployment fails with timeout"

**Solution:**
```bash
# Increase timeout
wrangler deploy --timeout 120
```

#### Issue: "Pages deployment shows 404"

**Solution:**
```bash
# Check build output directory
ls dist/

# Verify wrangler.toml configuration
cat wrangler.toml

# Check Pages logs in Cloudflare Dashboard
```

#### Issue: "Workers return 500 errors"

**Solution:**
```bash
# Check worker logs
wrangler tail

# Test worker locally
wrangler dev
```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Run Wrangler in debug mode
wrangler deploy --loglevel debug

# Test worker locally
wrangler dev --local
```

## Performance Optimization

### 1. Enable Caching

```javascript
// Cache static assets
const cacheConfig = {
  staticCache: 'public, max-age=31536000, immutable',
  apiCache: 'public, max-age=3600'
};
```

### 2. Use Edge Functions

```javascript
// Deploy as edge functions for better performance
export async function onRequestEdge(context) {
  // Edge-optimized code
}
```

### 3. Optimize Bundle Size

```javascript
// In vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
          'router': ['react-router-dom']
        }
      }
    }
  }
});
```

## Security Configuration

### 1. Enable HTTPS Only

```javascript
// Redirect HTTP to HTTPS
if (event.request.url.startsWith('http://')) {
  const httpsUrl = event.request.url.replace('http://', 'https://');
  return Response.redirect(httpsUrl, 301);
}
```

### 2. Add Security Headers

```javascript
// Add security headers
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### 3. Validate Input

```javascript
// Validate repository input
function validateRepo(repo) {
  if (!repo || typeof repo !== 'string') {
    return false;
  }

  const parts = repo.split('/');
  return parts.length === 2 && parts[0] && parts[1];
}
```

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update
npm audit fix

# Update workers
wrangler deploy

# Update Pages
npm run build
wrangler pages deploy dist
```

### 2. Backup Configuration

```bash
# Export configuration
wrangler pages deployment list > deployment-backup.json

# Backup database
wrangler d1 export atheon_scanner backup.sql
```

### 3. Monitor Usage

```bash
# Check analytics
wrangler pages analytics

# Check worker logs
wrangler tail --format pretty
```

## Scaling

### 1. Handle High Traffic

```bash
# Enable Cloudflare auto-scaling
# In Cloudflare Dashboard: Workers & Pages → Settings → Auto-scaling
```

### 2. Database Scaling

```bash
# Check D1 limits (current: 5GB storage, 5M rows read/day)
wrangler d1 info atheon_scanner

# Monitor query performance
wrangler d1 execute atheon_scanner --command="EXPLAIN ANALYZE SELECT 1"
```

### 3. Storage Scaling

```bash
# Check R2 limits and usage
wrangler r2 bucket list

# Monitor storage costs
wrangler r2 bucket usage atheon-reports
```

## Cost Estimation

### Cloudflare Free Tier Limits

- **Workers Requests**: 100,000 requests/day
- **Pages Bandwidth**: 500 builds/month
- **D1 Database**: 5GB storage, 5M rows read/day
- **KV Storage**: 100,000 reads/day, 1,000 writes/day
- **R2 Storage**: 10GB storage, 1M class A operations/month

### Estimated Monthly Costs

- **Free Tier**: $0 (within limits)
- **Paid Tier**: $5-25/month (moderate usage)
- **High Usage**: $50-100/month (heavy scanning)

## Next Steps

After deployment:

1. **Test the application** thoroughly
2. **Set up monitoring** and alerts
3. **Configure custom domain** (optional)
4. **Enable analytics** for insights
5. **Set up CI/CD** for automated deployments

## Support

For deployment issues:
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Project Issues](https://github.com/aliasfoxkde/Atheon-Scanner/issues)

---

**Next Steps:**
- [Technical Architecture](../technical/architecture.md)
- [API Documentation](../api/reference.md)
- [Monitoring Guide](../guides/monitoring.md)