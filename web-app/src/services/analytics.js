// Analytics Service for PWA
class AnalyticsService {
  constructor() {
    this.events = [];
    this.enabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.userId = this.getUserId();
    this.sessionId = this.getSessionId();
  }

  // Get or generate user ID
  getUserId() {
    let userId = localStorage.getItem('atheon_user_id');
    if (!userId) {
      userId = this.generateId();
      localStorage.setItem('atheon_user_id', userId);
    }
    return userId;
  }

  // Get or generate session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('atheon_session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('atheon_session_id', sessionId);
    }
    return sessionId;
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Track page view
  trackPageView(pageName, properties = {}) {
    if (!this.enabled) return;

    const event = {
      type: 'pageview',
      page: pageName,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track user action
  trackAction(actionName, properties = {}) {
    if (!this.enabled) return;

    const event = {
      type: 'action',
      action: actionName,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: {
        ...properties,
        page: window.location.pathname,
        referrer: document.referrer
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track error
  trackError(error, context = {}) {
    if (!this.enabled) return;

    const event = {
      type: 'error',
      error: error.message || error,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: {
        ...context,
        stack: error.stack,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track performance
  trackPerformance(metricName, value, properties = {}) {
    if (!this.enabled) return;

    const event = {
      type: 'performance',
      metric: metricName,
      value: value,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track API call
  trackApiCall(endpoint, duration, success, properties = {}) {
    if (!this.enabled) return;

    const event = {
      type: 'api_call',
      endpoint: endpoint,
      duration: duration,
      success: success,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      properties: {
        ...properties,
        method: properties.method || 'GET'
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Send event to analytics endpoint
  async sendEvent(event) {
    if (!this.enabled) return;

    try {
      // Try to send to analytics API
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        console.warn('Analytics send failed:', await response.text());
      }
    } catch (error) {
      // Store for later if offline
      console.log('Analytics event stored (offline):', event);
      this.storeOfflineEvent(event);
    }
  }

  // Store event for later transmission
  storeOfflineEvent(event) {
    let offlineEvents = JSON.parse(localStorage.getItem('atheon_offline_events') || '[]');
    offlineEvents.push(event);

    // Limit offline storage to prevent overflow
    if (offlineEvents.length > 100) {
      offlineEvents = offlineEvents.slice(-100);
    }

    localStorage.setItem('atheon_offline_events', JSON.stringify(offlineEvents));
  }

  // Send offline events when back online
  async flushOfflineEvents() {
    const offlineEvents = JSON.parse(localStorage.getItem('atheon_offline_events') || '[]');

    for (const event of offlineEvents) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        console.warn('Failed to send offline event:', error);
        return; // Stop if still failing
      }
    }

    // Clear offline events if all sent successfully
    localStorage.removeItem('atheon_offline_events');
  }

  // Get analytics summary
  getSummary() {
    return {
      totalEvents: this.events.length,
      userId: this.userId,
      sessionId: this.sessionId,
      eventTypes: this.events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  // Clear all tracked events
  clearEvents() {
    this.events = [];
  }

  // Export events for debugging
  exportEvents() {
    return JSON.stringify(this.events, null, 2);
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Export default for cleaner imports
export default analyticsService;