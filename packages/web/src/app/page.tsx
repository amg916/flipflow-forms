import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlipFlow Forms — Build High-Converting Lead Forms in Minutes',
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
  fontSize: '1.05rem',
  border: 'none',
  cursor: 'pointer',
  display: 'inline-block',
  textAlign: 'center',
};

const ctaButtonOutlineStyle: React.CSSProperties = {
  ...ctaButtonStyle,
  backgroundColor: 'transparent',
  color: '#3b82f6',
  border: '2px solid #3b82f6',
};

const sectionStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '5rem 2rem',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '0.75rem',
  padding: '2rem',
};

const footerStyle: React.CSSProperties = {
  borderTop: '1px solid #e5e7eb',
  padding: '3rem 2rem',
  maxWidth: 1200,
  margin: '0 auto',
};

const features = [
  {
    icon: '\u2B50',
    title: 'Multi-Step Forms',
    description:
      'Break long forms into digestible steps. Increase completion rates by up to 300% with guided multi-step flows.',
  },
  {
    icon: '\u26A1',
    title: 'Conditional Logic',
    description:
      'Show or hide fields dynamically based on user answers. Deliver a personalized experience every time.',
  },
  {
    icon: '\uD83D\uDCC8',
    title: 'A/B Testing',
    description:
      'Test different form variations to find the highest-converting version. Data-driven optimization built in.',
  },
];

const verticals = [
  { name: 'Solar', icon: '\u2600\uFE0F' },
  { name: 'Insurance', icon: '\uD83D\uDEE1\uFE0F' },
  { name: 'Mortgage', icon: '\uD83C\uDFE0' },
  { name: 'Home Services', icon: '\uD83D\uDD27' },
  { name: 'Real Estate', icon: '\uD83C\uDFE2' },
];

export default function HomePage() {
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
            <a href="/pricing" style={navLinkStyle}>
              Pricing
            </a>
            <a href="/contact" style={navLinkStyle}>
              Contact
            </a>
            <a
              href="/login"
              style={{
                ...ctaButtonStyle,
                padding: '0.5rem 1.25rem',
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
          padding: '6rem 2rem 5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '3.25rem',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f172a',
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Build High-Converting Lead Forms in Minutes
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: '#475569',
              maxWidth: 600,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Multi-step forms with conditional logic, A/B testing, and powerful integrations.
            Designed for lead generation teams in Solar, Insurance, Mortgage, and more.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/pricing" style={ctaButtonStyle}>
              Start Free Trial
            </a>
            <a href="/features" style={ctaButtonOutlineStyle}>
              See All Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={sectionStyle}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '0.75rem',
            color: '#0f172a',
          }}
        >
          Why Teams Choose FlipFlow
        </h2>
        <p
          style={{
            textAlign: 'center',
            color: '#64748b',
            marginBottom: '3rem',
            fontSize: '1.1rem',
          }}
        >
          Everything you need to capture, qualify, and convert more leads.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map((feature) => (
            <div key={feature.title} style={cardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                  color: '#0f172a',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: '#64748b', lineHeight: 1.7 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section
        style={{
          backgroundColor: '#fff',
          borderTop: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={sectionStyle}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '0.75rem',
              color: '#0f172a',
            }}
          >
            Built for Lead Generation
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#64748b',
              marginBottom: '3rem',
              fontSize: '1.1rem',
            }}
          >
            Purpose-built templates and workflows for high-volume verticals.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            {verticals.map((v) => (
              <div
                key={v.name}
                style={{
                  ...cardStyle,
                  textAlign: 'center',
                  minWidth: 160,
                  flex: '0 1 180px',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{v.icon}</div>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{v.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ ...sectionStyle, textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#0f172a',
          }}
        >
          Ready to Capture More Leads?
        </h2>
        <p
          style={{
            color: '#64748b',
            fontSize: '1.15rem',
            marginBottom: '2rem',
            maxWidth: 500,
            margin: '0 auto 2rem',
          }}
        >
          Start building high-converting forms today. No credit card required.
        </p>
        <a href="/pricing" style={ctaButtonStyle}>
          Get Started Free
        </a>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#fff', borderTop: '1px solid #e5e7eb' }}>
        <div style={footerStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2rem',
            }}
          >
            <div>
              <div style={{ ...logoStyle, marginBottom: '0.5rem' }}>FlipFlow</div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                High-performance lead form builder.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase' as const,
                    color: '#94a3b8',
                    letterSpacing: '0.05em',
                  }}
                >
                  Product
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="/features" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Features
                  </a>
                  <a href="/pricing" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Pricing
                  </a>
                  <a href="/contact" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Contact
                  </a>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase' as const,
                    color: '#94a3b8',
                    letterSpacing: '0.05em',
                  }}
                >
                  Legal
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <a href="/privacy" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Privacy Policy
                  </a>
                  <a href="/terms" style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb',
              color: '#94a3b8',
              fontSize: '0.85rem',
            }}
          >
            &copy; {new Date().getFullYear()} FlipFlow Forms. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
