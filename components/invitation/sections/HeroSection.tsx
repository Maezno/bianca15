import React from 'react';
import type { SectionBaseProps } from './types';

export function HeroSection({ event, theme, guestGroup }: SectionBaseProps) {
  return (
    <header
      style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {guestGroup && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 1rem',
            borderRadius: '99px',
            background: `${theme.colors.primary}15`,
            border: `1px solid ${theme.colors.primary}35`,
            color: theme.colors.primary,
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <span>💌</span> Invitación para <strong>{guestGroup.name}</strong>
        </div>
      )}

      {/* Imagen de portada del evento (Hito 9) */}
      {event.coverImage && (
        <div
          style={{
            margin: '0 auto 1.5rem auto',
            maxWidth: '460px',
            width: '100%',
            maxHeight: '300px',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            background: theme.colors.background,
          }}
        >
          <img
            src={event.coverImage}
            alt={event.name}
            loading="eager"
            fetchPriority="high"
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      )}

      <div
        style={{
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          color: theme.colors.primary,
          fontWeight: 700,
          marginBottom: '0.75rem',
        }}
      >
        {event.title}
      </div>

      <h1
        style={{
          fontFamily: theme.typography.headingFont,
          fontSize: 'clamp(2.4rem, 8vw, 3.8rem)',
          margin: '0.25rem 0 0.85rem 0',
          color: theme.colors.text,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
        }}
      >
        {event.name}
      </h1>

      {event.subtitle && (
        <p
          style={{
            color: theme.colors.textMuted,
            fontSize: '1.05rem',
            margin: '0 0 1rem 0',
            fontStyle: 'italic',
            lineHeight: 1.5,
          }}
        >
          {event.subtitle}
        </p>
      )}

      <div
        style={{
          width: '50px',
          height: '2px',
          background: theme.colors.primary,
          margin: '0.5rem auto 0 auto',
          borderRadius: '99px',
          opacity: 0.7,
        }}
      />
    </header>
  );
}
