'use client';

import { useState } from 'react';
import type { LogicRule, LogicConditionOperator, Step, Question } from '@flipflow/shared';

const OPERATORS: { value: LogicConditionOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'is_empty', label: 'Is empty' },
];

interface RuleBuilderProps {
  rules: LogicRule[];
  questions: Question[];
  steps: Step[];
  currentStepId: string;
  onChange: (rules: LogicRule[]) => void;
}

export function RuleBuilder({
  rules,
  questions,
  steps,
  currentStepId,
  onChange,
}: RuleBuilderProps) {
  const otherSteps = steps.filter((s) => s.id !== currentStepId);

  const addRule = () => {
    const newRule: LogicRule = {
      sourceQuestionId: questions[0]?.id ?? '',
      condition: 'equals',
      value: '',
      targetStepId: otherSteps[0]?.id ?? '',
    };
    onChange([...rules, newRule]);
  };

  const updateRule = (index: number, patch: Partial<LogicRule>) => {
    const updated = rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange(updated);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>Branching Logic</h3>
      <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6b7280' }}>
        If a condition matches, the user will jump to the target step instead of continuing
        sequentially.
      </p>

      {rules.map((rule, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '13px', color: '#374151' }}>If</span>

          <select
            value={rule.sourceQuestionId}
            onChange={(e) => updateRule(index, { sourceQuestionId: e.target.value })}
            style={selectStyle}
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
          </select>

          <select
            value={rule.condition}
            onChange={(e) =>
              updateRule(index, { condition: e.target.value as LogicConditionOperator })
            }
            style={selectStyle}
          >
            {OPERATORS.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          {rule.condition !== 'is_empty' && (
            <input
              type="text"
              value={rule.value}
              onChange={(e) => updateRule(index, { value: e.target.value })}
              placeholder="Value"
              style={inputStyle}
            />
          )}

          <span style={{ fontSize: '13px', color: '#374151' }}>then go to</span>

          <select
            value={rule.targetStepId}
            onChange={(e) => updateRule(index, { targetStepId: e.target.value })}
            style={selectStyle}
          >
            {otherSteps.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          <button onClick={() => removeRule(index)} style={removeButtonStyle} title="Remove rule">
            x
          </button>
        </div>
      ))}

      <button onClick={addRule} style={addButtonStyle} disabled={questions.length === 0}>
        + Add Rule
      </button>
    </div>
  );
}

interface VisibilityRuleEditorProps {
  question: Question;
  allQuestions: Question[];
  onChange: (visibility: Question['conditionalVisibility']) => void;
}

export function VisibilityRuleEditor({
  question,
  allQuestions,
  onChange,
}: VisibilityRuleEditorProps) {
  const otherQuestions = allQuestions.filter((q) => q.id !== question.id);
  const [enabled, setEnabled] = useState(!!question.conditionalVisibility);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      onChange(undefined);
    } else {
      onChange({
        questionId: otherQuestions[0]?.id ?? '',
        condition: 'equals',
        value: '',
      });
    }
  };

  return (
    <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
        <input type="checkbox" checked={enabled} onChange={(e) => handleToggle(e.target.checked)} />
        Show this question conditionally
      </label>

      {enabled && question.conditionalVisibility && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginTop: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '13px' }}>Show when</span>
          <select
            value={question.conditionalVisibility.questionId}
            onChange={(e) =>
              onChange({ ...question.conditionalVisibility!, questionId: e.target.value })
            }
            style={selectStyle}
          >
            {otherQuestions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.label}
              </option>
            ))}
          </select>

          <select
            value={question.conditionalVisibility.condition}
            onChange={(e) =>
              onChange({
                ...question.conditionalVisibility!,
                condition: e.target.value as 'equals' | 'not_equals' | 'contains' | 'is_empty',
              })
            }
            style={selectStyle}
          >
            <option value="equals">Equals</option>
            <option value="not_equals">Does not equal</option>
            <option value="contains">Contains</option>
            <option value="is_empty">Is empty</option>
          </select>

          {question.conditionalVisibility.condition !== 'is_empty' && (
            <input
              type="text"
              value={question.conditionalVisibility.value}
              onChange={(e) =>
                onChange({ ...question.conditionalVisibility!, value: e.target.value })
              }
              placeholder="Value"
              style={inputStyle}
            />
          )}
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  backgroundColor: '#fff',
};

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  width: '120px',
};

const removeButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid #fca5a5',
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  cursor: 'pointer',
  fontSize: '13px',
};

const addButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#f9fafb',
  cursor: 'pointer',
  fontSize: '13px',
};
