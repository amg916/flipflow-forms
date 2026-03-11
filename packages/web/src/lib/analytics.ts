import type { AnalyticsEventType } from '@flipflow/shared';

const EVENT_BUFFER: Array<Record<string, unknown>> = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('ff_sid');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('ff_sid', sid);
  }
  return sid;
}

function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const val = params.get(key);
    if (val) utm[key.replace('utm_', 'utmSource').length ? key : key] = val;
  }
  return {
    ...(params.get('utm_source') && { utmSource: params.get('utm_source')! }),
    ...(params.get('utm_medium') && { utmMedium: params.get('utm_medium')! }),
    ...(params.get('utm_campaign') && { utmCampaign: params.get('utm_campaign')! }),
  };
}

export function trackEvent(
  type: AnalyticsEventType,
  formId: string,
  extra?: { stepId?: string; questionId?: string; variantId?: string },
) {
  EVENT_BUFFER.push({
    type,
    formId,
    sessionId: getSessionId(),
    ...getUtmParams(),
    ...extra,
    timestamp: new Date().toISOString(),
  });

  // Batch flush every 2 seconds
  if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, 2000);
  }
}

async function flushEvents() {
  flushTimer = null;
  if (EVENT_BUFFER.length === 0) return;

  const events = EVENT_BUFFER.splice(0, EVENT_BUFFER.length);
  try {
    await fetch(`${API_URL}/analytics/track/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch {
    // Non-blocking — analytics should never break the form
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}
