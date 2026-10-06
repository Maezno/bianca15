import React from 'react';
import type { SectionBaseProps } from './types';

export function ScheduleSection({ event, theme }: SectionBaseProps) {
  if (!event.schedule || event.schedule.length === 0) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['schedule'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <section
      aria-label="Cronograma del evento"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.75rem',
        textAlign: 'center',
        boxShadow: (theme.colors.surface === 'transparent' || theme.styles?.cardShadow === 'none')
          ? 'none'
          : '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      {!sectionStyle?.hideTitle && !sectionStyle?.hideText && (
        <div
          data-heading-container="true"
          style={{
            textAlign: 'center',
            marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 20 + titleOffsetY)}px` : '1.25rem',
            transition: 'margin-bottom 0.15s ease',
            width: '100%',
          }}
        >
          <span
            data-badge="true"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: sectionStyle?.titleColor || theme.colors.primary,
              fontWeight: 700,
              marginBottom: '0.35rem',
              textAlign: 'center',
            }}
          >
            CRONOGRAMA
          </span>
          <h2
            data-heading="true"
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.35rem',
              color: sectionStyle?.titleColor || theme.colors.text,
              margin: '0.2rem 0 0 0',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Momentos Especiales
          </h2>
        </div>
      )}

      <div data-card-copy="true" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                fontWeight: 600,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                letterSpacing: '0.05em',
              }}
            >
              {item.time} hs
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <strong data-body="true" style={{ display: 'block', fontSize: '0.95rem', color: theme.colors.text }}>
                {item.title}
              </strong>
              {item.description && (
                <span data-body="true" style={{ fontSize: '0.85rem', color: theme.colors.textMuted, display: 'block', marginTop: '0.15rem' }}>
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
