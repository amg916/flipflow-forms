'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const PLACEHOLDER_ORG_ID = 'org_placeholder';

interface Template {
  id: string;
  name: string;
  description: string | null;
  vertical: string;
}

export default function NewFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      }
    }
    fetchTemplates();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const body: Record<string, string> = {
        title: title.trim(),
        description: description.trim(),
        orgId: PLACEHOLDER_ORG_ID,
      };
      if (templateId) {
        body.templateId = templateId;
      }

      const res = await fetch(`${API_URL}/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to create form');
      }

      const form = await res.json();
      router.push(`/dashboard/forms/${form.id}`);
    } catch {
      setError('Failed to create form. Please try again.');
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    color: '#111827',
    backgroundColor: '#ffffff',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Create New Form
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
        Start from scratch or pick a template to get a head start.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          padding: 32,
          maxWidth: 560,
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Form Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Solar Quote Request"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of this form..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Template selector */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>Template (optional)</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="">Start from scratch</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.vertical}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</p>}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: submitting ? '#93c5fd' : '#3b82f6',
              color: '#ffffff',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Creating...' : 'Create Form'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard/forms')}
            style={{
              backgroundColor: '#ffffff',
              color: '#374151',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
