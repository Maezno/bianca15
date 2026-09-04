import React from 'react';
import type { SectionBaseProps } from './types';

export function FooterSection({ event, theme }: SectionBaseProps) {
  return (
    <footer
      aria-label="Pie de invitación"
      style={{
        textAlign: 'center',
        padding: '2rem 1rem 1rem 1rem',
        color: theme.colors.textMuted,
        fontSize: '0.85rem',
      }}
    >
      <div
        style={{
          color: theme.colors.primary,
          letterSpacing: '0.2em',
          fontWeight: 700,
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
        }}
      >
        ✦ {event.name} ✦
      </div>
      <p style={{ margin: 0, opacity: 0.8 }}>
        Plataforma de Invitaciones Digitales
      </p>
    </footer>
  );
}
