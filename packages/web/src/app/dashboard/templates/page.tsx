'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const VERTICALS = ['All', 'Solar', 'Insurance', 'Mortgage', 'Home Services', 'Real Estate'];

interface Template {
  id: string;
  name: string;
  description: string | null;
  vertical: string;
}

const verticalColors: Record<string, { bg: string; text: string }> = {
  Solar: { bg: '#fef3c7', text: '#92400e' },
  Insurance: { bg: '#dbeafe', text: '#1e40af' },
  Mortgage: { bg: '#d1fae5', text: '#065f46' },
  'Home Services': { bg: '#fce7f3', text: '#9d174d' },
  'Real Estate': { bg: '#ede9fe', text: '#5b21b6' },
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch(`${API_URL}/templates`);
        if (res.ok) {
          const data = await res.json();
          setTemplates(data);
        }
      } catch {
        // Templates not available
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const filtered =
    activeTab === 'All' ? templates : templates.filter((t) => t.vertical === activeTab);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Templates
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Browse pre-built form templates by industry vertical.
      </p>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 28,
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: 0,
        }}
      >
        {VERTICALS.map((v) => (
          <button
            key={v}
            onClick={() => setActiveTab(v)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === v ? '#3b82f6' : '#6b7280',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === v ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading templates...</p>
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
          <p style={{ color: '#6b7280', fontSize: 15 }}>
            No templates available{activeTab !== 'All' ? ` for ${activeTab}` : ''} yet.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((template) => {
            const colors = verticalColors[template.vertical] || {
              bg: '#f3f4f6',
              text: '#374151',
            };
            return (
              <div
                key={template.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 10,
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
                    {template.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: colors.bg,
                      color: colors.text,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {template.vertical}
                  </span>
                </div>
                {template.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: '#6b7280',
                      marginBottom: 16,
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {template.description}
                  </p>
                )}
                <button
                  onClick={() => {
                    window.location.href = `/dashboard/forms/new?templateId=${template.id}`;
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#3b82f6',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid #3b82f6',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  Use Template
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
