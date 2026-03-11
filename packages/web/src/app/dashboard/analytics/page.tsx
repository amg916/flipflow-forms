export default function AnalyticsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Analytics
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
        Track form performance, submission rates, and A/B test results.
      </p>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 48,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>◩</div>
        <p style={{ fontSize: 16, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
          Select a form to view analytics
        </p>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          Choose a form from the Forms page to see detailed performance data.
        </p>
      </div>
    </div>
  );
}
