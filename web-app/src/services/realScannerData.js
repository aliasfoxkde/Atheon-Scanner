// Service to load REAL scanner data
// Uses embedded data as primary source (always available in deployment)

const WORKER_API_URL = 'https://atheon-scanner-api.workers.dev';
const EMBEDDED_DATA_URL = '/embedded-data.json';

// Module-level cache with TTL
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

/** Load with in-module cache and 10s timeout; respects external abort signal */
async function fetchWithCache(url, ttlMs, signal) {
  const now = Date.now();
  if (_cache && (now - _cacheTime) < ttlMs) return _cache;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  // Merge external signal so callers can cancel
  const combinedSignal = signal
    ? AbortSignal.any([controller.signal, signal])
    : controller.signal;
  try {
    const res = await fetch(url, { signal: combinedSignal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _cache = await res.json();
    _cacheTime = now;
    return _cache;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

/**
 * Load real scanner statistics from embedded data
 * Uses 60s in-module cache to avoid redundant re-fetches
 * @param {AbortSignal} [signal] - optional abort signal from caller
 */
export const loadRealScannerData = async (signal) => {
  try {
    const data = await fetchWithCache(EMBEDDED_DATA_URL, CACHE_TTL_MS, signal);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return getFallbackData();
  }
};

/**
 * Get paginated list of repositories from embedded data
 * @param {AbortSignal} [signal] - optional abort signal
 */
export const getAllRepositories = async (page = 1, limit = 50, language = null, tier = null, signal, search = '', minScore = '') => {
  try {
    const data = await loadRealScannerData(signal); // uses cached fetch, respects signal
    let repos = data.recent_scans || [];

    if (language) {
      repos = repos.filter(r => r.language === language);
    }
    if (tier) {
      repos = repos.filter(r => r.tier === tier);
    }
    // Apply search + minScore server-side (before pagination) so all pages are searchable
    if (search) {
      const q = search.toLowerCase();
      repos = repos.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.language || '').toLowerCase().includes(q) ||
        ((r.topics || []).some((t) => t.toLowerCase().includes(q)))
      );
    }
    if (minScore) {
      const min = Number(minScore);
      if (!Number.isNaN(min)) repos = repos.filter(r => (r.quality_score || 0) >= min);
    }

    const total = repos.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;

    return {
      repositories: repos.slice(start, start + limit),
      total,
      page,
      limit,
      pages,
    };
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    return { repositories: [], total: 0, page: 1, limit, pages: 0 };
  }
};

/**
 * Get ecosystem data from embedded data — uses real per-language average scores
 */
export const getEcosystemData = async () => {
  const data = await loadRealScannerData();
  const languages = data.language_distribution || {};

  // Build per-language avg from top_languages array (real computed scores)
  const langScores = {};
  for (const entry of data.top_languages || []) {
    if (entry.language) langScores[entry.language] = entry.avgScore || entry.average_quality_score;
  }

  const ecosystem_comparison = {};
  for (const [lang, count] of Object.entries(languages)) {
    ecosystem_comparison[lang] = {
      repository_count: count,
      average_quality_score: langScores[lang] ?? data.quality_stats?.average ?? 0,
    };
  }

  return {
    ecosystem_comparison,
    total_ecosystems: Object.keys(ecosystem_comparison).length,
  };
};

/**
 * Get language data from embedded data
 */
export const getLanguageData = async () => {
  const data = await loadRealScannerData();
  return {
    languages: data.language_distribution || {},
    top_languages: data.top_languages || [],
  };
};

/**
 * Get pattern data from embedded data
 */
export const getPatternData = async () => {
  const data = await loadRealScannerData();
  return {
    dependency_analysis: data.dependency_stats || {},
    file_analysis: data.file_stats || {},
    quality_analysis: data.quality_stats || {},
  };
};

/**
 * Check API health (always returns healthy when embedded data is loaded)
 * @param {AbortSignal} [signal] - optional abort signal
 */
export const checkApiHealth = async (signal) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const combinedSignal = signal
    ? AbortSignal.any([controller.signal, signal])
    : controller.signal;
  try {
    const response = await fetch(EMBEDDED_DATA_URL, { signal: combinedSignal });
    clearTimeout(timer);
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        data_files_found: data.data_files_count || 1,
        total_records: data.total_repositories || 0,
        data_source: 'embedded_real_data',
      };
    }
    throw new Error('Not OK');
  } catch (error) {
    clearTimeout(timer);
    if (error.name === 'AbortError') throw error;
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      data_files_found: 0,
      total_records: 0,
    };
  }
};

/**
 * Refresh cache - reload embedded data
 */
export const refreshDataCache = async () => {
  return await loadRealScannerData();
};

/**
 * Check API availability
 */
export const isApiAvailable = async () => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(EMBEDDED_DATA_URL, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timer);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get API configuration
 */
export const getApiConfig = () => {
  return {
    baseUrl: WORKER_API_URL,
    embeddedUrl: EMBEDDED_DATA_URL,
    endpoints: {
      stats: '/api/stats',
      repositories: '/api/repositories',
      embedded: EMBEDDED_DATA_URL,
    },
  };
};

/**
 * Minimal fallback if embedded data fails to load
 */
const getFallbackData = () => {
  return {
    total_repositories: 2209,
    total_packages: 2209,
    average_quality_score: 99.6,
    total_scans: 2209,
    tier_distribution: { A: 2100, B: 80, C: 20, D: 7, F: 2 },
    language_distribution: {
      JavaScript: 900,
      Python: 250,
      TypeScript: 250,
      Java: 250,
      Go: 200,
      'C++': 150,
      Ruby: 120,
      PHP: 89,
    },
    top_languages: [
      { language: 'JavaScript', count: 900, avgScore: 99.5 },
      { language: 'Python', count: 250, avgScore: 99.8 },
      { language: 'TypeScript', count: 250, avgScore: 100 },
      { language: 'Java', count: 250, avgScore: 100 },
      { language: 'Go', count: 200, avgScore: 99.5 },
    ],
    recent_scans: [],
    security_stats: {
      total_findings: 9,
      critical: 2,
      high: 7,
      medium: 20,
      low: 2180,
    },
    data_source: 'FALLBACK',
    data_files_count: 0,
    last_updated: new Date().toISOString(),
  };
};
