import React from 'react';
import type { SectionBaseProps } from './types';
import { ActionButton } from '@/components/invitation/ActionButton';

export function LocationSection({ event, theme }: SectionBaseProps) {
  if (!event.location) return null;

  return (
    <section
      aria-label="Ubicación del evento"
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
          📍
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
              marginBottom: '0.25rem',
            }}
          >
            LUGAR DE CELEBRACIÓN
          </strong>
          <span
            style={{
              fontSize: '1.2rem',
              color: theme.colors.text,
              fontWeight: 800,
              display: 'block',
              lineHeight: 1.3,
            }}
          >
            {event.location}
          </span>
          {event.address && (
            <span
              style={{
                fontSize: '0.95rem',
                color: theme.colors.textMuted,
                display: 'block',
                marginTop: '0.35rem',
                lineHeight: 1.4,
              }}
            >
              {event.address}
            </span>
          )}

          {(event.mapsUrl || event.wazeUrl) && (
            <div
              style={{
                display: 'flex',
                gap: '0.65rem',
                marginTop: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              {event.mapsUrl && (
                <ActionButton
                  label="Google Maps"
                  icon="🗺️"
                  href={event.mapsUrl}
                  variant="primary"
                  primaryColor={theme.colors.primary}
                  textColor="#ffffff"
                />
              )}
              {event.wazeUrl && (
                <ActionButton
                  label="Waze"
                  icon="🚗"
                  href={event.wazeUrl}
                  variant="outline"
                  primaryColor={theme.colors.primary}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
