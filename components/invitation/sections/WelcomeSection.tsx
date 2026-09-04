import React from 'react';
import type { SectionBaseProps } from './types';

export function WelcomeSection({ event, theme }: SectionBaseProps) {
  if (!event.welcomeText) return null;

  return (
    <section
      aria-label="Mensaje de bienvenida"
      style={{
        textAlign: 'center',
        padding: '1.75rem 1.5rem',
        background: theme.colors.surface,
        borderRadius: '1rem',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }} aria-hidden="true">
        ✨
      </span>
      <p
        style={{
          color: theme.colors.text,
          fontSize: '1.05rem',
          lineHeight: 1.7,
          margin: 0,
          fontStyle: 'italic',
        }}
      >
        &ldquo;{event.welcomeText}&rdquo;
      </p>
    </section>
  );
}
