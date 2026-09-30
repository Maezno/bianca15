import React from 'react';
import type { SectionBaseProps } from './types';

export function FooterSection({ event, theme }: SectionBaseProps) {
  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['footer'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <footer
      aria-label="Pie de invitación"
      style={{
        textAlign: 'center',
        padding: '2rem 1rem 1rem 1rem',
        color: theme.colors.textMuted,
        fontSize: '0.85rem',
        width: '100%',
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
        <h4
          data-heading="true"
          style={{
            fontFamily: theme.typography.headingFont,
            color: theme.colors.primary,
            letterSpacing: '0.2em',
            fontWeight: 700,
            margin: '0 0 0.5rem 0',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          {event.name}
        </h4>
      </div>
      <p data-body="true" style={{ margin: 0, opacity: 0.8, textAlign: 'center' }}>
        Plataforma de Invitaciones Digitales
      </p>
    </footer>
  );
}
