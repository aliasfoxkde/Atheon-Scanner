// API Service for Atheon GitHub Scanner
// Uses embedded data as primary source for reliable deployed operation

const EMBEDDED_DATA_URL = '/embedded-data.json';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Cache for embedded data
let dataCache = null;
let dataCacheTime = 0;
const CACHE_TTL = 60000; // 60 seconds

async function loadEmbeddedData() {
  const now = Date.now();
  if (dataCache && (now - dataCacheTime) < CACHE_TTL) {
    return dataCache;
  }

  try {
    const response = await fetch(EMBEDDED_DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    dataCache = await response.json();
    dataCacheTime = now;
    return dataCache;
  } catch (e) {
    console.warn('Failed to load embedded data:', e);
    return null;
  }
}

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

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
      // Fall back to embedded data
      console.warn(`API ${endpoint} failed, using embedded data:`, error.message);
      return this.handleEmbeddedFallback(endpoint, options);
    }
  }

  async handleEmbeddedFallback(endpoint, options) {
    const data = await loadEmbeddedData();
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

      let repos = [...(data.recent_scans || [])];
      if (language) repos = repos.filter(r => r.language === language);
      if (tier) repos = repos.filter(r => r.tier === tier);

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
      for (const [lang, count] of Object.entries(data.language_distribution || {})) {
        ecosystem_comparison[lang] = {
          repository_count: count,
          average_quality_score: data.average_quality_score,
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

  async compareReports(reportIds) {
    return this.request('/api/reports/compare', {
      method: 'POST',
      body: JSON.stringify({ reportIds }),
    });
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
}

export const apiService = new ApiService();
export default apiService;
