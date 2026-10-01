import React from 'react';
import type { SectionBaseProps } from './types';

export function GiftsSection({ event, theme }: SectionBaseProps) {
  if (!event.giftsText) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['gifts'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

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
          transform: titleOffsetY !== undefined ? `translateY(${titleOffsetY}px)` : undefined,
          transition: 'transform 0.15s ease',
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

      <p
        data-body="true"
        style={{
          fontSize: '0.95rem',
          color: theme.colors.textMuted,
          lineHeight: 1.6,
          margin: 0,
          textAlign: 'center',
        }}
      >
        {event.giftsText}
      </p>
    </section>
  );
}
