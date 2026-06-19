// API Service for Atheon GitHub Scanner
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Scanner endpoints
  async scanRepository(repoData) {
    return this.request('/api/scan', {
      method: 'POST',
      body: JSON.stringify(repoData),
    });
  }

  async getScanStatus(scanId) {
    return this.request(`/api/scan/${scanId}/status`);
  }

  async getScanResult(scanId) {
    return this.request(`/api/scan/${scanId}/result`);
  }

  // Reports endpoints
  async getReports(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/reports?${params}`);
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

  // Stats and trending
  async getStats() {
    return this.request('/api/stats');
  }

  async getTrending(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/trending?${params}`);
  }

  // Search
  async searchRepositories(query) {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }

  // Categories
  async getCategories() {
    return this.request('/api/categories');
  }

  async getReportsByCategory(category, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/categories/${category}/reports?${params}`);
  }

  // Languages
  async getLanguages() {
    return this.request('/api/languages');
  }

  async getReportsByLanguage(language, filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/languages/${language}/reports?${params}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Rate limit info
  async getRateLimit() {
    return this.request('/api/rate-limit');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export default for cleaner imports
export default apiService;