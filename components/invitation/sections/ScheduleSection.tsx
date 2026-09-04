import React from 'react';
import type { SectionBaseProps } from './types';

export function ScheduleSection({ event, theme }: SectionBaseProps) {
  if (!event.schedule || event.schedule.length === 0) return null;

  return (
    <section
      aria-label="Cronograma del evento"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.75rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: theme.colors.primary,
            fontWeight: 700,
          }}
        >
          ⏰ CRONOGRAMA
        </span>
        <h2
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: '1.35rem',
            color: theme.colors.text,
            margin: '0.35rem 0 0 0',
            fontWeight: 700,
          }}
        >
          Momentos Especiales
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {event.schedule.map((item, idx) => (
          <div
            key={item.id || idx}
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              background: `${theme.colors.primary}08`,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                background: theme.colors.primary,
                color: '#ffffff',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.5rem',
                fontWeight: 800,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
              }}
            >
              {item.time} hs
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.95rem', color: theme.colors.text }}>
                {item.title}
              </strong>
              {item.description && (
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted, display: 'block', marginTop: '0.15rem' }}>
                  {item.description}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
