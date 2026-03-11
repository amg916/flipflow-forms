'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
}

interface Usage {
  submissions: number;
  submissionsLimit: number;
  validations: number;
  validationsLimit: number;
  forms: number;
  formsLimit: number;
}

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    plan: 'free',
    features: ['Up to 3 forms', '100 submissions/mo', 'Basic validation', 'Email notifications'],
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    plan: 'pro',
    features: [
      'Unlimited forms',
      '10,000 submissions/mo',
      'Advanced validation & A/B testing',
      'Custom branding',
      'Priority support',
      'Analytics dashboard',
    ],
    color: '#3b82f6',
    bg: '#eff6ff',
    border: '#3b82f6',
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/mo',
    plan: 'enterprise',
    features: [
      'Everything in Pro',
      'Unlimited submissions',
      'SSO & advanced security',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Audit logs',
    ],
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#7c3aed',
  },
];

export default function BillingPage() {
  const { currentOrg, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    if (authLoading || !currentOrg) return;

    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const [subRes, usageRes] = await Promise.allSettled([
          fetch(`${API_URL}/billing/subscription/${currentOrg!.id}`, { credentials: 'include' }),
          fetch(`${API_URL}/billing/usage/${currentOrg!.id}`, { credentials: 'include' }),
        ]);

        if (subRes.status === 'fulfilled' && subRes.value.ok) {
          setSubscription(await subRes.value.json());
        } else {
          // No subscription = free plan
          setSubscription({ plan: 'free', status: 'active' });
        }

        if (usageRes.status === 'fulfilled' && usageRes.value.ok) {
          setUsage(await usageRes.value.json());
        }
      } catch {
        setError('Failed to load billing data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentOrg, authLoading]);

  async function handleUpgrade(plan: string) {
    if (!currentOrg) return;
    setActionLoading(plan);
    try {
      const res = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orgId: currentOrg.id, plan }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to start checkout.');
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Failed to start checkout.');
    } finally {
      setActionLoading('');
    }
  }

  async function handleCancel() {
    if (!currentOrg) return;
    setActionLoading('cancel');
    try {
      const res = await fetch(`${API_URL}/billing/cancel/${currentOrg.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to cancel subscription.');
        return;
      }
      setSubscription({ plan: 'free', status: 'canceled' });
      setCancelConfirm(false);
    } catch {
      setError('Failed to cancel subscription.');
    } finally {
      setActionLoading('');
    }
  }

  const sectionStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  };

  if (authLoading || loading) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Billing
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Billing
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>No organization selected.</p>
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Billing</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
        Manage your subscription and view usage for {currentOrg.name}.
      </p>

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            color: '#dc2626',
            fontSize: 14,
          }}
        >
          {error}
          <button
            onClick={() => setError('')}
            style={{
              marginLeft: 12,
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Plan */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
          Current Plan
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color:
                currentPlan === 'free' ? '#6b7280' : currentPlan === 'pro' ? '#3b82f6' : '#7c3aed',
              textTransform: 'capitalize',
            }}
          >
            {currentPlan}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 12,
              backgroundColor: subscription?.status === 'active' ? '#dcfce7' : '#fef3c7',
              color: subscription?.status === 'active' ? '#166534' : '#92400e',
            }}
          >
            {subscription?.status || 'active'}
          </span>
        </div>
        {subscription?.currentPeriodEnd && (
          <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
            Current period ends: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        {currentPlan !== 'free' && subscription?.status === 'active' && (
          <div style={{ marginTop: 16 }}>
            {!cancelConfirm ? (
              <button
                onClick={() => setCancelConfirm(true)}
                style={{
                  background: 'none',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel Subscription
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#dc2626' }}>Are you sure?</span>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading === 'cancel'}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: actionLoading === 'cancel' ? 0.6 : 1,
                  }}
                >
                  {actionLoading === 'cancel' ? 'Canceling...' : 'Yes, Cancel'}
                </button>
                <button
                  onClick={() => setCancelConfirm(false)}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    color: '#6b7280',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  No, Keep It
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage */}
      {usage && (
        <div style={sectionStyle}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
            Usage This Month
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              {
                label: 'Form Submissions',
                value: usage.submissions,
                limit: usage.submissionsLimit,
                color: '#3b82f6',
              },
              {
                label: 'Validations Used',
                value: usage.validations,
                limit: usage.validationsLimit,
                color: '#10b981',
              },
              {
                label: 'Active Forms',
                value: usage.forms,
                limit: usage.formsLimit,
                color: '#8b5cf6',
              },
            ].map((stat) => {
              const pct = stat.limit > 0 ? Math.min((stat.value / stat.limit) * 100, 100) : 0;
              return (
                <div key={stat.label}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
                    {stat.value.toLocaleString()}
                    <span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af' }}>
                      {' '}
                      / {stat.limit > 0 ? stat.limit.toLocaleString() : 'Unlimited'}
                    </span>
                  </div>
                  {stat.limit > 0 && (
                    <div
                      style={{
                        marginTop: 8,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#f3f4f6',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          borderRadius: 3,
                          backgroundColor: pct > 90 ? '#ef4444' : stat.color,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pricing Tiers */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Plans</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {tiers.map((tier) => {
          const isCurrent = currentPlan === tier.plan;
          return (
            <div
              key={tier.plan}
              style={{
                background: tier.bg,
                border: `2px solid ${isCurrent ? tier.color : tier.border}`,
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {isCurrent && (
                <div
                  style={{
                    position: 'absolute',
                    top: -1,
                    right: 16,
                    background: tier.color,
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 10px',
                    borderRadius: '0 0 6px 6px',
                  }}
                >
                  CURRENT
                </div>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, color: tier.color, marginBottom: 4 }}>
                {tier.name}
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>
                  {tier.price}
                </span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>{tier.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
                {tier.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 13,
                      color: '#374151',
                      padding: '4px 0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <span style={{ color: tier.color, fontWeight: 700, flexShrink: 0 }}>
                      &#10003;
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && handleUpgrade(tier.plan)}
                disabled={isCurrent || actionLoading === tier.plan}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: '10px 0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  border: isCurrent ? `1px solid ${tier.color}` : 'none',
                  background: isCurrent ? 'transparent' : tier.color,
                  color: isCurrent ? tier.color : '#ffffff',
                  cursor: isCurrent ? 'default' : 'pointer',
                  opacity: actionLoading === tier.plan ? 0.6 : 1,
                }}
              >
                {actionLoading === tier.plan
                  ? 'Redirecting...'
                  : isCurrent
                    ? 'Current Plan'
                    : 'Upgrade'}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link
          href="/dashboard/settings"
          style={{ fontSize: 13, color: '#6b7280', textDecoration: 'underline' }}
        >
          Back to Settings
        </Link>
      </div>
    </div>
  );
}
