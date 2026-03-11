import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for FlipFlow Forms. Start free and scale as you grow.',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 2rem',
  maxWidth: 1200,
  margin: '0 auto',
};

const logoStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 800,
  color: '#3b82f6',
  letterSpacing: '-0.02em',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '2rem',
  alignItems: 'center',
  fontSize: '0.95rem',
};

const navLinkStyle: React.CSSProperties = {
  color: '#4b5563',
  fontWeight: 500,
};

const ctaButtonStyle: React.CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#fff',
  padding: '0.75rem 2rem',
  borderRadius: '0.5rem',
  fontWeight: 600,
  fontSize: '1rem',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-block',
  textAlign: 'center',
  width: '100%',
};

const sectionStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '5rem 2rem',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with the basics.',
    features: [
      '1 form',
      '100 submissions / month',
      'Basic form builder',
      'Email notifications',
      'FlipFlow branding',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing teams that need more power.',
    features: [
      'Unlimited forms',
      '5,000 submissions / month',
      'A/B testing',
      'Conditional logic',
      'Webhooks',
      'Analytics dashboard',
      'Remove FlipFlow branding',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/month',
    description: 'For teams operating at scale.',
    features: [
      'Everything in Pro',
      'Unlimited submissions',
      'Custom domains',
      'CRM integrations',
      'TCPA compliance tools',
      'Dedicated account manager',
      'Priority support',
      'SSO / SAML',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const comparisonRows = [
  { feature: 'Forms', free: '1', pro: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Submissions / month', free: '100', pro: '5,000', enterprise: 'Unlimited' },
  { feature: 'Multi-step forms', free: 'Yes', pro: 'Yes', enterprise: 'Yes' },
  { feature: 'Conditional logic', free: '-', pro: 'Yes', enterprise: 'Yes' },
  { feature: 'A/B testing', free: '-', pro: 'Yes', enterprise: 'Yes' },
  { feature: 'Analytics', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
  { feature: 'Webhooks', free: '-', pro: 'Yes', enterprise: 'Yes' },
  { feature: 'CRM integrations', free: '-', pro: '-', enterprise: 'Yes' },
  { feature: 'Custom domain', free: '-', pro: '-', enterprise: 'Yes' },
  { feature: 'Remove branding', free: '-', pro: 'Yes', enterprise: 'Yes' },
  { feature: 'TCPA compliance', free: '-', pro: '-', enterprise: 'Yes' },
  { feature: 'Support', free: 'Community', pro: 'Email', enterprise: 'Priority + Dedicated' },
];

export default function PricingPage() {
  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
        <div style={headerStyle}>
          <a href="/" style={logoStyle}>
            FlipFlow
          </a>
          <nav style={navStyle}>
            <a href="/features" style={navLinkStyle}>
              Features
            </a>
            <a href="/pricing" style={{ ...navLinkStyle, color: '#3b82f6' }}>
              Pricing
            </a>
            <a href="/contact" style={navLinkStyle}>
              Contact
            </a>
            <a
              href="/login"
              style={{
                backgroundColor: '#3b82f6',
                color: '#fff',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Login
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          padding: '5rem 2rem 4rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
          }}
        >
          Simple, Transparent Pricing
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#475569' }}>
          Start free. Upgrade when you need to.
        </p>
      </section>

      {/* Pricing Cards */}
      <section style={sectionStyle}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                backgroundColor: '#fff',
                border: plan.highlighted ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '2.5rem 2rem',
                position: 'relative',
              }}
            >
              {plan.highlighted && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    padding: '0.25rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Most Popular
                </div>
              )}
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: '0.5rem',
                }}
              >
                {plan.name}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                {plan.description}
              </p>
              <div style={{ marginBottom: '2rem' }}>
                <span
                  style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '1rem', marginLeft: '0.25rem' }}>
                  {plan.period}
                </span>
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  marginBottom: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      color: '#475569',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ color: '#3b82f6', fontWeight: 700 }}>{'\u2713'}</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.name === 'Enterprise' ? '/contact' : '/login'}
                style={{
                  ...ctaButtonStyle,
                  backgroundColor: plan.highlighted ? '#3b82f6' : 'transparent',
                  color: plan.highlighted ? '#fff' : '#3b82f6',
                  border: plan.highlighted ? 'none' : '2px solid #3b82f6',
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ ...sectionStyle, paddingTop: '1rem' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '2.5rem',
            color: '#0f172a',
          }}
        >
          Compare Plans
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#fff',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '1rem 1.5rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '1rem 1.5rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Free
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '1rem 1.5rem',
                    fontWeight: 600,
                    color: '#3b82f6',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Pro
                </th>
                <th
                  style={{
                    textAlign: 'center',
                    padding: '1rem 1.5rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.feature}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc',
                  }}
                >
                  <td
                    style={{
                      padding: '0.85rem 1.5rem',
                      color: '#374151',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    {row.feature}
                  </td>
                  {[row.free, row.pro, row.enterprise].map((val, j) => (
                    <td
                      key={j}
                      style={{
                        padding: '0.85rem 1.5rem',
                        textAlign: 'center',
                        color: val === '-' ? '#d1d5db' : '#475569',
                        fontSize: '0.95rem',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            &copy; {new Date().getFullYear()} FlipFlow Forms. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/privacy" style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Privacy
            </a>
            <a href="/terms" style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Terms
            </a>
            <a href="/contact" style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
