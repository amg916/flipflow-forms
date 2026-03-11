'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Form {
  id: string;
  name: string;
}

interface AnalyticsData {
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  stepCompletionRates: Record<string, number>;
  averageTimeToComplete: number;
}

export default function AnalyticsPage() {
  const { currentOrg, loading: authLoading } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch forms
  useEffect(() => {
    if (!currentOrg) return;
    setLoadingForms(true);
    fetch(`${API_URL}/forms?orgId=${currentOrg.id}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setForms(data);
        setLoadingForms(false);
      })
      .catch(() => setLoadingForms(false));
  }, [currentOrg]);

  // Fetch analytics when form selected
  useEffect(() => {
    if (!selectedFormId) {
      setAnalytics(null);
      return;
    }
    setLoadingAnalytics(true);
    fetch(`${API_URL}/analytics/forms/${selectedFormId}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setAnalytics(data);
        setLoadingAnalytics(false);
      })
      .catch(() => setLoadingAnalytics(false));
  }, [selectedFormId]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (authLoading) {
    return <div style={{ padding: 40, color: '#6b7280' }}>Loading...</div>;
  }

  const statCards = analytics
    ? [
        {
          label: 'Total Views',
          value: analytics.totalViews.toLocaleString(),
          color: '#3b82f6',
          icon: '&#9673;',
        },
        {
          label: 'Total Submissions',
          value: analytics.totalSubmissions.toLocaleString(),
          color: '#10b981',
          icon: '&#9745;',
        },
        {
          label: 'Conversion Rate',
          value: `${(analytics.conversionRate * 100).toFixed(1)}%`,
          color: '#8b5cf6',
          icon: '&#9650;',
        },
        {
          label: 'Avg. Time to Complete',
          value: formatTime(analytics.averageTimeToComplete),
          color: '#f59e0b',
          icon: '&#9202;',
        },
      ]
    : [];

  const stepEntries = analytics ? Object.entries(analytics.stepCompletionRates) : [];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Analytics
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Track form performance, submission rates, and completion data.
      </p>

      {/* Form selector */}
      <div style={{ marginBottom: 28 }}>
        <select
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 14,
            backgroundColor: '#ffffff',
            color: '#111827',
            minWidth: 240,
            cursor: 'pointer',
          }}
        >
          <option value="">{loadingForms ? 'Loading forms...' : 'Select a form'}</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {!selectedFormId && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 48,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>&#9641;</div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
            Select a form to view analytics
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            Choose a form from the dropdown to see detailed performance data.
          </p>
        </div>
      )}

      {/* Loading state */}
      {selectedFormId && loadingAnalytics && (
        <div style={{ padding: 40, color: '#6b7280', textAlign: 'center' }}>
          Loading analytics...
        </div>
      )}

      {/* Analytics content */}
      {selectedFormId && !loadingAnalytics && analytics && (
        <>
          {/* Stats cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
              marginBottom: 32,
            }}
          >
            {statCards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: '#ffffff',
                  borderRadius: 10,
                  padding: 24,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                  border: '1px solid #f3f4f6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#6b7280',
                    }}
                  >
                    {card.label}
                  </span>
                  <span
                    style={{ fontSize: 18, opacity: 0.5 }}
                    dangerouslySetInnerHTML={{ __html: card.icon }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: card.color,
                    lineHeight: 1.1,
                  }}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Step completion rates */}
          {stepEntries.length > 0 && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 10,
                padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                border: '1px solid #f3f4f6',
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: 20,
                  marginTop: 0,
                }}
              >
                Step Completion Rates
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {stepEntries.map(([step, rate]) => {
                  const pct = Math.round(rate * 100);
                  return (
                    <div key={step}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                          fontSize: 13,
                        }}
                      >
                        <span style={{ color: '#374151', fontWeight: 500 }}>{step}</span>
                        <span style={{ color: '#6b7280' }}>{pct}%</span>
                      </div>
                      <div
                        style={{
                          height: 10,
                          backgroundColor: '#f3f4f6',
                          borderRadius: 5,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor:
                              pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#ef4444',
                            borderRadius: 5,
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
