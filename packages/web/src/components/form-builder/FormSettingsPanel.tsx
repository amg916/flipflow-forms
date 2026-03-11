'use client';

import type { FormSettings, FormTheme, ThankYouPageConfig } from '@flipflow/shared';
import { ThankYouBuilder } from '@/components/thank-you/ThankYouBuilder';

const FONT_OPTIONS = [
  'Inter, sans-serif',
  'system-ui, sans-serif',
  'Georgia, serif',
  'Menlo, monospace',
  '"Segoe UI", sans-serif',
  'Roboto, sans-serif',
  '"Open Sans", sans-serif',
];

interface FormSettingsPanelProps {
  settings: FormSettings;
  theme: FormTheme;
  thankYouPage?: ThankYouPageConfig;
  onChange: (patch: {
    settings?: Partial<FormSettings>;
    theme?: Partial<FormTheme>;
    thankYouPage?: ThankYouPageConfig;
  }) => void;
}

export function FormSettingsPanel({
  settings,
  theme,
  thankYouPage,
  onChange,
}: FormSettingsPanelProps) {
  return (
    <div style={containerStyle}>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* Form Settings */}
        <div style={sectionHeaderStyle}>
          <span style={sectionLabelStyle}>Form Settings</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={settings.showProgressBar}
              onChange={(e) => onChange({ settings: { showProgressBar: e.target.checked } })}
            />
            Show progress bar
          </label>
        </div>

        <div style={fieldGroupStyle}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={settings.allowBackNavigation}
              onChange={(e) => onChange({ settings: { allowBackNavigation: e.target.checked } })}
            />
            Allow back navigation
          </label>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Submit Button Text</label>
          <input
            type="text"
            value={settings.submitButtonText}
            onChange={(e) => onChange({ settings: { submitButtonText: e.target.value } })}
            placeholder="Submit"
            style={inputStyle}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Redirect URL</label>
          <input
            type="text"
            value={settings.redirectUrl || ''}
            onChange={(e) => onChange({ settings: { redirectUrl: e.target.value || undefined } })}
            placeholder="https://example.com/thank-you"
            style={inputStyle}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Notification Email</label>
          <input
            type="email"
            value={settings.notificationEmail || ''}
            onChange={(e) =>
              onChange({ settings: { notificationEmail: e.target.value || undefined } })
            }
            placeholder="notify@example.com"
            style={inputStyle}
          />
        </div>

        {/* Theme */}
        <div style={dividerStyle} />
        <div style={sectionHeaderStyle}>
          <span style={sectionLabelStyle}>Theme</span>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Primary Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => onChange({ theme: { primaryColor: e.target.value } })}
              style={{
                width: '36px',
                height: '32px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '2px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={theme.primaryColor}
              onChange={(e) => onChange({ theme: { primaryColor: e.target.value } })}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Background Color</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={theme.backgroundColor}
              onChange={(e) => onChange({ theme: { backgroundColor: e.target.value } })}
              style={{
                width: '36px',
                height: '32px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '2px',
                cursor: 'pointer',
              }}
            />
            <input
              type="text"
              value={theme.backgroundColor}
              onChange={(e) => onChange({ theme: { backgroundColor: e.target.value } })}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Font Family</label>
          <select
            value={theme.fontFamily}
            onChange={(e) => onChange({ theme: { fontFamily: e.target.value } })}
            style={selectStyle}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font.split(',')[0].replace(/"/g, '')}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Border Radius</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              min={0}
              max={24}
              value={theme.borderRadius}
              onChange={(e) => onChange({ theme: { borderRadius: parseInt(e.target.value) } })}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '28px' }}>
              {theme.borderRadius}px
            </span>
          </div>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Button Style</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onChange({ theme: { buttonStyle: 'filled' } })}
              style={{
                ...toggleBtnStyle,
                backgroundColor: theme.buttonStyle === 'filled' ? '#3b82f6' : '#fff',
                color: theme.buttonStyle === 'filled' ? '#fff' : '#374151',
                borderColor: theme.buttonStyle === 'filled' ? '#3b82f6' : '#d1d5db',
              }}
              type="button"
            >
              Filled
            </button>
            <button
              onClick={() => onChange({ theme: { buttonStyle: 'outlined' } })}
              style={{
                ...toggleBtnStyle,
                backgroundColor: theme.buttonStyle === 'outlined' ? '#3b82f6' : '#fff',
                color: theme.buttonStyle === 'outlined' ? '#fff' : '#374151',
                borderColor: theme.buttonStyle === 'outlined' ? '#3b82f6' : '#d1d5db',
              }}
              type="button"
            >
              Outlined
            </button>
          </div>
        </div>

        {/* Thank You Page */}
        <div style={dividerStyle} />
        <div style={sectionHeaderStyle}>
          <span style={sectionLabelStyle}>Thank You Page</span>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <ThankYouBuilder
            config={thankYouPage || { enabled: false, blocks: [] }}
            onChange={(config) => onChange({ thankYouPage: config })}
          />
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#fff',
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

const toggleBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '7px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 500,
  transition: 'all 0.15s',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: '#f3f4f6',
  margin: '4px 0',
};
