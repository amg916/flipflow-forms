'use client';

import { useState, useMemo, useCallback } from 'react';
import type { FormDefinition, FormAnswers } from '@flipflow/shared';
import { getVisibleQuestions, resolveNextStep, getReachableSteps } from '@flipflow/shared';
import { QuestionField } from './QuestionField';

interface FormRendererProps {
  definition: FormDefinition;
  onSubmit: (answers: FormAnswers, metadata: Record<string, string>) => void;
  embedded?: boolean;
}

export function FormRenderer({ definition, onSubmit, embedded }: FormRendererProps) {
  const { steps, theme, settings } = definition;
  const sortedSteps = useMemo(() => [...steps].sort((a, b) => a.order - b.order), [steps]);

  const [answers, setAnswers] = useState<FormAnswers>({});
  const [stepHistory, setStepHistory] = useState<string[]>([sortedSteps[0]?.id ?? '']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const currentStepId = stepHistory[stepHistory.length - 1];
  const currentStep = steps.find((s) => s.id === currentStepId);

  // Capture UTM/tracking params from URL
  const [metadata] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    const meta: Record<string, string> = {};
    const trackingKeys = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'subid',
      'affiliate_id',
    ];
    trackingKeys.forEach((key) => {
      const val = params.get(key);
      if (val) meta[key] = val;
    });
    return meta;
  });

  const visibleQuestions = useMemo(
    () => (currentStep ? getVisibleQuestions(currentStep, answers) : []),
    [currentStep, answers],
  );

  const reachableSteps = useMemo(
    () => getReachableSteps(definition, answers),
    [definition, answers],
  );
  const currentReachableIndex = reachableSteps.indexOf(currentStepId);
  const totalReachable = reachableSteps.length;
  const isLastStep = currentReachableIndex === totalReachable - 1;

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    for (const q of visibleQuestions) {
      const val = answers[q.id];
      const strVal = Array.isArray(val) ? val.join('') : (val ?? '');

      if (q.validations.required && !strVal.trim()) {
        newErrors[q.id] = 'This field is required';
        continue;
      }
      if (!strVal) continue;

      if (q.validations.minLength && strVal.length < q.validations.minLength) {
        newErrors[q.id] = `Minimum ${q.validations.minLength} characters`;
      }
      if (q.validations.maxLength && strVal.length > q.validations.maxLength) {
        newErrors[q.id] = `Maximum ${q.validations.maxLength} characters`;
      }
      if (q.validations.pattern) {
        try {
          if (!new RegExp(q.validations.pattern).test(strVal)) {
            newErrors[q.id] = 'Invalid format';
          }
        } catch {
          // invalid regex in config — skip
        }
      }
      if (q.validations.min !== undefined && parseFloat(strVal) < q.validations.min) {
        newErrors[q.id] = `Minimum value is ${q.validations.min}`;
      }
      if (q.validations.max !== undefined && parseFloat(strVal) > q.validations.max) {
        newErrors[q.id] = `Maximum value is ${q.validations.max}`;
      }

      // Type-specific validation
      if (q.type === 'email' && strVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
        newErrors[q.id] = 'Please enter a valid email';
      }
      if (q.type === 'url' && strVal) {
        try {
          new URL(strVal);
        } catch {
          newErrors[q.id] = 'Please enter a valid URL';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate() || !currentStep) return;

    if (isLastStep) {
      handleSubmit();
      return;
    }

    const nextId = resolveNextStep(currentStep, answers, steps);
    if (nextId) {
      setDirection('forward');
      setStepHistory((prev) => [...prev, nextId]);
    }
  };

  const handleBack = () => {
    if (stepHistory.length > 1) {
      setDirection('back');
      setStepHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(answers, metadata);
      setSubmitted(true);
      if (settings.redirectUrl) {
        window.location.href = settings.redirectUrl;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={containerStyle(theme, embedded)}>
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Thank you!</h2>
          <p style={{ color: '#6b7280' }}>Your response has been submitted.</p>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div style={containerStyle(theme, embedded)}>
      {settings.showProgressBar && totalReachable > 1 && (
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '6px',
            }}
          >
            <span>
              Step {currentReachableIndex + 1} of {totalReachable}
            </span>
            <span>{Math.round(((currentReachableIndex + 1) / totalReachable) * 100)}%</span>
          </div>
          <div
            style={{
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((currentReachableIndex + 1) / totalReachable) * 100}%`,
                backgroundColor: theme.primaryColor,
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      <div
        key={currentStepId}
        style={{
          animation: `slideIn${direction === 'forward' ? 'Right' : 'Left'} 0.3s ease`,
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '24px',
            color: '#111827',
          }}
        >
          {currentStep.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {visibleQuestions.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              value={answers[q.id]}
              error={errors[q.id]}
              onChange={(val) => setAnswer(q.id, val)}
              theme={theme}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '32px',
          gap: '12px',
        }}
      >
        {settings.allowBackNavigation && stepHistory.length > 1 ? (
          <button onClick={handleBack} style={backButtonStyle(theme)} type="button">
            Back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          disabled={isSubmitting}
          style={nextButtonStyle(theme)}
          type="button"
        >
          {isSubmitting
            ? 'Submitting...'
            : isLastStep
              ? settings.submitButtonText || 'Submit'
              : 'Next'}
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function containerStyle(theme: FormDefinition['theme'], embedded?: boolean): React.CSSProperties {
  return {
    maxWidth: '640px',
    margin: embedded ? '0' : '0 auto',
    padding: '32px',
    backgroundColor: theme.backgroundColor,
    fontFamily: theme.fontFamily,
    borderRadius: `${theme.borderRadius}px`,
    ...(embedded ? {} : { minHeight: '100vh' }),
  };
}

function nextButtonStyle(theme: FormDefinition['theme']): React.CSSProperties {
  const filled = theme.buttonStyle === 'filled';
  return {
    padding: '12px 32px',
    borderRadius: `${theme.borderRadius}px`,
    border: filled ? 'none' : `2px solid ${theme.primaryColor}`,
    backgroundColor: filled ? theme.primaryColor : 'transparent',
    color: filled ? '#fff' : theme.primaryColor,
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };
}

function backButtonStyle(theme: FormDefinition['theme']): React.CSSProperties {
  return {
    padding: '12px 24px',
    borderRadius: `${theme.borderRadius}px`,
    border: '1px solid #d1d5db',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '15px',
    cursor: 'pointer',
  };
}
