import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'FlipFlow Forms terms of service. Read our terms and conditions.',
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

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Last updated: March 10, 2026</p>

        <p style={paragraphStyle}>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of the FlipFlow
          Forms website, products, and services (the &quot;Service&quot;) provided by FlipFlow Forms
          (&quot;FlipFlow,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing
          or using the Service, you agree to be bound by these Terms. If you do not agree to these
          Terms, do not use the Service.
        </p>

        <h2 style={headingStyle}>1. Eligibility</h2>
        <p style={paragraphStyle}>
          You must be at least 18 years of age and capable of forming a binding contract to use the
          Service. By using the Service, you represent and warrant that you meet these requirements.
          If you are using the Service on behalf of an organization, you represent that you have
          authority to bind that organization to these Terms.
        </p>

        <h2 style={headingStyle}>2. Accounts</h2>
        <p style={paragraphStyle}>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity that occurs under your account. You agree to notify us immediately of any
          unauthorized use of your account. We reserve the right to suspend or terminate accounts
          that violate these Terms.
        </p>

        <h2 style={headingStyle}>3. Acceptable Use</h2>
        <p style={paragraphStyle}>You agree not to use the Service to:</p>
        <ul style={{ ...paragraphStyle, paddingLeft: '1.5rem' }}>
          <li>Violate any applicable law, regulation, or third-party rights</li>
          <li>
            Collect personal information without proper consent or in violation of privacy laws
          </li>
          <li>Transmit spam, malware, or other harmful content</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
          <li>Attempt to gain unauthorized access to the Service or its related systems</li>
          <li>
            Scrape, crawl, or use automated means to access the Service without our written consent
          </li>
          <li>Resell or redistribute the Service without authorization</li>
        </ul>

        <h2 style={headingStyle}>4. Subscription and Billing</h2>
        <p style={paragraphStyle}>
          Some features of the Service require a paid subscription. By subscribing to a paid plan,
          you agree to pay the applicable fees as described on our pricing page. Subscriptions are
          billed on a recurring monthly or annual basis unless you cancel before the next billing
          date. All fees are non-refundable except as expressly stated in these Terms or as required
          by law.
        </p>
        <p style={paragraphStyle}>
          We reserve the right to change our pricing at any time. We will provide at least 30
          days&apos; notice before any price increase takes effect on your account.
        </p>

        <h2 style={headingStyle}>5. Intellectual Property</h2>
        <p style={paragraphStyle}>
          The Service, including all content, features, and functionality, is owned by FlipFlow and
          is protected by copyright, trademark, and other intellectual property laws. You retain
          ownership of any content you create using the Service, including form designs and
          collected data. By using the Service, you grant us a limited license to host, store, and
          process your content as necessary to provide the Service.
        </p>

        <h2 style={headingStyle}>6. Data and Privacy</h2>
        <p style={paragraphStyle}>
          Your use of the Service is also governed by our{' '}
          <a href="/privacy" style={{ color: '#3b82f6' }}>
            Privacy Policy
          </a>
          . You are responsible for ensuring that your use of the Service to collect data from end
          users complies with all applicable privacy laws, including obtaining necessary consents.
          We act as a data processor on your behalf when processing form submission data.
        </p>

        <h2 style={headingStyle}>7. Service Availability</h2>
        <p style={paragraphStyle}>
          We strive to maintain high availability of the Service but do not guarantee uninterrupted
          access. We may perform scheduled maintenance, and the Service may experience occasional
          downtime due to factors beyond our control. We will make reasonable efforts to notify you
          of planned maintenance in advance.
        </p>

        <h2 style={headingStyle}>8. Limitation of Liability</h2>
        <p style={paragraphStyle}>
          To the maximum extent permitted by law, FlipFlow shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of profits or
          revenues, whether incurred directly or indirectly, or any loss of data, use, or goodwill.
          Our total liability for any claim arising out of or relating to these Terms or the Service
          shall not exceed the amount you have paid us in the twelve (12) months preceding the
          claim.
        </p>

        <h2 style={headingStyle}>9. Disclaimer of Warranties</h2>
        <p style={paragraphStyle}>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
          of any kind, either express or implied, including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, and non-infringement. We do not warrant
          that the Service will be error-free, secure, or available at all times.
        </p>

        <h2 style={headingStyle}>10. Termination</h2>
        <p style={paragraphStyle}>
          You may cancel your account at any time through your account settings. We may suspend or
          terminate your access to the Service at any time for violation of these Terms, with or
          without notice. Upon termination, your right to use the Service ceases immediately. We
          will make your data available for export for 30 days following termination, after which it
          may be permanently deleted.
        </p>

        <h2 style={headingStyle}>11. Changes to These Terms</h2>
        <p style={paragraphStyle}>
          We may update these Terms from time to time. We will notify you of material changes by
          posting the updated Terms on this page and updating the &quot;Last updated&quot; date.
          Your continued use of the Service after changes are posted constitutes acceptance of the
          updated Terms. If you do not agree to the updated Terms, you must stop using the Service.
        </p>

        <h2 style={headingStyle}>12. Governing Law</h2>
        <p style={paragraphStyle}>
          These Terms shall be governed by and construed in accordance with the laws of the State of
          Delaware, United States, without regard to its conflict of law provisions. Any disputes
          arising under these Terms shall be resolved in the state or federal courts located in
          Delaware.
        </p>

        <h2 style={headingStyle}>13. Contact Us</h2>
        <p style={paragraphStyle}>If you have questions about these Terms, please contact us at:</p>
        <p style={paragraphStyle}>
          FlipFlow Forms
          <br />
          Email: legal@flipflowforms.com
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
            <a href="/privacy" style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Privacy
            </a>
            <a href="/terms" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500 }}>
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
