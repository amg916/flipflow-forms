'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    name: string;
    email: string;
  };
}

export default function SettingsPage() {
  const { currentOrg, loading: authLoading } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState('');
  const [orgError, setOrgError] = useState('');

  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [removing, setRemoving] = useState('');

  useEffect(() => {
    if (authLoading || !currentOrg) return;
    setOrgName(currentOrg.name);
    fetchMembers();
  }, [currentOrg, authLoading]);

  async function fetchMembers() {
    if (!currentOrg) return;
    setMembersLoading(true);
    setMembersError('');
    try {
      const res = await fetch(`${API_URL}/orgs/${currentOrg.id}/members`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load members');
      const data = await res.json();
      setMembers(data);
    } catch {
      setMembersError('Failed to load team members.');
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleSaveOrg() {
    if (!currentOrg) return;
    setOrgSaving(true);
    setOrgError('');
    setOrgSuccess('');
    try {
      const res = await fetch(`${API_URL}/orgs/${currentOrg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: orgName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update organization.');
      }
      setOrgSuccess('Organization updated.');
      setTimeout(() => setOrgSuccess(''), 3000);
    } catch (err: unknown) {
      setOrgError(err instanceof Error ? err.message : 'Failed to update organization.');
    } finally {
      setOrgSaving(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!currentOrg || !inviteEmail.trim()) return;
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    try {
      const res = await fetch(`${API_URL}/orgs/${currentOrg.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send invite.');
      }
      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}.`);
      setInviteEmail('');
      setInviteRole('editor');
      fetchMembers();
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite.');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId: string) {
    if (!currentOrg) return;
    setRemoving(userId);
    try {
      const res = await fetch(`${API_URL}/orgs/${currentOrg.id}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to remove member.');
      }
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      setRemoveConfirm(null);
    } catch (err: unknown) {
      setMembersError(err instanceof Error ? err.message : 'Failed to remove member.');
    } finally {
      setRemoving('');
    }
  }

  const sectionStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
  };

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 16,
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#ffffff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const btnPrimary: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '10px 20px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  };

  if (authLoading) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>No organization selected.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Settings</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
        Manage your organization, team, and billing preferences.
      </p>

      {/* Organization */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Organization</h2>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#374151',
              marginBottom: 6,
            }}
          >
            Organization Name
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleSaveOrg}
              disabled={orgSaving || orgName === currentOrg.name}
              style={{
                ...btnPrimary,
                opacity: orgSaving || orgName === currentOrg.name ? 0.6 : 1,
                cursor: orgSaving || orgName === currentOrg.name ? 'default' : 'pointer',
                flexShrink: 0,
              }}
            >
              {orgSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
          {orgSuccess && (
            <p style={{ fontSize: 13, color: '#16a34a', marginTop: 8 }}>{orgSuccess}</p>
          )}
          {orgError && <p style={{ fontSize: 13, color: '#dc2626', marginTop: 8 }}>{orgError}</p>}
        </div>
      </div>

      {/* Team Members */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Team Members</h2>

        {membersError && (
          <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12 }}>{membersError}</p>
        )}

        {membersLoading ? (
          <p style={{ fontSize: 13, color: '#6b7280' }}>Loading members...</p>
        ) : members.length === 0 ? (
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>No team members found.</p>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 100px 80px',
                gap: 12,
                padding: '8px 0',
                borderBottom: '2px solid #e5e7eb',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Name
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Email
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Role
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                }}
              >
                Actions
              </div>
            </div>

            {/* Rows */}
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 100px 80px',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid #f3f4f6',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                  {member.user.name || '-'}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{member.user.email}</div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '2px 10px',
                    borderRadius: 12,
                    backgroundColor:
                      member.role === 'owner'
                        ? '#dbeafe'
                        : member.role === 'admin'
                          ? '#fef3c7'
                          : '#f3f4f6',
                    color:
                      member.role === 'owner'
                        ? '#1e40af'
                        : member.role === 'admin'
                          ? '#92400e'
                          : '#6b7280',
                    textTransform: 'capitalize',
                    display: 'inline-block',
                    textAlign: 'center',
                  }}
                >
                  {member.role}
                </span>
                <div>
                  {member.role !== 'owner' && (
                    <>
                      {removeConfirm === member.userId ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => handleRemove(member.userId)}
                            disabled={removing === member.userId}
                            style={{
                              background: '#ef4444',
                              border: 'none',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              cursor: 'pointer',
                              opacity: removing === member.userId ? 0.6 : 1,
                            }}
                          >
                            {removing === member.userId ? '...' : 'Yes'}
                          </button>
                          <button
                            onClick={() => setRemoveConfirm(null)}
                            style={{
                              background: 'none',
                              border: '1px solid #d1d5db',
                              color: '#6b7280',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRemoveConfirm(member.userId)}
                          style={{
                            background: 'none',
                            border: '1px solid #fca5a5',
                            color: '#ef4444',
                            padding: '4px 10px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invite Form */}
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: 16,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
            Invite Member
          </h3>
          <form
            onSubmit={handleInvite}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 4,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                style={inputStyle}
              />
            </div>
            <div style={{ minWidth: 140 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: 4,
                }}
              >
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'auto',
                }}
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              style={{
                ...btnPrimary,
                opacity: inviting || !inviteEmail.trim() ? 0.6 : 1,
                cursor: inviting || !inviteEmail.trim() ? 'default' : 'pointer',
              }}
            >
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
          </form>
          {inviteSuccess && (
            <p style={{ fontSize: 13, color: '#16a34a', marginTop: 8 }}>{inviteSuccess}</p>
          )}
          {inviteError && (
            <p style={{ fontSize: 13, color: '#dc2626', marginTop: 8 }}>{inviteError}</p>
          )}
        </div>
      </div>

      {/* Billing Link */}
      <div style={sectionStyle}>
        <h2 style={sectionHeadingStyle}>Billing</h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Manage your subscription and payment methods.
        </p>
        <Link
          href="/dashboard/billing"
          style={{
            display: 'inline-flex',
            backgroundColor: '#ffffff',
            color: '#3b82f6',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid #3b82f6',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Manage Billing
        </Link>
      </div>
    </div>
  );
}
