'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Integration {
  id: string;
  type: string;
  provider: string;
  active: boolean;
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  fieldMapping?: Record<string, string>;
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

const PROVIDERS = [
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'leadspedia', label: 'LeadsPedia' },
  { value: 'cake', label: 'Cake' },
];

const providerLabel = (value: string) => PROVIDERS.find((p) => p.value === value)?.label || value;

const providerIcon = (value: string): string => {
  switch (value) {
    case 'hubspot':
      return '🟠';
    case 'salesforce':
      return '☁️';
    case 'leadspedia':
      return '📊';
    case 'cake':
      return '🎂';
    default:
      return '🔗';
  }
};

const emptyForm = {
  type: '',
  provider: 'hubspot',
  config: '',
  credentials: '',
  fieldMapping: '',
};

export default function IntegrationsPage() {
  const { currentOrg } = useAuth();
  const orgId = currentOrg?.id || '';

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<DeliveryLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; message: string } | null>(
    null,
  );

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchIntegrations = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`${API_URL}/integrations?orgId=${orgId}`, { credentials: 'include' });
      if (res.ok) setIntegrations(await res.json());
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.type || !form.provider) {
      showToast('Type and provider are required', 'error');
      return;
    }
    setSaving(true);
    try {
      let parsedConfig = undefined;
      let parsedCredentials = undefined;
      let parsedFieldMapping = undefined;
      if (form.config.trim()) {
        try {
          parsedConfig = JSON.parse(form.config);
        } catch {
          showToast('Invalid config JSON', 'error');
          setSaving(false);
          return;
        }
      }
      if (form.credentials.trim()) {
        try {
          parsedCredentials = JSON.parse(form.credentials);
        } catch {
          showToast('Invalid credentials JSON', 'error');
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
        type: form.type,
        provider: form.provider,
        ...(parsedConfig && { config: parsedConfig }),
        ...(parsedCredentials && { credentials: parsedCredentials }),
        ...(parsedFieldMapping && { fieldMapping: parsedFieldMapping }),
      };

      if (!editingId) body.orgId = orgId;

      const res = await fetch(
        editingId ? `${API_URL}/integrations/${editingId}` : `${API_URL}/integrations`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        },
      );
      if (res.ok) {
        showToast(editingId ? 'Integration updated' : 'Integration created', 'success');
        resetForm();
        fetchIntegrations();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || 'Failed to save integration', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this integration?')) return;
    try {
      const res = await fetch(`${API_URL}/integrations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Integration deleted', 'success');
        fetchIntegrations();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleToggle = async (intg: Integration) => {
    try {
      const res = await fetch(`${API_URL}/integrations/${intg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active: !intg.active }),
      });
      if (res.ok) fetchIntegrations();
      else showToast('Failed to update status', 'error');
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestResult(null);
    try {
      const res = await fetch(`${API_URL}/integrations/${id}/test`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTestResult({ id, ok: true, message: data.message || 'Connection successful' });
      } else {
        setTestResult({ id, ok: false, message: data.message || 'Connection failed' });
      }
    } catch {
      setTestResult({ id, ok: false, message: 'Network error' });
    }
  };

  const handleEdit = (intg: Integration) => {
    setForm({
      type: intg.type,
      provider: intg.provider,
      config: intg.config ? JSON.stringify(intg.config, null, 2) : '',
      credentials: intg.credentials ? JSON.stringify(intg.credentials, null, 2) : '',
      fieldMapping: intg.fieldMapping ? JSON.stringify(intg.fieldMapping, null, 2) : '',
    });
    setEditingId(intg.id);
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
      const res = await fetch(`${API_URL}/integrations/${id}/logs`, { credentials: 'include' });
      if (res.ok) setLogs(await res.json());
      else setLogs([]);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
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
            Integrations
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Connect form submissions to CRM and marketing platforms
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
            + Add Integration
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
            {editingId ? 'Edit Integration' : 'New Integration'}
          </h2>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}
          >
            <div>
              <label style={labelStyle}>Provider *</label>
              <select
                style={inputStyle}
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type *</label>
              <input
                style={inputStyle}
                placeholder="e.g. crm, lead_delivery"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Config (JSON, optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
              placeholder='{"portalId": "12345", "pipelineId": "default"}'
              value={form.config}
              onChange={(e) => setForm({ ...form, config: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Credentials (JSON, optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
              placeholder='{"apiKey": "...", "accessToken": "..."}'
              value={form.credentials}
              onChange={(e) => setForm({ ...form, credentials: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Field Mapping (JSON, optional)</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80, fontFamily: 'monospace', fontSize: 13 }}
              placeholder='{"email": "contact_email", "name": "firstname"}'
              value={form.fieldMapping}
              onChange={(e) => setForm({ ...form, fieldMapping: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSubmit} disabled={saving} style={btnPrimary}>
              {saving ? 'Saving...' : editingId ? 'Update Integration' : 'Create Integration'}
            </button>
            <button onClick={resetForm} style={btnSecondary}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading integrations...</p>
      ) : integrations.length === 0 && !showForm ? (
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
            No integrations yet. Connect your first CRM or marketing platform.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{ ...btnPrimary, padding: '10px 20px', fontSize: 14 }}
          >
            Add Your First Integration
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {integrations.map((intg) => (
            <div
              key={intg.id}
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
                  <span style={{ fontSize: 20 }}>{providerIcon(intg.provider)}</span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>
                    {providerLabel(intg.provider)}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                    }}
                  >
                    {intg.type}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: intg.active ? '#d1fae5' : '#fee2e2',
                      color: intg.active ? '#065f46' : '#991b1b',
                    }}
                  >
                    {intg.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleToggle(intg)} style={btnSecondary}>
                    {intg.active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleEdit(intg)} style={btnSecondary}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleTestConnection(intg.id)}
                    style={{ ...btnSecondary, color: '#2563eb', borderColor: '#93c5fd' }}
                  >
                    Test Connection
                  </button>
                  <button onClick={() => loadLogs(intg.id)} style={btnSecondary}>
                    {expandedLogs === intg.id ? 'Hide Logs' : 'View Logs'}
                  </button>
                  <button onClick={() => handleDelete(intg.id)} style={btnDanger}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Test result inline */}
              {testResult && testResult.id === intg.id && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    backgroundColor: testResult.ok ? '#d1fae5' : '#fee2e2',
                    color: testResult.ok ? '#065f46' : '#991b1b',
                  }}
                >
                  {testResult.message}
                </div>
              )}

              {/* Logs */}
              {expandedLogs === intg.id && (
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
