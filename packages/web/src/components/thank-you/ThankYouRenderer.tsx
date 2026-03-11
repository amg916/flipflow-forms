'use client';

import { useEffect } from 'react';
import type { ThankYouPageConfig, ThankYouBlock, FormTheme } from '@flipflow/shared';

interface ThankYouRendererProps {
  config: ThankYouPageConfig;
  theme: FormTheme;
}

export function ThankYouRenderer({ config, theme }: ThankYouRendererProps) {
  if (!config.enabled || config.blocks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', fontFamily: theme.fontFamily }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Thank you!</h2>
        <p style={{ color: '#6b7280' }}>Your response has been submitted.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '32px',
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
        borderRadius: `${theme.borderRadius}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {config.blocks.map((block) => (
        <ThankYouBlockRenderer key={block.id} block={block} theme={theme} />
      ))}
    </div>
  );
}

function ThankYouBlockRenderer({ block, theme }: { block: ThankYouBlock; theme: FormTheme }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#111827',
            margin: 0,
          }}
        >
          {block.content}
        </h2>
      );

    case 'text':
      return (
        <div
          style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );

    case 'button': {
      const filled = theme.buttonStyle === 'filled';
      return (
        <div>
          <a
            href={block.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              borderRadius: `${theme.borderRadius}px`,
              border: filled ? 'none' : `2px solid ${theme.primaryColor}`,
              backgroundColor: filled ? theme.primaryColor : 'transparent',
              color: filled ? '#fff' : theme.primaryColor,
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {block.content}
          </a>
        </div>
      );
    }

    case 'offer':
      return (
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: `${theme.borderRadius}px`,
            padding: '20px',
            backgroundColor: '#f9fafb',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px', color: '#111827' }}>
            {block.content}
          </h3>
          {block.description && (
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>
              {block.description}
            </p>
          )}
          {block.url && (
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.primaryColor,
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Learn more &rarr;
            </a>
          )}
        </div>
      );

    case 'script':
      return <ScriptInjector content={block.content} />;

    default:
      return null;
  }
}

function ScriptInjector({ content }: { content: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.textContent = content;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [content]);

  return null;
}
