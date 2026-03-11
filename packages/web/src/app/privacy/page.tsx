import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'FlipFlow Forms privacy policy. Learn how we collect, use, and protect your data.',
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

const contentStyle: React.CSSProperties = {
  maxWidth: 800,
  margin: '0 auto',
  padding: '4rem 2rem',
};

const headingStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#0f172a',
  marginTop: '2.5rem',
  marginBottom: '1rem',
};

const paragraphStyle: React.CSSProperties = {
  color: '#475569',
  lineHeight: 1.8,
  marginBottom: '1rem',
  fontSize: '0.95rem',
};

export default function PrivacyPage() {
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

      <div style={contentStyle}>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '0.5rem',
            letterSpacing: '-0.03em',
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Last updated: March 10, 2026</p>

        <p style={paragraphStyle}>
          FlipFlow Forms (&quot;FlipFlow,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
          is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our website, products, and services
          (collectively, the &quot;Service&quot;).
        </p>

        <h2 style={headingStyle}>1. Information We Collect</h2>
        <p style={paragraphStyle}>
          <strong>Account Information:</strong> When you create an account, we collect your name,
          email address, company name, and password. If you subscribe to a paid plan, we collect
          billing information through our third-party payment processor.
        </p>
        <p style={paragraphStyle}>
          <strong>Form Submission Data:</strong> When end users submit data through forms created by
          our customers, that data is collected and stored on behalf of the form owner. We process
          this data as a data processor on behalf of our customers (the data controllers).
        </p>
        <p style={paragraphStyle}>
          <strong>Usage Data:</strong> We automatically collect information about how you interact
          with the Service, including IP address, browser type, device information, pages viewed,
          and actions taken within the platform.
        </p>
        <p style={paragraphStyle}>
          <strong>Cookies:</strong> We use cookies and similar tracking technologies to maintain
          sessions, remember preferences, and analyze usage patterns. You can control cookie
          settings through your browser.
        </p>

        <h2 style={headingStyle}>2. How We Use Your Information</h2>
        <p style={paragraphStyle}>We use the information we collect to:</p>
        <ul style={{ ...paragraphStyle, paddingLeft: '1.5rem' }}>
          <li>Provide, operate, and maintain the Service</li>
          <li>Process transactions and send related information</li>
          <li>Send administrative notifications, such as security alerts and support messages</li>
          <li>Respond to your comments, questions, and customer service requests</li>
          <li>Monitor and analyze usage trends to improve the Service</li>
          <li>Detect, prevent, and address technical issues and fraud</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 style={headingStyle}>3. How We Share Your Information</h2>
        <p style={paragraphStyle}>
          We do not sell your personal information. We may share information with third-party
          service providers that perform services on our behalf, such as payment processing, data
          hosting, email delivery, and analytics. These providers are contractually obligated to use
          your data only to provide services to us and to maintain appropriate security measures.
        </p>
        <p style={paragraphStyle}>
          We may disclose your information if required by law, regulation, legal process, or
          governmental request, or when we believe disclosure is necessary to protect our rights,
          your safety, or the safety of others.
        </p>

        <h2 style={headingStyle}>4. Data Retention</h2>
        <p style={paragraphStyle}>
          We retain your account information for as long as your account is active or as needed to
          provide the Service. Form submission data is retained in accordance with the data
          retention settings configured by the form owner. When you delete your account, we will
          delete or anonymize your personal data within 30 days, except where retention is required
          by law.
        </p>

        <h2 style={headingStyle}>5. Data Security</h2>
        <p style={paragraphStyle}>
          We implement appropriate technical and organizational measures to protect your
          information, including encryption in transit (TLS) and at rest, access controls, and
          regular security audits. However, no method of transmission over the Internet or
          electronic storage is completely secure, and we cannot guarantee absolute security.
        </p>

        <h2 style={headingStyle}>6. Your Rights</h2>
        <p style={paragraphStyle}>
          Depending on your jurisdiction, you may have the right to access, correct, delete, or port
          your personal data, as well as the right to object to or restrict certain processing. To
          exercise these rights, please contact us at privacy@flipflowforms.com. We will respond
          within 30 days.
        </p>

        <h2 style={headingStyle}>7. Children&apos;s Privacy</h2>
        <p style={paragraphStyle}>
          The Service is not directed to individuals under the age of 16. We do not knowingly
          collect personal information from children. If we become aware that we have collected
          personal data from a child, we will take steps to delete that information promptly.
        </p>

        <h2 style={headingStyle}>8. Changes to This Policy</h2>
        <p style={paragraphStyle}>
          We may update this Privacy Policy from time to time. We will notify you of any material
          changes by posting the updated policy on this page and updating the &quot;Last
          updated&quot; date. Your continued use of the Service after changes are posted constitutes
          acceptance of the updated policy.
        </p>

        <h2 style={headingStyle}>9. Contact Us</h2>
        <p style={paragraphStyle}>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p style={paragraphStyle}>
          FlipFlow Forms
          <br />
          Email: privacy@flipflowforms.com
          <br />
          Web:{' '}
          <a href="/contact" style={{ color: '#3b82f6' }}>
            flipflowforms.com/contact
          </a>
        </p>
      </div>

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
            <a href="/privacy" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500 }}>
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
