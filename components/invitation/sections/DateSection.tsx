import React from 'react';
import type { SectionBaseProps } from './types';

function formatDateDisplay(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const dateObj = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

export function DateSection({ event, theme }: SectionBaseProps) {
  if (!event.date) return null;

  const formattedDate = formatDateDisplay(event.date);

  return (
    <section
      aria-label="Fecha y hora del evento"
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
        📅
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
          FECHA Y HORA
        </strong>
        <span
          style={{
            fontSize: '1.15rem',
            color: theme.colors.text,
            fontWeight: 700,
            display: 'block',
            textTransform: 'capitalize',
          }}
        >
          {formattedDate}
        </span>
        {event.startTime && (
          <span
            style={{
              fontSize: '0.95rem',
              color: theme.colors.textMuted,
              display: 'block',
              marginTop: '0.15rem',
              fontWeight: 500,
            }}
          >
            A las {event.startTime} hs
          </span>
        )}
      </div>
    </section>
  );
}
