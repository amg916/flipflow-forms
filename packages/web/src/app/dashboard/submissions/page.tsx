'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const PAGE_SIZE = 20;

interface Form {
  id: string;
  name: string;
}

interface Submission {
  id: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function SubmissionsPage() {
  const { currentOrg, loading: authLoading } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [page, setPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch forms
  useEffect(() => {
    if (!currentOrg) return;
    setLoadingForms(true);
    fetch(`${API_URL}/forms?orgId=${currentOrg.id}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setForms(data);
        setLoadingForms(false);
      })
      .catch(() => setLoadingForms(false));
  }, [currentOrg]);

  // Fetch submissions when form selected
  useEffect(() => {
    if (!selectedFormId) {
      setSubmissions([]);
      return;
    }
    setLoadingSubmissions(true);
    setPage(0);
    fetch(`${API_URL}/forms/${selectedFormId}/submissions`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setSubmissions(data);
        setLoadingSubmissions(false);
      })
      .catch(() => setLoadingSubmissions(false));
  }, [selectedFormId]);

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(submissions.length / PAGE_SIZE));
  const pagedSubmissions = submissions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const exportCsv = useCallback(() => {
    if (submissions.length === 0) return;

    // Collect all data keys across all submissions
    const dataKeys = new Set<string>();
    submissions.forEach((s) => {
      Object.keys(s.data || {}).forEach((k) => dataKeys.add(k));
    });
    const keys = Array.from(dataKeys);

    const headers = ['ID', 'Submitted At', ...keys];
    const escape = (val: unknown): string => {
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = submissions.map((s) => {
      return [
        escape(s.id),
        escape(new Date(s.createdAt).toISOString()),
        ...keys.map((k) => escape(s.data?.[k])),
      ].join(',');
    });

    const csv = [headers.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${selectedFormId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [submissions, selectedFormId]);

  if (authLoading) {
    return <div style={{ padding: 40, color: '#6b7280' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
        Submissions
      </h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        View and export form submissions.
      </p>

      {/* Controls row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <select
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 14,
            backgroundColor: '#ffffff',
            color: '#111827',
            minWidth: 240,
            cursor: 'pointer',
          }}
        >
          <option value="">{loadingForms ? 'Loading forms...' : 'Select a form'}</option>
          {forms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        {submissions.length > 0 && (
          <button
            onClick={exportCsv}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Content */}
      {!selectedFormId && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 48,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>&#9634;</div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
            Select a form to view submissions
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Choose a form from the dropdown above.</p>
        </div>
      )}

      {selectedFormId && loadingSubmissions && (
        <div style={{ padding: 40, color: '#6b7280', textAlign: 'center' }}>
          Loading submissions...
        </div>
      )}

      {selectedFormId && !loadingSubmissions && submissions.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 48,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>&#9744;</div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#374151', marginBottom: 8 }}>
            No submissions yet
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            Submissions will appear here once users start filling out this form.
          </p>
        </div>
      )}

      {selectedFormId && !loadingSubmissions && submissions.length > 0 && (
        <>
          <div
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              border: '1px solid #1f2937',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#1a1a2e' }}>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#d1d5db',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#d1d5db',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Submitted At
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#d1d5db',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedSubmissions.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{
                      backgroundColor: i % 2 === 0 ? '#111827' : '#1a1a2e',
                      borderTop: '1px solid #1f2937',
                    }}
                  >
                    <td
                      style={{
                        padding: '12px 16px',
                        color: '#e5e7eb',
                        fontFamily: 'monospace',
                        fontSize: 13,
                      }}
                    >
                      {s.id.length > 12 ? s.id.slice(0, 12) + '...' : s.id}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: '#e5e7eb',
                      }}
                    >
                      {new Date(s.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => toggleRow(s.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #374151',
                          borderRadius: 4,
                          color: '#9ca3af',
                          cursor: 'pointer',
                          padding: '4px 10px',
                          fontSize: 12,
                        }}
                      >
                        {expandedRows.has(s.id) ? 'Hide' : 'View'} Data
                      </button>
                      {expandedRows.has(s.id) && (
                        <pre
                          style={{
                            marginTop: 8,
                            padding: 12,
                            backgroundColor: '#0f172a',
                            borderRadius: 4,
                            color: '#a5b4fc',
                            fontSize: 12,
                            overflow: 'auto',
                            maxHeight: 200,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {JSON.stringify(s.data, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              fontSize: 14,
              color: '#6b7280',
            }}
          >
            <span>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, submissions.length)}{' '}
              of {submissions.length} submissions
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  backgroundColor: page === 0 ? '#f3f4f6' : '#ffffff',
                  color: page === 0 ? '#9ca3af' : '#374151',
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  backgroundColor: page >= totalPages - 1 ? '#f3f4f6' : '#ffffff',
                  color: page >= totalPages - 1 ? '#9ca3af' : '#374151',
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
