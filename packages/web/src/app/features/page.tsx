import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore FlipFlow Forms features: drag-and-drop form builder, conditional logic, A/B testing, analytics, webhooks, CRM integrations, and more.',
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

const sectionStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '5rem 2rem',
};

const features = [
  {
    icon: '\uD83D\uDEE0\uFE0F',
    title: 'Drag-and-Drop Form Builder',
    description:
      'Build multi-step forms visually with our intuitive editor. Add text fields, dropdowns, radio buttons, file uploads, and more without writing a single line of code. Preview changes in real time as you build.',
  },
  {
    icon: '\u26A1',
    title: 'Conditional Logic Engine',
    description:
      'Create dynamic forms that adapt to user responses. Show, hide, or skip steps based on previous answers so every respondent gets a tailored experience that increases completion rates.',
  },
  {
    icon: '\uD83D\uDCC4',
    title: 'Industry Templates',
    description:
      'Start from pre-built templates for Solar, Insurance, Mortgage, Home Services, and Real Estate. Each template is optimized for conversion based on thousands of real submissions.',
  },
  {
    icon: '\uD83D\uDCCA',
    title: 'Real-Time Analytics',
    description:
      'Track form views, starts, completions, and drop-off rates at every step. Identify bottlenecks and optimize your forms with data, not guesswork.',
  },
  {
    icon: '\uD83E\uDDEA',
    title: 'A/B Testing',
    description:
      'Run controlled experiments across form variations to find the highest-converting version. Split traffic automatically and get statistically significant results fast.',
  },
  {
    icon: '\uD83D\uDD17',
    title: 'Webhooks',
    description:
      'Push lead data to any endpoint in real time when a form is submitted. Configure custom payloads and headers to integrate with your existing backend systems.',
  },
  {
    icon: '\uD83D\uDD04',
    title: 'CRM Integrations',
    description:
      'Connect directly to Salesforce, HubSpot, GoHighLevel, and other popular CRMs. Map form fields to CRM properties and push leads instantly upon submission.',
  },
  {
    icon: '\u2705',
    title: 'Compliance & Consent',
    description:
      'Built-in TCPA consent collection, custom disclaimers, and audit-ready submission logs. Stay compliant with lead generation regulations out of the box.',
  },
  {
    icon: '\uD83C\uDF10',
    title: 'Embeds & Hosting',
    description:
      'Embed forms on any website with a simple script tag, or host them on a FlipFlow subdomain. Responsive by default so they look great on every device.',
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
        <div style={headerStyle}>
          <a href="/" style={logoStyle}>
            FlipFlow
          </a>
          <nav style={navStyle}>
            <a href="/features" style={{ ...navLinkStyle, color: '#3b82f6' }}>
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
          padding: '5rem 2rem 4rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f172a',
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
            }}
          >
            Everything You Need to Capture More Leads
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              color: '#475569',
              lineHeight: 1.7,
            }}
          >
            A complete toolkit for building, testing, and optimizing lead capture forms at scale.
          </p>
        </div>
      </section>

      {/* Features List */}
      <section style={sectionStyle}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '2rem',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: '#0f172a',
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          ...sectionStyle,
          textAlign: 'center',
          paddingTop: '2rem',
        }}
      >
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '1rem',
            color: '#0f172a',
          }}
        >
          Start Building Better Forms Today
        </h2>
        <p
          style={{
            color: '#64748b',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            maxWidth: 480,
            margin: '0 auto 2rem',
          }}
        >
          Free plan available. No credit card required.
        </p>
        <a href="/pricing" style={ctaButtonStyle}>
          View Pricing
        </a>
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
