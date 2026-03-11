'use client';

import { useState } from 'react';
import type { Step } from '@flipflow/shared';

interface StepListProps {
  steps: Step[];
  selectedStepId: string;
  onSelect: (stepId: string) => void;
  onAdd: () => void;
  onReorder: (stepId: string, direction: 'up' | 'down') => void;
  onDelete: (stepId: string) => void;
}

export function StepList({
  steps,
  selectedStepId,
  onSelect,
  onAdd,
  onReorder,
  onDelete,
}: StepListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const sorted = [...steps].sort((a, b) => a.order - b.order);

  const handleDelete = (stepId: string) => {
    if (confirmDeleteId === stepId) {
      onDelete(stepId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(stepId);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Steps
        </span>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>{steps.length}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {sorted.map((step, index) => {
          const isSelected = step.id === selectedStepId;
          const isConfirming = confirmDeleteId === step.id;

          return (
            <div
              key={step.id}
              onClick={() => onSelect(step.id)}
              style={{
                ...stepItemStyle,
                backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                borderColor: isSelected ? '#3b82f6' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? '#3b82f6' : '#e5e7eb',
                    color: isSelected ? '#fff' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? '#1d4ed8' : '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.title}
                </span>
              </div>

              <div
                style={{ display: 'flex', gap: '2px', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onReorder(step.id, 'up')}
                  disabled={index === 0}
                  style={iconBtnStyle}
                  title="Move up"
                  type="button"
                >
                  &#9650;
                </button>
                <button
                  onClick={() => onReorder(step.id, 'down')}
                  disabled={index === sorted.length - 1}
                  style={iconBtnStyle}
                  title="Move down"
                  type="button"
                >
                  &#9660;
                </button>
                <button
                  onClick={() => handleDelete(step.id)}
                  style={{
                    ...iconBtnStyle,
                    color: isConfirming ? '#fff' : '#9ca3af',
                    backgroundColor: isConfirming ? '#dc2626' : 'transparent',
                  }}
                  title={isConfirming ? 'Click again to confirm' : 'Delete step'}
                  type="button"
                >
                  &#10005;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '8px' }}>
        <button onClick={onAdd} style={addButtonStyle} type="button">
          + Add Step
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 16px 8px',
};

const stepItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid transparent',
  cursor: 'pointer',
  marginBottom: '2px',
  transition: 'background-color 0.15s',
};

const iconBtnStyle: React.CSSProperties = {
  width: '22px',
  height: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: 'transparent',
  color: '#9ca3af',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '8px',
  padding: 0,
};

const addButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px dashed #d1d5db',
  backgroundColor: 'transparent',
  color: '#6b7280',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'border-color 0.15s, color 0.15s',
};
