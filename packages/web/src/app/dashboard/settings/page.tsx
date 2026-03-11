import Link from 'next/link';

const teamMembers = [
  { name: 'Admin User', email: 'admin@example.com', role: 'Owner' },
  { name: 'Team Member', email: 'member@example.com', role: 'Editor' },
];

export default function SettingsPage() {
  const sectionStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  };

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 16,
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Settings</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
        Manage your organization, team, and billing preferences.
      </p>

      {/* Organization */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Organization</h2>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 6,
            }}
          >
            Organization Name
          </label>
          <div
            style={{
              padding: '10px 14px',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              fontSize: 14,
              color: '#111827',
              backgroundColor: '#f9fafb',
            }}
          >
            My Organization
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Team Members</h2>
        <div>
          {teamMembers.map((member) => (
            <div
              key={member.email}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{member.name}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{member.email}</div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '2px 10px',
                  borderRadius: 12,
                  backgroundColor: member.role === 'Owner' ? '#dbeafe' : '#f3f4f6',
                  color: member.role === 'Owner' ? '#1e40af' : '#6b7280',
                }}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Billing</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Manage your subscription and payment methods.
        </p>
        <Link
          href="/dashboard/billing"
          style={{
            display: 'inline-flex',
            backgroundColor: '#ffffff',
            color: '#3b82f6',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid #3b82f6',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Manage Billing
        </Link>
      </div>
    </div>
  );
}
