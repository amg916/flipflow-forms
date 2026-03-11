'use client';

import type { Question, FormTheme } from '@flipflow/shared';

interface QuestionFieldProps {
  question: Question;
  value: string | string[] | undefined;
  error?: string;
  onChange: (value: string | string[]) => void;
  theme: FormTheme;
}

export function QuestionField({ question, value, error, onChange, theme }: QuestionFieldProps) {
  const strVal = Array.isArray(value) ? value.join(',') : (value ?? '');

  const renderInput = () => {
    switch (question.type) {
      case 'short_text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <input
            type={inputType(question.type)}
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            style={inputStyle(theme, !!error)}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            min={question.validations.min}
            max={question.validations.max}
            style={inputStyle(theme, !!error)}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            style={{ ...inputStyle(theme, !!error), resize: 'vertical' }}
          />
        );

      case 'single_choice':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {question.options?.map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  borderRadius: `${theme.borderRadius}px`,
                  border: `1px solid ${strVal === opt.value ? theme.primaryColor : '#d1d5db'}`,
                  backgroundColor: strVal === opt.value ? `${theme.primaryColor}08` : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={strVal === opt.value}
                  onChange={() => onChange(opt.value)}
                  style={{ accentColor: theme.primaryColor }}
                />
                <span style={{ fontSize: '14px' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice': {
        const selectedArr = Array.isArray(value) ? value : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {question.options?.map((opt) => {
              const checked = selectedArr.includes(opt.value);
              return (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: `${theme.borderRadius}px`,
                    border: `1px solid ${checked ? theme.primaryColor : '#d1d5db'}`,
                    backgroundColor: checked ? `${theme.primaryColor}08` : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked
                        ? selectedArr.filter((v) => v !== opt.value)
                        : [...selectedArr, opt.value];
                      onChange(next);
                    }}
                    style={{ accentColor: theme.primaryColor }}
                  />
                  <span style={{ fontSize: '14px' }}>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'dropdown':
        return (
          <select
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle(theme, !!error)}
          >
            <option value="">{question.placeholder || 'Select an option...'}</option>
            {question.options?.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            style={inputStyle(theme, !!error)}
          />
        );

      case 'rating': {
        const max = question.validations.max ?? 5;
        const rating = parseInt(strVal) || 0;
        return (
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(String(n))}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: `${theme.borderRadius}px`,
                  border: `1px solid ${n <= rating ? theme.primaryColor : '#d1d5db'}`,
                  backgroundColor: n <= rating ? theme.primaryColor : '#fff',
                  color: n <= rating ? '#fff' : '#374151',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        );
      }

      case 'yes_no':
        return (
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Yes', 'No'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt.toLowerCase())}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: `${theme.borderRadius}px`,
                  border: `1px solid ${strVal === opt.toLowerCase() ? theme.primaryColor : '#d1d5db'}`,
                  backgroundColor: strVal === opt.toLowerCase() ? theme.primaryColor : '#fff',
                  color: strVal === opt.toLowerCase() ? '#fff' : '#374151',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        );

      case 'legal':
        return (
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={strVal === 'accepted'}
              onChange={(e) => onChange(e.target.checked ? 'accepted' : '')}
              style={{ marginTop: '2px', accentColor: theme.primaryColor }}
            />
            <span style={{ fontSize: '14px', color: '#374151' }}>{question.label}</span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={strVal}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            style={inputStyle(theme, !!error)}
          />
        );
    }
  };

  return (
    <div>
      {question.type !== 'legal' && (
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
            marginBottom: '6px',
          }}
        >
          {question.label}
          {question.validations.required && (
            <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
          )}
        </label>
      )}
      {question.description && (
        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px' }}>
          {question.description}
        </p>
      )}
      {renderInput()}
      {error && <p style={{ fontSize: '13px', color: '#ef4444', margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}

function inputType(qType: string): string {
  switch (qType) {
    case 'email':
      return 'email';
    case 'phone':
      return 'tel';
    case 'url':
      return 'url';
    default:
      return 'text';
  }
}

function inputStyle(theme: FormTheme, hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 14px',
    borderRadius: `${theme.borderRadius}px`,
    border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.15s ease',
    boxSizing: 'border-box',
  };
}
