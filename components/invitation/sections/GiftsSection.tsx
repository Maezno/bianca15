import React from 'react';
import type { SectionBaseProps } from './types';

export function GiftsSection({ event, theme }: SectionBaseProps) {
  const [copied, setCopied] = React.useState(false);
  if (!event.giftsText) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['gifts'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  const handleCopy = () => {
    if (!event.giftsText) return;
    navigator.clipboard?.writeText(event.giftsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section
      aria-label="Mesa de regalos"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.75rem',
        textAlign: 'center',
        boxShadow: (theme.colors.surface === 'transparent' || theme.styles?.cardShadow === 'none')
          ? 'none'
          : '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        data-heading-container="true"
        style={{
          marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 8 + titleOffsetY)}px` : '0.5rem',
          transition: 'margin-bottom 0.15s ease',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <span
          data-badge="true"
          style={{
            display: 'block',
            fontSize: '0.8rem',
            color: sectionStyle?.titleColor || theme.colors.primary,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '0.35rem',
            textAlign: 'center',
          }}
        >
          MESA DE REGALOS
        </span>
        <h2
          data-heading="true"
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: '1.35rem',
            color: sectionStyle?.titleColor || theme.colors.text,
            margin: '0.25rem 0 0.5rem 0',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          Regalos
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <p
          data-body="true"
          style={{
            fontFamily: theme.typography.secondaryFont || theme.typography.bodyFont,
            fontSize: '1rem',
            color: sectionStyle?.textColor || theme.colors.text,
            lineHeight: 1.6,
            margin: 0,
            textAlign: 'center',
            letterSpacing: '0.02em',
            fontWeight: 600,
          }}
        >
          {event.giftsText}
        </p>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copiar datos de cuenta bancaria o alias"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            borderRadius: '999px',
            border: `1px solid ${copied ? '#16a34a' : theme.colors.primary}`,
            background: copied ? '#dcfce7' : `${theme.colors.primary}18`,
            color: copied ? '#15803d' : (sectionStyle?.titleColor || theme.colors.primary),
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <span>{copied ? '✓' : '📋'}</span>
          <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar Datos / Alias'}</span>
        </button>
      </div>
    </section>
  );
}
