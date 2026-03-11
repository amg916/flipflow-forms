'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const PLACEHOLDER_ORG_ID = 'org_placeholder';

interface Form {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  updatedAt: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await fetch(`${API_URL}/forms?orgId=${PLACEHOLDER_ORG_ID}`);
        if (res.ok) {
          const data = await res.json();
          setForms(data);
        }
      } catch {
        // API not available yet — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchForms();
  }, []);

  const filtered = forms.filter((f) => f.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Forms</h1>
        <Link
          href="/dashboard/forms/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Create Form
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search forms by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '10px 14px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            color: '#111827',
            backgroundColor: '#ffffff',
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading forms...</p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 48,
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 16 }}>
            {forms.length === 0
              ? 'No forms yet. Create your first form to get started.'
              : 'No forms match your search.'}
          </p>
          {forms.length === 0 && (
            <Link
              href="/dashboard/forms/new"
              style={{
                display: 'inline-flex',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                padding: '10px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create Your First Form
            </Link>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((form) => (
            <Link
              key={form.id}
              href={`/dashboard/forms/${form.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#111827',
                      margin: 0,
                    }}
                  >
                    {form.title}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: form.published ? '#d1fae5' : '#f3f4f6',
                      color: form.published ? '#065f46' : '#6b7280',
                    }}
                  >
                    {form.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {form.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      marginBottom: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {form.description}
                  </p>
                )}
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  Updated {new Date(form.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
