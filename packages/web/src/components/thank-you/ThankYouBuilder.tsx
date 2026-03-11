'use client';

import type { ThankYouPageConfig, ThankYouBlock, ThankYouBlockType } from '@flipflow/shared';

interface ThankYouBuilderProps {
  config: ThankYouPageConfig;
  onChange: (config: ThankYouPageConfig) => void;
}

const BLOCK_TYPE_LABELS: Record<ThankYouBlockType, string> = {
  heading: 'Heading',
  text: 'Text',
  button: 'Button',
  offer: 'Offer',
  script: 'Script',
};

export function ThankYouBuilder({ config, onChange }: ThankYouBuilderProps) {
  const updateEnabled = (enabled: boolean) => {
    onChange({ ...config, enabled });
  };

  const addBlock = (type: ThankYouBlockType) => {
    const newBlock: ThankYouBlock = {
      id: crypto.randomUUID(),
      type,
      content: '',
      ...(type === 'button' || type === 'offer' ? { url: '' } : {}),
      ...(type === 'offer' ? { description: '' } : {}),
    };
    onChange({ ...config, blocks: [...config.blocks, newBlock] });
  };

  const updateBlock = (id: string, patch: Partial<ThankYouBlock>) => {
    const blocks = config.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
    onChange({ ...config, blocks });
  };

  const removeBlock = (id: string) => {
    onChange({ ...config, blocks: config.blocks.filter((b) => b.id !== id) });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const blocks = [...config.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    [blocks[index], blocks[targetIndex]] = [blocks[targetIndex], blocks[index]];
    onChange({ ...config, blocks });
  };

  return (
    <div style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>Thank You Page</h3>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          marginBottom: '16px',
        }}
      >
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => updateEnabled(e.target.checked)}
        />
        Enable custom thank-you page
      </label>

      {config.enabled && (
        <>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}
          >
            {config.blocks.map((block, index) => (
              <div
                key={block.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#fafafa',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {BLOCK_TYPE_LABELS[block.type]}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                      style={reorderButtonStyle}
                      title="Move up"
                      type="button"
                    >
                      &uarr;
                    </button>
                    <button
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === config.blocks.length - 1}
                      style={reorderButtonStyle}
                      title="Move down"
                      type="button"
                    >
                      &darr;
                    </button>
                    <button
                      onClick={() => removeBlock(block.id)}
                      style={removeButtonStyle}
                      title="Remove block"
                      type="button"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                <BlockEditor block={block} onChange={(patch) => updateBlock(block.id, patch)} />
              </div>
            ))}

            {config.blocks.length === 0 && (
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                No blocks yet. Add one below.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(Object.keys(BLOCK_TYPE_LABELS) as ThankYouBlockType[]).map((type) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                style={addButtonStyle}
                type="button"
              >
                + {BLOCK_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
}: {
  block: ThankYouBlock;
  onChange: (patch: Partial<ThankYouBlock>) => void;
}) {
  const contentLabel = block.type === 'script' ? 'Script code' : 'Content';
  const contentPlaceholder =
    block.type === 'heading'
      ? 'Enter heading text'
      : block.type === 'text'
        ? 'Enter text or HTML'
        : block.type === 'button'
          ? 'Button label'
          : block.type === 'offer'
            ? 'Offer title'
            : 'Paste tracking script';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '12px', color: '#6b7280' }}>{contentLabel}</label>
      <textarea
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder={contentPlaceholder}
        rows={block.type === 'script' ? 4 : 2}
        style={textareaStyle}
      />

      {(block.type === 'button' || block.type === 'offer') && (
        <>
          <label style={{ fontSize: '12px', color: '#6b7280' }}>URL</label>
          <input
            type="text"
            value={block.url ?? ''}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://..."
            style={inputStyle}
          />
        </>
      )}

      {block.type === 'offer' && (
        <>
          <label style={{ fontSize: '12px', color: '#6b7280' }}>Description</label>
          <textarea
            value={block.description ?? ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Offer description"
            rows={2}
            style={textareaStyle}
          />
        </>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  width: '100%',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '13px',
  width: '100%',
  boxSizing: 'border-box',
  resize: 'vertical',
  fontFamily: 'inherit',
};

const reorderButtonStyle: React.CSSProperties = {
  padding: '2px 6px',
  borderRadius: '4px',
  border: '1px solid #d1d5db',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '12px',
  lineHeight: 1,
};

const removeButtonStyle: React.CSSProperties = {
  padding: '2px 6px',
  borderRadius: '4px',
  border: '1px solid #fca5a5',
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  cursor: 'pointer',
  fontSize: '12px',
  lineHeight: 1,
};

const addButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  backgroundColor: '#f9fafb',
  cursor: 'pointer',
  fontSize: '13px',
};
