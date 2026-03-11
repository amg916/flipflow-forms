'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Webhook {
  id: string;
  name: string;
  url: string;
  method: string;
  active: boolean;
  headers?: Record<string, string>;
  fieldMapping?: Record<string, string>;
  formId?: string;
  createdAt: string;
}

interface DeliveryLog {
  id: string;
  status: string;
  statusCode: number | null;
  attempt: number;
  createdAt: string;
  error?: string;
}

const emptyForm = {
  name: '',
  url: '',
  method: 'POST',
  formId: '',
  headers: '',
  fieldMapping: '',
};

export default function WebhooksPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.id || '';

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchWebhooks = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`${API_URL}/webhooks?orgId=${orgId}`, { credentials: 'include' });
      if (res.ok) setWebhooks(await res.json());
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.url) {
      showToast('Name and URL are required', 'error');
      return;
    }
    setSaving(true);
    try {
      let parsedHeaders = undefined;
      let parsedFieldMapping = undefined;
      if (form.headers.trim()) {
        try {
          parsedHeaders = JSON.parse(form.headers);
        } catch {
          showToast('Invalid headers JSON', 'error');
          setSaving(false);
          return;
        }
      }
      if (form.fieldMapping.trim()) {
        try {
          parsedFieldMapping = JSON.parse(form.fieldMapping);
        } catch {
          showToast('Invalid field mapping JSON', 'error');
          setSaving(false);
          return;
        }
      }

      const body: Record<string, unknown> = {
        name: form.name,
        url: form.url,
        method: form.method,
        ...(form.formId && { formId: form.formId }),
        ...(parsedHeaders && { headers: parsedHeaders }),
        ...(parsedFieldMapping && { fieldMapping: parsedFieldMapping }),
      };

      if (!editingId) body.orgId = orgId;

      const res = await fetch(
        editingId ? `${API_URL}/webhooks/${editingId}` : `${API_URL}/webhooks`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        },
      );
      if (res.ok) {
        showToast(editingId ? 'Webhook updated' : 'Webhook created', 'success');
        resetForm();
        fetchWebhooks();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Failed to save webhook', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      const res = await fetch(`${API_URL}/webhooks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Webhook deleted', 'success');
        fetchWebhooks();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleToggle = async (wh: Webhook) => {
    try {
      const res = await fetch(`${API_URL}/webhooks/${wh.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: !wh.active }),
      });
      if (res.ok) fetchWebhooks();
      else showToast('Failed to update status', 'error');
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleTest = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/webhooks/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) showToast('Test sent successfully', 'success');
      else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Test failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleEdit = (wh: Webhook) => {
    setForm({
      name: wh.name,
      url: wh.url,
      method: wh.method,
      formId: wh.formId || '',
      headers: wh.headers ? JSON.stringify(wh.headers, null, 2) : '',
      fieldMapping: wh.fieldMapping ? JSON.stringify(wh.fieldMapping, null, 2) : '',
    });
    setEditingId(wh.id);
    setShowForm(true);
  };

  const loadLogs = async (id: string) => {
    if (expandedLogs === id) {
      setExpandedLogs(null);
      return;
    }
    setExpandedLogs(id);
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_URL}/webhooks/${id}/logs`, { credentials: 'include' });
      if (res.ok) setLogs(await res.json());
      else setLogs([]);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleReplay = async (webhookId: string, logId: string) => {
    try {
      const res = await fetch(`${API_URL}/webhooks/${webhookId}/logs/${logId}/replay`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Replay queued', 'success');
        loadLogs(webhookId);
      } else {
        showToast('Replay failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    color: '#111827',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    marginBottom: 6,
  };

  const btnPrimary: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  };

  const btnSecondary: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#374151',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid #d1d5db',
    cursor: 'pointer',
  };

  const btnDanger: React.CSSProperties = {
    ...btnSecondary,
    color: '#dc2626',
    borderColor: '#fca5a5',
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            padding: '12px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            backgroundColor: toast.type === 'success' ? '#059669' : '#dc2626',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            Webhooks
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Send form submissions to external URLs
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{ ...btnPrimary, padding: '10px 20px', fontSize: 14 }}
          >
            + Add Webhook
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20 }}>
            {editingId ? 'Edit Webhook' : 'New Webhook'}
          </h2>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
          >
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                style={inputStyle}
                placeholder="My Webhook"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>URL *</label>
              <input
                style={inputStyle}
                placeholder="https://example.com/hook"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>HTTP Method</label>
              <select
                style={inputStyle}
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="GET">GET</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Form ID (optional)</label>
              <input
                style={inputStyle}
                placeholder="Only trigger for this form"
                value={form.formId}
                onChange={(e) => setForm({ ...form, formId: e.target.value })}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Headers (JSON, optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
              placeholder='{"Authorization": "Bearer ..."}'
              value={form.headers}
              onChange={(e) => setForm({ ...form, headers: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Field Mapping (JSON, optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
              placeholder='{"email": "contact_email", "name": "full_name"}'
              value={form.fieldMapping}
              onChange={(e) => setForm({ ...form, fieldMapping: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSubmit} disabled={saving} style={btnPrimary}>
              {saving ? 'Saving...' : editingId ? 'Update Webhook' : 'Create Webhook'}
            </button>
            <button onClick={resetForm} style={btnSecondary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading webhooks...</p>
      ) : webhooks.length === 0 && !showForm ? (
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
            No webhooks yet. Add one to start sending form data to external services.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{ ...btnPrimary, padding: '10px 20px', fontSize: 14 }}
          >
            Add Your First Webhook
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 20,
              }}
            >
              {/* Card header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>
                    {wh.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: wh.active ? '#d1fae5' : '#fee2e2',
                      color: wh.active ? '#065f46' : '#991b1b',
                    }}
                  >
                    {wh.active ? 'Active' : 'Inactive'}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      fontFamily: 'monospace',
                    }}
                  >
                    {wh.method}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleToggle(wh)} style={btnSecondary}>
                    {wh.active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleEdit(wh)} style={btnSecondary}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleTest(wh.id)}
                    style={{ ...btnSecondary, color: '#2563eb', borderColor: '#93c5fd' }}
                  >
                    Test
                  </button>
                  <button onClick={() => loadLogs(wh.id)} style={btnSecondary}>
                    {expandedLogs === wh.id ? 'Hide Logs' : 'View Logs'}
                  </button>
                  <button onClick={() => handleDelete(wh.id)} style={btnDanger}>
                    Delete
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontFamily: 'monospace' }}>
                {wh.url}
              </p>

              {/* Logs */}
              {expandedLogs === wh.id && (
                <div style={{ marginTop: 16, borderTop: '1px solid #f3f4f6', paddingTop: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Delivery Logs
                  </h4>
                  {logsLoading ? (
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>Loading logs...</p>
                  ) : logs.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#9ca3af' }}>No delivery logs yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: 6,
                            fontSize: 13,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span
                              style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor:
                                  log.status === 'success'
                                    ? '#10b981'
                                    : log.status === 'failed'
                                      ? '#ef4444'
                                      : '#f59e0b',
                              }}
                            />
                            <span style={{ color: '#374151', fontWeight: 500 }}>{log.status}</span>
                            {log.statusCode != null && (
                              <span style={{ color: '#6b7280' }}>HTTP {log.statusCode}</span>
                            )}
                            <span style={{ color: '#9ca3af' }}>Attempt {log.attempt}</span>
                            <span style={{ color: '#9ca3af' }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {log.status === 'failed' && (
                            <button
                              onClick={() => handleReplay(wh.id, log.id)}
                              style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px' }}
                            >
                              Replay
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
