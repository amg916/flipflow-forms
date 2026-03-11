'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import type {
  FormDefinition,
  Step,
  Question,
  QuestionType,
  LogicRule,
  FormSettings,
  FormTheme,
  ThankYouPageConfig,
} from '@flipflow/shared';
import { StepList } from '@/components/form-builder/StepList';
import { QuestionEditor } from '@/components/form-builder/QuestionEditor';
import { QuestionProperties } from '@/components/form-builder/QuestionProperties';
import { FormSettingsPanel } from '@/components/form-builder/FormSettingsPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type RightPanel = 'properties' | 'settings';

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(undefined);
  const [rightPanel, setRightPanel] = useState<RightPanel>('properties');
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<FormDefinition | null>(null);

  // Fetch form
  useEffect(() => {
    async function fetchForm() {
      try {
        const res = await fetch(`${API_URL}/forms/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load form');
        const json = await res.json();
        const data: FormDefinition = json.data ?? json;
        setForm(data);
        formRef.current = data;
        if (data.steps.length > 0) {
          const sorted = [...data.steps].sort((a, b) => a.order - b.order);
          setSelectedStepId(sorted[0].id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [id]);

  // Auto-save with debounce
  const scheduleSave = useCallback(
    (updated: FormDefinition) => {
      formRef.current = updated;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          const res = await fetch(`${API_URL}/forms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formRef.current),
          });
          if (res.ok) setLastSaved(new Date());
        } catch {
          // silent fail on auto-save
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
    [id],
  );

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const updateForm = useCallback(
    (updater: (prev: FormDefinition) => FormDefinition) => {
      setForm((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave],
  );

  // Manual save
  const handleSave = async () => {
    if (!formRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formRef.current),
      });
      if (res.ok) setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  };

  // Publish / Unpublish
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/forms/${id}/${published ? 'unpublish' : 'publish'}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) setPublished(!published);
    } finally {
      setPublishing(false);
    }
  };

  // Preview
  const handlePreview = () => {
    window.open(`/f/${id}`, '_blank');
  };

  // --- Step operations ---
  const handleAddStep = () => {
    updateForm((prev) => {
      const maxOrder = prev.steps.reduce((max, s) => Math.max(max, s.order), 0);
      const newStep: Step = {
        id: crypto.randomUUID(),
        title: `Step ${prev.steps.length + 1}`,
        order: maxOrder + 1,
        questions: [],
        conditions: [],
      };
      const updated = { ...prev, steps: [...prev.steps, newStep] };
      setSelectedStepId(newStep.id);
      setSelectedQuestionId(undefined);
      return updated;
    });
  };

  const handleReorderStep = (stepId: string, direction: 'up' | 'down') => {
    updateForm((prev) => {
      const sorted = [...prev.steps].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === stepId);
      if (idx < 0) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;
      // Swap orders
      const tempOrder = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[targetIdx].order };
      sorted[targetIdx] = { ...sorted[targetIdx], order: tempOrder };
      return { ...prev, steps: sorted };
    });
  };

  const handleDeleteStep = (stepId: string) => {
    updateForm((prev) => {
      const remaining = prev.steps.filter((s) => s.id !== stepId);
      if (selectedStepId === stepId) {
        const sorted = [...remaining].sort((a, b) => a.order - b.order);
        setSelectedStepId(sorted[0]?.id ?? '');
        setSelectedQuestionId(undefined);
      }
      return { ...prev, steps: remaining };
    });
  };

  // --- Question operations ---
  const handleAddQuestion = (type: QuestionType) => {
    updateForm((prev) => {
      const steps = prev.steps.map((s) => {
        if (s.id !== selectedStepId) return s;
        const newQuestion: Question = {
          id: crypto.randomUUID(),
          type,
          label: '',
          validations: {},
        };
        return { ...s, questions: [...s.questions, newQuestion] };
      });
      const step = steps.find((s) => s.id === selectedStepId);
      if (step) {
        const lastQ = step.questions[step.questions.length - 1];
        if (lastQ) setSelectedQuestionId(lastQ.id);
      }
      return { ...prev, steps };
    });
  };

  const handleUpdateQuestion = (questionId: string, patch: Partial<Question>) => {
    updateForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id !== selectedStepId) return s;
        return {
          ...s,
          questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
        };
      }),
    }));
  };

  const handleDeleteQuestion = (questionId: string) => {
    updateForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id !== selectedStepId) return s;
        return { ...s, questions: s.questions.filter((q) => q.id !== questionId) };
      }),
    }));
    if (selectedQuestionId === questionId) setSelectedQuestionId(undefined);
  };

  const handleReorderQuestion = (questionId: string, direction: 'up' | 'down') => {
    updateForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id !== selectedStepId) return s;
        const questions = [...s.questions];
        const idx = questions.findIndex((q) => q.id === questionId);
        if (idx < 0) return s;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= questions.length) return s;
        [questions[idx], questions[targetIdx]] = [questions[targetIdx], questions[idx]];
        return { ...s, questions };
      }),
    }));
  };

  const handleStepRulesChange = (rules: LogicRule[]) => {
    updateForm((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === selectedStepId ? { ...s, conditions: rules } : s)),
    }));
  };

  // --- Form settings/theme changes ---
  const handleSettingsChange = (patch: {
    settings?: Partial<FormSettings>;
    theme?: Partial<FormTheme>;
    thankYouPage?: ThankYouPageConfig;
  }) => {
    updateForm((prev) => ({
      ...prev,
      ...(patch.settings ? { settings: { ...prev.settings, ...patch.settings } } : {}),
      ...(patch.theme ? { theme: { ...prev.theme, ...patch.theme } } : {}),
      ...(patch.thankYouPage !== undefined ? { thankYouPage: patch.thankYouPage } : {}),
    }));
  };

  // --- Title edit ---
  const handleTitleChange = (title: string) => {
    updateForm((prev) => ({ ...prev, title }));
  };

  // Derived
  const selectedStep = form?.steps.find((s) => s.id === selectedStepId);
  const selectedQuestion = selectedStep?.questions.find((q) => q.id === selectedQuestionId);
  const allQuestions = form?.steps.flatMap((s) => s.questions) ?? [];

  // --- Loading / Error states ---
  if (loading) {
    return (
      <div style={fullPageCenterStyle}>
        <div style={spinnerStyle} />
        <p style={{ color: '#6b7280', marginTop: '16px' }}>Loading form...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div style={fullPageCenterStyle}>
        <p style={{ color: '#ef4444', fontSize: '16px' }}>{error || 'Form not found'}</p>
      </div>
    );
  }

  return (
    <div style={builderRootStyle}>
      {/* Top Bar */}
      <div style={topBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
          <a
            href="/dashboard/forms"
            style={{ color: '#6b7280', textDecoration: 'none', fontSize: '20px', lineHeight: 1 }}
            title="Back to forms"
          >
            &#8592;
          </a>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={titleInputStyle}
            placeholder="Untitled Form"
          />
          {saving && <span style={savingBadgeStyle}>Saving...</span>}
          {!saving && lastSaved && (
            <span style={savedBadgeStyle}>
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setRightPanel(rightPanel === 'settings' ? 'properties' : 'settings')}
            style={{
              ...topBarBtnStyle,
              backgroundColor: rightPanel === 'settings' ? '#eff6ff' : '#fff',
              color: rightPanel === 'settings' ? '#3b82f6' : '#374151',
              borderColor: rightPanel === 'settings' ? '#3b82f6' : '#d1d5db',
            }}
            type="button"
          >
            Settings
          </button>
          <button onClick={handlePreview} style={topBarBtnStyle} type="button">
            Preview
          </button>
          <button onClick={handleSave} style={topBarBtnStyle} disabled={saving} type="button">
            Save
          </button>
          <button
            onClick={handlePublish}
            style={publishBtnStyle}
            disabled={publishing}
            type="button"
          >
            {publishing ? '...' : published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Three-panel layout */}
      <div style={panelsContainerStyle}>
        {/* Left Sidebar - Step List */}
        <div style={leftSidebarStyle}>
          <StepList
            steps={form.steps}
            selectedStepId={selectedStepId}
            onSelect={(stepId) => {
              setSelectedStepId(stepId);
              setSelectedQuestionId(undefined);
            }}
            onAdd={handleAddStep}
            onReorder={handleReorderStep}
            onDelete={handleDeleteStep}
          />
        </div>

        {/* Center - Question Editor */}
        <div style={centerPanelStyle}>
          {selectedStep ? (
            <QuestionEditor
              step={selectedStep}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={(qId) => {
                setSelectedQuestionId(qId);
                setRightPanel('properties');
              }}
              onAddQuestion={handleAddQuestion}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onReorderQuestion={handleReorderQuestion}
            />
          ) : (
            <div style={{ ...fullPageCenterStyle, color: '#9ca3af' }}>
              <p>Add a step to get started</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={rightSidebarStyle}>
          {rightPanel === 'properties' ? (
            <QuestionProperties
              question={selectedQuestion}
              step={selectedStep || { id: '', title: '', order: 0, questions: [] }}
              allSteps={form.steps}
              allQuestions={allQuestions}
              onChange={(patch) => {
                if (selectedQuestionId) handleUpdateQuestion(selectedQuestionId, patch);
              }}
              onStepRulesChange={handleStepRulesChange}
            />
          ) : (
            <FormSettingsPanel
              settings={form.settings}
              theme={form.theme}
              thankYouPage={form.thankYouPage}
              onChange={handleSettingsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Styles ---

const builderRootStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f9fafb',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  height: '56px',
  backgroundColor: '#fff',
  borderBottom: '1px solid #e5e7eb',
  flexShrink: 0,
  zIndex: 10,
};

const titleInputStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  color: '#111827',
  padding: '4px 0',
  minWidth: 0,
  flex: 1,
  maxWidth: '400px',
};

const savingBadgeStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#f59e0b',
  fontWeight: 500,
  flexShrink: 0,
};

const savedBadgeStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#10b981',
  fontWeight: 500,
  flexShrink: 0,
};

const topBarBtnStyle: React.CSSProperties = {
  padding: '7px 14px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
  color: '#374151',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
};

const publishBtnStyle: React.CSSProperties = {
  padding: '7px 18px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#3b82f6',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
};

const panelsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};

const leftSidebarStyle: React.CSSProperties = {
  width: '220px',
  minWidth: '220px',
  borderRight: '1px solid #e5e7eb',
  backgroundColor: '#fff',
  overflow: 'hidden',
};

const centerPanelStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  backgroundColor: '#fafbfc',
};

const rightSidebarStyle: React.CSSProperties = {
  width: '280px',
  minWidth: '280px',
  borderLeft: '1px solid #e5e7eb',
  backgroundColor: '#fff',
  overflow: 'hidden',
};

const fullPageCenterStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
};

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '3px solid #e5e7eb',
  borderTopColor: '#3b82f6',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};
