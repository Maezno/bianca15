import React from 'react';
import type { SectionBaseProps } from './types';

export function WelcomeSection({ event, theme }: SectionBaseProps) {
  if (!event.welcomeText) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['welcome'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <section
      aria-label="Mensaje de bienvenida"
      style={{
        textAlign: 'center',
        padding: '1.75rem 1.5rem',
        background: theme.colors.surface,
        borderRadius: '1rem',
        border: `1px solid ${theme.colors.border}`,
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
        <p
          data-body="true"
          style={{
            color: sectionStyle?.titleColor || sectionStyle?.textColor || theme.colors.text,
            fontSize: '1.05rem',
            lineHeight: 1.7,
            margin: 0,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          &ldquo;{event.welcomeText}&rdquo;
        </p>
      </div>
    </section>
  );
}
