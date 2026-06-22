// API Service for Atheon Scanner
// Uses embedded data as primary source for reliable deployed operation

const EMBEDDED_DATA_URL = '/embedded-data.json';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Cache for embedded data
let dataCache = null;
let dataCacheTime = 0;
const CACHE_TTL = 60000; // 60 seconds

async function loadEmbeddedData(signal) {
  const now = Date.now();
  if (dataCache && (now - dataCacheTime) < CACHE_TTL) {
    return dataCache;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  const combinedSignal = signal
    ? AbortSignal.any([controller.signal, signal])
    : controller.signal;
  try {
    const response = await fetch(EMBEDDED_DATA_URL, { signal: combinedSignal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    dataCache = await response.json();
    dataCacheTime = now;
    return dataCache;
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw e;
    return null;
  }
}

class ApiService {
  async request(endpoint, options = {}, signal) {
    const url = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    const combinedSignal = signal
      ? AbortSignal.any([controller.signal, signal])
      : controller.signal;
    const config = {
      ...options,
      signal: combinedSignal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API returned HTML instead of JSON');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timer);
      if (error.name === 'AbortError') throw error;
      // Fall back to embedded data
      return this.handleEmbeddedFallback(endpoint, options, signal);
    }
  }

  async handleEmbeddedFallback(endpoint, options, signal) {
    const data = await loadEmbeddedData(signal);
    if (!data) {
      return { success: false, error: 'No data available' };
    }

    // Route to appropriate embedded data handler
    if (endpoint.startsWith('/api/stats')) {
      return { success: true, data };
    }
    if (endpoint.startsWith('/api/health')) {
      return {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          data_files_found: data.data_files_count,
          total_records: data.total_repositories,
        },
      };
    }
    if (endpoint.startsWith('/api/reports')) {
      const url = new URL(endpoint, 'http://localhost');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const language = url.searchParams.get('language');
      const tier = url.searchParams.get('tier');
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const minScore = parseInt(url.searchParams.get('minScore') || '0');

      let repos = [...(data.recent_scans || [])];
      if (language) repos = repos.filter(r => r.language === language);
      if (tier) repos = repos.filter(r => r.tier === tier);
      if (q) repos = repos.filter(r => (r.name || '').toLowerCase().includes(q) || (r.language || '').toLowerCase().includes(q));
      if (minScore > 0) repos = repos.filter(r => (r.quality_score || 0) >= minScore);

      const total = repos.length;
      const pages = Math.ceil(total / limit);
      const start = (page - 1) * limit;

      return {
        success: true,
        data: {
          reports: repos.slice(start, start + limit),
          repositories: repos.slice(start, start + limit),
          total,
          page,
          perPage: limit,
          limit,
          pages,
        },
      };
    }
    if (endpoint.startsWith('/api/languages')) {
      return {
        success: true,
        data: {
          languages: data.language_distribution,
          top_languages: data.top_languages,
        },
      };
    }
    if (endpoint.startsWith('/api/patterns')) {
      return {
        success: true,
        data: {
          dependency_analysis: data.dependency_stats,
          file_analysis: data.file_stats,
          quality_analysis: data.quality_stats,
        },
      };
    }
    if (endpoint.startsWith('/api/ecosystems')) {
      const ecosystem_comparison = {};
      // Build per-language avg from top_languages array (real computed scores)
      const langScores = {};
      for (const entry of data.top_languages || []) {
        if (entry.language) langScores[entry.language] = entry.avgScore || entry.average_quality_score;
      }
      for (const [lang, count] of Object.entries(data.language_distribution || {})) {
        ecosystem_comparison[lang] = {
          repository_count: count,
          average_quality_score: langScores[lang] ?? data.quality_stats?.average ?? 0,
        };
      }
      return {
        success: true,
        data: {
          ecosystem_comparison,
          total_ecosystems: Object.keys(ecosystem_comparison).length,
        },
      };
    }

    return { success: true, data };
  }

  // Scanner endpoints
  async scanRepository(repoData) {
    return this.request('/api/scan', { method: 'POST', body: JSON.stringify(repoData) });
  }

  async getScanStatus(scanId) {
    return this.request(`/api/scan/${scanId}/status`);
  }

  async getScanResult(scanId) {
    return this.request(`/api/scan/${scanId}/result`);
  }

  async getReports(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params.set(k, v);
    });
    const qs = params.toString();
    return this.request(`/api/reports${qs ? '?' + qs : ''}`);
  }

  async getReportById(reportId) {
    return this.request(`/api/reports/${reportId}`);
  }

  async downloadReport(reportId, format = 'json') {
    return this.request(`/api/reports/${reportId}/download?format=${format}`);
  }

  async getStats() {
    return this.request('/api/stats');
  }

  async getTrending(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/trending?${params}`);
  }

  async searchRepositories(query) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }

  async getCategories() {
    return this.request('/api/categories');
  }

  async getReportsByCategory(category, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/categories/${category}/reports?${params}`);
  }

  async getLanguages() {
    return this.request('/api/languages');
  }

  async getReportsByLanguage(language, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/languages/${language}/reports?${params}`);
  }

  async healthCheck() {
    return this.request('/api/health');
  }

  async getRateLimit() {
    return this.request('/api/rate-limit');
  }

  // Compare multiple reports (by id) — uses embedded data
  async getCompareReports(ids = [], signal) {
    if (!ids || ids.length === 0) return { success: true, data: { reports: [] } };
    const data = await loadEmbeddedData(signal);
    if (!data) return { success: false, error: 'No data' };
    const all = data.recent_scans || [];
    const reports = all.filter((r) => ids.includes(r.id));
    return { success: true, data: { reports, count: reports.length } };
  }

  // Search packages by name/language/tier across the embedded dataset
  async searchPackages(query = '', limit = 8, signal) {
    if (!query || !query.trim()) return { success: true, data: { results: [] } };
    const data = await loadEmbeddedData(signal);
    if (!data) return { success: false, error: 'No data' };
    const q = query.toLowerCase();
    const all = data.recent_scans || [];
    const results = all
      .filter((r) => {
        const name = (r.name || '').toLowerCase();
        const lang = (r.language || '').toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const topics = (r.topics || []).map(t => t.toLowerCase()).join(' ');
        return name.includes(q) || lang.includes(q) || desc.includes(q) || topics.includes(q);
      })
      .slice(0, limit);
    return { success: true, data: { results, total: results.length, query } };
  }
}

export const apiService = new ApiService();
export default apiService;
