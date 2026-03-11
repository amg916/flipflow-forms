'use client';

import { useState } from 'react';
import type { Step, Question, QuestionType } from '@flipflow/shared';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  email: 'Email',
  phone: 'Phone',
  number: 'Number',
  url: 'URL',
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Choice',
  dropdown: 'Dropdown',
  date: 'Date',
  file_upload: 'File Upload',
  rating: 'Rating',
  yes_no: 'Yes / No',
  legal: 'Legal',
};

const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  short_text: 'Aa',
  long_text: '\u00b6',
  email: '@',
  phone: '\u260e',
  number: '#',
  url: '\u29c9',
  single_choice: '\u25ce',
  multiple_choice: '\u2611',
  dropdown: '\u25bc',
  date: '\u25a3',
  file_upload: '\u2191',
  rating: '\u2605',
  yes_no: '\u2713',
  legal: '\u00a7',
};

interface QuestionEditorProps {
  step: Step;
  selectedQuestionId?: string;
  onSelectQuestion: (questionId: string) => void;
  onAddQuestion: (type: QuestionType) => void;
  onUpdateQuestion: (questionId: string, patch: Partial<Question>) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestion: (questionId: string, direction: 'up' | 'down') => void;
}

export function QuestionEditor({
  step,
  selectedQuestionId,
  onSelectQuestion,
  onAddQuestion,
  onUpdateQuestion: _onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestion,
}: QuestionEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const questions = step.questions;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>
          {step.title}
        </h2>
        <span style={{ fontSize: '13px', color: '#9ca3af' }}>
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {questions.length === 0 && (
          <div style={emptyStateStyle}>
            <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.3 }}>+</div>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
              No questions yet. Add one below.
            </p>
          </div>
        )}

        {questions.map((question, index) => {
          const isSelected = question.id === selectedQuestionId;
          return (
            <div
              key={question.id}
              onClick={() => onSelectQuestion(question.id)}
              style={{
                ...questionCardStyle,
                borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
                boxShadow: isSelected ? '0 0 0 1px #3b82f6' : '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}
              >
                <span style={typeIconStyle}>
                  {QUESTION_TYPE_ICONS[question.type as QuestionType] || '?'}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#111827',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {question.label || 'Untitled Question'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {QUESTION_TYPE_LABELS[question.type as QuestionType] || question.type}
                    {question.validations.required && (
                      <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{ display: 'flex', gap: '4px', flexShrink: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onReorderQuestion(question.id, 'up')}
                  disabled={index === 0}
                  style={actionBtnStyle}
                  title="Move up"
                  type="button"
                >
                  &#8593;
                </button>
                <button
                  onClick={() => onReorderQuestion(question.id, 'down')}
                  disabled={index === questions.length - 1}
                  style={actionBtnStyle}
                  title="Move down"
                  type="button"
                >
                  &#8595;
                </button>
                <button
                  onClick={() => onDeleteQuestion(question.id)}
                  style={{ ...actionBtnStyle, color: '#ef4444' }}
                  title="Delete question"
                  type="button"
                >
                  &#10005;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', position: 'relative' }}>
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          style={addQuestionBtnStyle}
          type="button"
        >
          + Add Question
        </button>

        {showAddMenu && (
          <>
            <div style={overlayStyle} onClick={() => setShowAddMenu(false)} />
            <div style={addMenuStyle}>
              {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onAddQuestion(type);
                    setShowAddMenu(false);
                  }}
                  style={menuItemStyle}
                  type="button"
                >
                  <span style={{ width: '24px', textAlign: 'center', fontSize: '14px' }}>
                    {QUESTION_TYPE_ICONS[type]}
                  </span>
                  {QUESTION_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </>
        )}
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
  padding: '20px 24px',
  borderBottom: '1px solid #f3f4f6',
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px 24px',
  border: '2px dashed #e5e7eb',
  borderRadius: '12px',
  marginTop: '16px',
};

const questionCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  cursor: 'pointer',
  marginBottom: '8px',
  backgroundColor: '#fff',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const typeIconStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  backgroundColor: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  color: '#6b7280',
  fontWeight: 600,
  flexShrink: 0,
};

const actionBtnStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #e5e7eb',
  backgroundColor: '#fff',
  color: '#6b7280',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '12px',
  padding: 0,
};

const addQuestionBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #3b82f6',
  backgroundColor: '#eff6ff',
  color: '#3b82f6',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99,
};

const addMenuStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '100%',
  left: '24px',
  right: '24px',
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  maxHeight: '320px',
  overflowY: 'auto',
  zIndex: 100,
  padding: '4px',
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 12px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '13px',
  color: '#374151',
  borderRadius: '6px',
  textAlign: 'left',
};
