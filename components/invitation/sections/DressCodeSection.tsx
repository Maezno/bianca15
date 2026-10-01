import React from 'react';
import type { SectionBaseProps } from './types';

export function DressCodeSection({ event, theme }: SectionBaseProps) {
  if (!event.dressCode) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['dress_code'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <section
      aria-label="Código de vestimenta"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.5rem',
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
          CÓDIGO DE VESTIMENTA
        </span>
        <h2
          data-heading="true"
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: '1.25rem',
            color: sectionStyle?.titleColor || theme.colors.text,
            fontWeight: 500,
            margin: '0.2rem 0',
            textAlign: 'center',
          }}
        >
          {event.dressCode}
        </h2>
      </div>
    </section>
  );
}
