import React from 'react';
import type { SectionBaseProps } from './types';

export function GiftsSection({ event, theme }: SectionBaseProps) {
  if (!event.giftsText) return null;

  return (
    <section
      aria-label="Mesa de regalos"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.75rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
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
          🎁
        </div>
        <div style={{ flex: 1 }}>
          <strong
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: theme.colors.primary,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '0.35rem',
            }}
          >
            REGALOS
          </strong>
          <p
            style={{
              fontSize: '0.95rem',
              color: theme.colors.textMuted,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {event.giftsText}
          </p>
        </div>
      </div>
    </section>
  );
}
