import Link from 'next/link';

const stats = [
  { label: 'Total Forms', value: '12', color: '#3b82f6' },
  { label: 'Total Submissions', value: '1,847', color: '#10b981' },
  { label: 'Active A/B Tests', value: '3', color: '#8b5cf6' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Welcome back
      </h1>
      <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>
        Here&apos;s an overview of your forms and submissions.
      </p>

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 40,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard/forms/new"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          textDecoration: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        + Create New Form
      </Link>
    </div>
  );
}
