import React from 'react';
import type { SectionBaseProps } from './types';

export function DressCodeSection({ event, theme }: SectionBaseProps) {
  if (!event.dressCode) return null;

  return (
    <section
      aria-label="Código de vestimenta"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        style={{
          fontSize: '2rem',
          background: `${theme.colors.primary}15`,
          width: '54px',
          height: '54px',
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        👔
      </div>
      <div>
        <strong
          style={{
            display: 'block',
            fontSize: '0.8rem',
            color: theme.colors.primary,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '0.2rem',
          }}
        >
          CÓDIGO DE VESTIMENTA
        </strong>
        <span style={{ fontSize: '1.05rem', color: theme.colors.text, fontWeight: 600 }}>
          {event.dressCode}
        </span>
      </div>
    </section>
  );
}
