'use client';

import { FormRenderer } from '@/components/form-renderer';
import type { FormDefinition, FormAnswers } from '@flipflow/shared';

interface FormPageProps {
  form: {
    id: string;
    title: string;
    description?: string;
    definition: FormDefinition;
  };
  embedded: boolean;
}

export function FormPage({ form, embedded }: FormPageProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleSubmit = async (answers: FormAnswers, metadata: Record<string, string>) => {
    const res = await fetch(`${apiUrl}/forms/public/${form.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: answers, metadata }),
    });

    if (!res.ok) {
      throw new Error('Failed to submit form');
    }

    // Notify parent if embedded in iframe
    if (embedded && typeof window !== 'undefined') {
      window.parent.postMessage({ type: 'flipflow:submitted', formId: form.id }, '*');
    }
  };

  return (
    <div
      style={{
        minHeight: embedded ? 'auto' : '100vh',
        backgroundColor: form.definition.theme?.backgroundColor ?? '#fff',
      }}
    >
      <FormRenderer definition={form.definition} onSubmit={handleSubmit} embedded={embedded} />

      {/* Resize notifier for iframe embeds */}
      {embedded && <IframeResizer />}
    </div>
  );
}

function IframeResizer() {
  if (typeof window === 'undefined') return null;

  // Post height to parent for iframe auto-resize
  const sendHeight = () => {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: 'flipflow:resize', height }, '*');
  };

  // Observe body for size changes
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
  }

  return null;
}
