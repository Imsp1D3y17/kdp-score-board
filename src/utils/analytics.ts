/**
 * Client-Side SaaS Analytics & Event Telemetry Engine
 * Tracks user engagement, funnel conversions, and connects to server analytics
 * + optional Google Analytics 4 (VITE_GA_MEASUREMENT_ID)
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  sessionId: string;
}

// Generate or retrieve persistent anonymous session ID
function getSessionId(): string {
  try {
    let id = localStorage.getItem('kdp_session_id');
    if (!id) {
      id = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem('kdp_session_id', id);
    }
    return id;
  } catch {
    return 'sess_temp_' + Math.random().toString(36).substring(2, 9);
  }
}

// Global in-memory buffer for immediate UI queries
const localEventsBuffer: AnalyticsEvent[] = [];

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  const eventData: AnalyticsEvent = {
    event: eventName,
    properties: {
      ...properties,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
    },
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  // 1. Keep local buffer for instant display
  localEventsBuffer.unshift(eventData);
  if (localEventsBuffer.length > 50) {
    localEventsBuffer.pop();
  }

  // 2. Transmit to server analytics endpoint asynchronously
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    }).catch(() => {
      // Ignore network errors silently to avoid disturbing the user
    });
  } catch {
    // Silent catch
  }

  // 3. Optional Google Analytics 4 integration if configured
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', eventName, properties);
    } catch {
      // Silent catch
    }
  }
}

// Google Analytics 4 Measurement ID
export const GA_MEASUREMENT_ID = (import.meta as any).env?.VITE_GA_MEASUREMENT_ID || 'G-VBNRRJD3KY';

// Initialize Google Analytics 4 if not already mounted via index.html
if (typeof window !== 'undefined' && !(window as any).gtag && GA_MEASUREMENT_ID) {
  if (!(window as any)._gaInitialized) {
    (window as any)._gaInitialized = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    `;
    document.head.appendChild(inlineScript);
  }
}

export function getLocalEvents(): AnalyticsEvent[] {
  return [...localEventsBuffer];
}
