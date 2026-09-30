import React from 'react';
import type { SectionBaseProps } from './types';
import { ActionButton } from '@/components/invitation/ActionButton';

export function LocationSection({ event, theme }: SectionBaseProps) {
  if (!event.location) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['location'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <section
      aria-label="Ubicación del evento"
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
      <div
        data-heading-container="true"
        style={{
          transform: titleOffsetY !== undefined ? `translateY(${titleOffsetY}px)` : undefined,
          transition: 'transform 0.15s ease',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <span
          data-badge="true"
          style={{
            display: 'block',
            fontSize: '0.8rem',
            color: theme.colors.primary,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: '0.35rem',
            textAlign: 'center',
          }}
        >
          LUGAR DE CELEBRACIÓN
        </span>
        <h2
          data-heading="true"
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: '1.25rem',
            color: theme.colors.text,
            fontWeight: 500,
            margin: '0.2rem 0',
            lineHeight: 1.3,
            textAlign: 'center',
          }}
        >
          {event.location}
        </h2>
      </div>

      {event.address && (
        <p
          data-body="true"
          style={{
            fontSize: '0.95rem',
            color: theme.colors.textMuted,
            margin: '0.35rem 0 0 0',
            lineHeight: 1.4,
            textAlign: 'center',
          }}
        >
          {event.address}
        </p>
      )}

      {(event.mapsUrl || event.wazeUrl) && (
        <div
          style={{
            display: 'flex',
            gap: '0.65rem',
            marginTop: '1.25rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {event.mapsUrl && (
            <ActionButton
              label="Google Maps"
              href={event.mapsUrl}
              variant="primary"
              primaryColor={theme.colors.primary}
              textColor="#ffffff"
            />
          )}
          {event.wazeUrl && (
            <ActionButton
              label="Waze"
              href={event.wazeUrl}
              variant="outline"
              primaryColor={theme.colors.primary}
            />
          )}
        </div>
      )}
    </section>
  );
}
