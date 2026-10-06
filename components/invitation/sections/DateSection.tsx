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

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['date'];
  const titleOffsetY = sectionStyle?.titleOffsetY;
  const formattedDate = formatDateDisplay(event.date);

  return (
    <section
      aria-label="Fecha y hora del evento"
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
      {(!sectionStyle?.hideTitle || !sectionStyle?.hideText) && (
        <div
          data-heading-container="true"
          style={{
            marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 8 + titleOffsetY)}px` : '0.5rem',
            transition: 'margin-bottom 0.15s ease',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {!sectionStyle?.hideTitle && !sectionStyle?.hideText && (
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
              FECHA Y HORA
            </span>
          )}
          {!sectionStyle?.hideText && (
            <h2
              data-heading="true"
              style={{
                fontFamily: theme.typography.headingFont,
                fontSize: '1.25rem',
                color: sectionStyle?.titleColor || theme.colors.text,
                fontWeight: 500,
                margin: '0.2rem 0',
                textTransform: 'capitalize',
                textAlign: 'center',
              }}
            >
              {formattedDate}
            </h2>
          )}
        </div>
      )}

      {event.startTime && !sectionStyle?.hideSubtitle && !sectionStyle?.hideText && (
        <p
          data-body="true"
          style={{
            fontSize: '0.95rem',
            color: theme.colors.textMuted,
            margin: '0.35rem 0 0 0',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          A las {event.startTime} hs
        </p>
      )}
    </section>
  );
}
