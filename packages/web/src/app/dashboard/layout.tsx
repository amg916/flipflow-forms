'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardProviders from './providers';
import { useAuth } from '@/lib/auth';

const navItems = [
  { label: 'Forms', href: '/dashboard/forms', icon: '▦' },
  { label: 'Submissions', href: '/dashboard/submissions', icon: '◈' },
  { label: 'Templates', href: '/dashboard/templates', icon: '◫' },
  { label: 'Webhooks', href: '/dashboard/webhooks', icon: '⇌' },
  { label: 'Integrations', href: '/dashboard/integrations', icon: '⬡' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '◩' },
  { label: 'Billing', href: '/dashboard/billing', icon: '▣' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙' },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: '#6b7280',
          fontSize: 15,
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          backgroundColor: '#111827',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1f2937' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#ffffff' }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Flip
              <span style={{ color: '#3b82f6' }}>Flow</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 6,
                color: '#d1d5db',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={undefined}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#f3f4f6' }}>
              {user.name || 'User'}
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#9ca3af',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              fontSize: 16,
              padding: 4,
              lineHeight: 1,
            }}
          >
            &#x2192;
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 240,
          backgroundColor: '#f9fafb',
          minHeight: '100vh',
        }}
      >
        <div style={{ padding: '32px 40px', maxWidth: 1200 }}>{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProviders>
  );
}
