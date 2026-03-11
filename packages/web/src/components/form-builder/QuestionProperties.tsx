'use client';

import { QuestionType } from '@flipflow/shared';
import type { Question, QuestionOption, Step, LogicRule } from '@flipflow/shared';
import { RuleBuilder, VisibilityRuleEditor } from '@/components/logic-builder';

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

const CHOICE_TYPES: QuestionType[] = [
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.DROPDOWN,
];

interface QuestionPropertiesProps {
  question?: Question;
  step: Step;
  allSteps: Step[];
  allQuestions: Question[];
  onChange: (patch: Partial<Question>) => void;
  onStepRulesChange: (rules: LogicRule[]) => void;
}

export function QuestionProperties({
  question,
  step,
  allSteps,
  allQuestions,
  onChange,
  onStepRulesChange,
}: QuestionPropertiesProps) {
  if (!question) {
    return (
      <div style={containerStyle}>
        <div style={emptyStyle}>
          <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.3 }}>&#8592;</div>
          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
            Select a question to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const isChoiceType = CHOICE_TYPES.includes(question.type as QuestionType);

  return (
    <div style={containerStyle}>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* Header */}
        <div style={sectionHeaderStyle}>
          <span style={sectionLabelStyle}>Question Properties</span>
        </div>

        {/* Label */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Label</label>
          <input
            type="text"
            value={question.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Enter question label"
            style={inputStyle}
          />
        </div>

        {/* Placeholder */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Placeholder</label>
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onChange({ placeholder: e.target.value || undefined })}
            placeholder="Enter placeholder text"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={question.description || ''}
            onChange={(e) => onChange({ description: e.target.value || undefined })}
            placeholder="Optional helper text"
            rows={2}
            style={textareaStyle}
          />
        </div>

        {/* Question Type */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Type</label>
          <select
            value={question.type}
            onChange={(e) => onChange({ type: e.target.value as QuestionType })}
            style={selectStyle}
          >
            {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Divider */}
        <div style={dividerStyle} />

        {/* Validations */}
        <div style={sectionHeaderStyle}>
          <span style={sectionLabelStyle}>Validations</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={question.validations.required || false}
              onChange={(e) =>
                onChange({ validations: { ...question.validations, required: e.target.checked } })
              }
            />
            Required
          </label>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '0 16px 12px',
          }}
        >
          <div>
            <label style={labelSmStyle}>Min Length</label>
            <input
              type="number"
              value={question.validations.minLength ?? ''}
              onChange={(e) =>
                onChange({
                  validations: {
                    ...question.validations,
                    minLength: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              style={inputSmStyle}
              placeholder="-"
            />
          </div>
          <div>
            <label style={labelSmStyle}>Max Length</label>
            <input
              type="number"
              value={question.validations.maxLength ?? ''}
              onChange={(e) =>
                onChange({
                  validations: {
                    ...question.validations,
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
              style={inputSmStyle}
              placeholder="-"
            />
          </div>
          <div>
            <label style={labelSmStyle}>Min Value</label>
            <input
              type="number"
              value={question.validations.min ?? ''}
              onChange={(e) =>
                onChange({
                  validations: {
                    ...question.validations,
                    min: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              style={inputSmStyle}
              placeholder="-"
            />
          </div>
          <div>
            <label style={labelSmStyle}>Max Value</label>
            <input
              type="number"
              value={question.validations.max ?? ''}
              onChange={(e) =>
                onChange({
                  validations: {
                    ...question.validations,
                    max: e.target.value ? parseFloat(e.target.value) : undefined,
                  },
                })
              }
              style={inputSmStyle}
              placeholder="-"
            />
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Pattern (Regex)</label>
          <input
            type="text"
            value={question.validations.pattern || ''}
            onChange={(e) =>
              onChange({
                validations: {
                  ...question.validations,
                  pattern: e.target.value || undefined,
                },
              })
            }
            placeholder="e.g. ^[A-Z]+"
            style={inputStyle}
          />
        </div>

        {/* Options Editor (for choice types) */}
        {isChoiceType && (
          <>
            <div style={dividerStyle} />
            <div style={sectionHeaderStyle}>
              <span style={sectionLabelStyle}>Options</span>
            </div>
            <OptionsEditor
              options={question.options || []}
              onChange={(options) => onChange({ options })}
            />
          </>
        )}

        {/* Conditional Visibility */}
        <div style={dividerStyle} />
        <div style={sectionHeaderStyle}>
          <span style={sectionLabelStyle}>Conditional Visibility</span>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <VisibilityRuleEditor
            question={question}
            allQuestions={allQuestions}
            onChange={(visibility) => onChange({ conditionalVisibility: visibility })}
          />
        </div>

        {/* Step Branching Rules */}
        <div style={dividerStyle} />
        <div style={sectionHeaderStyle}>
          <span style={sectionLabelStyle}>Step Logic</span>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <RuleBuilder
            rules={step.conditions || []}
            questions={step.questions}
            steps={allSteps}
            currentStepId={step.id}
            onChange={onStepRulesChange}
          />
        </div>
      </div>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: QuestionOption[];
  onChange: (options: QuestionOption[]) => void;
}) {
  const addOption = () => {
    const newOption: QuestionOption = {
      id: crypto.randomUUID(),
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    onChange([...options, newOption]);
  };

  const updateOption = (id: string, patch: Partial<QuestionOption>) => {
    onChange(options.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  };

  const removeOption = (id: string) => {
    onChange(options.filter((o) => o.id !== id));
  };

  return (
    <div style={{ padding: '0 16px 12px' }}>
      {options.map((option) => (
        <div key={option.id} style={optionRowStyle}>
          <input
            type="text"
            value={option.label}
            onChange={(e) => {
              updateOption(option.id, {
                label: e.target.value,
                value: e.target.value.toLowerCase().replace(/\s+/g, '_'),
              });
            }}
            style={{ ...inputSmStyle, flex: 1 }}
            placeholder="Option label"
          />
          <button
            onClick={() => removeOption(option.id)}
            style={optionRemoveBtnStyle}
            title="Remove option"
            type="button"
          >
            &#10005;
          </button>
        </div>
      ))}
      <button onClick={addOption} style={addOptionBtnStyle} type="button">
        + Add Option
      </button>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#fff',
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '24px',
  textAlign: 'center',
};

const sectionHeaderStyle: React.CSSProperties = {
  padding: '12px 16px 8px',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const fieldGroupStyle: React.CSSProperties = {
  padding: '0 16px 12px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '4px',
};

const labelSmStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#6b7280',
  marginBottom: '2px',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: '#374151',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  boxSizing: 'border-box',
  outline: 'none',
};

const inputSmStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  borderRadius: '5px',
  border: '1px solid #d1d5db',
  fontSize: '12px',
  boxSizing: 'border-box',
  outline: 'none',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  boxSizing: 'border-box',
  resize: 'vertical',
  fontFamily: 'inherit',
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  backgroundColor: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: '#f3f4f6',
  margin: '4px 0',
};

const optionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
  marginBottom: '6px',
};

const optionRemoveBtnStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #fca5a5',
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  cursor: 'pointer',
  borderRadius: '4px',
  fontSize: '10px',
  padding: 0,
  flexShrink: 0,
};

const addOptionBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '5px',
  border: '1px dashed #d1d5db',
  backgroundColor: 'transparent',
  color: '#6b7280',
  cursor: 'pointer',
  fontSize: '12px',
  width: '100%',
};
