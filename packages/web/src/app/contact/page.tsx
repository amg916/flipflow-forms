import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the FlipFlow Forms team. We are here to help.',
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  fontSize: '1rem',
  lineHeight: 1.6,
  color: '#1a1a1a',
  backgroundColor: '#fff',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.9rem',
  color: '#374151',
  marginBottom: '0.5rem',
};

export default function ContactPage() {
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
            <a href="/contact" style={{ ...navLinkStyle, color: '#3b82f6' }}>
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

      {/* Content */}
      <section
        style={{
          maxWidth: 640,
          margin: '0 auto',
          padding: '5rem 2rem',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.75rem',
            letterSpacing: '-0.03em',
          }}
        >
          Contact Us
        </h1>
        <p
          style={{
            color: '#64748b',
            fontSize: '1.1rem',
            marginBottom: '3rem',
            lineHeight: 1.7,
          }}
        >
          Have a question, need a demo, or want to discuss an Enterprise plan? Fill out the form
          below and we will get back to you within one business day.
        </p>

        <form
          action="#"
          method="POST"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div>
            <label htmlFor="name" style={labelStyle}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="message" style={labelStyle}>
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              placeholder="Tell us how we can help..."
              required
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              padding: '0.85rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '1.05rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Send Message
          </button>
        </form>

        <div
          style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb',
            color: '#64748b',
            fontSize: '0.95rem',
            lineHeight: 1.7,
          }}
        >
          <p>
            <strong style={{ color: '#374151' }}>Email:</strong> support@flipflowforms.com
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong style={{ color: '#374151' }}>Office Hours:</strong> Monday - Friday, 9am - 6pm
            EST
          </p>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
