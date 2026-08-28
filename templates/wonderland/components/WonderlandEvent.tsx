import React from 'react';
import type { EventPageProps } from '../../types';
import { wonderlandTheme } from '../theme';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ShareSection } from '@/components/invitation/ShareSection';

export function WonderlandEvent({ event }: EventPageProps) {
  const theme = wonderlandTheme;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.bodyFont,
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(139, 0, 0, 0.25) 0%, rgba(10, 10, 15, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '560px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Card Suit Ornament Header */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '1.25rem',
            color: theme.colors.primary,
            letterSpacing: '0.5rem',
            opacity: 0.8,
          }}
        >
          ♠ ♥ ♦ ♣
        </div>

        {/* Hero Section */}
        <header
          style={{
            textAlign: 'center',
            padding: '2rem 1.5rem',
            background: theme.colors.surface,
            borderRadius: '1.25rem',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
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
              fontSize: 'clamp(2.4rem, 8vw, 3.4rem)',
              margin: '0.25rem 0 1rem 0',
              color: '#ffffff',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(197, 160, 40, 0.3)',
            }}
          >
            {event.name}
          </h1>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 1rem',
              borderRadius: '99px',
              background: 'rgba(139, 0, 0, 0.3)',
              border: '1px solid rgba(220, 38, 38, 0.4)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <span>👑</span> Invitación Especial
          </div>
        </header>

        {/* Countdown Timer */}
        {event.date && (
          <section aria-label="Cuenta regresiva">
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', color: theme.colors.primary, textTransform: 'uppercase', fontWeight: 700 }}>
                ⏳ CUENTA REGRESIVA
              </span>
            </div>
            <CountdownTimer
              targetDateStr={event.date}
              targetTimeStr={event.startTime}
              primaryColor={theme.colors.primary}
              textColor={theme.colors.text}
              cardBg={theme.colors.surface}
              borderStyle={`1px solid ${theme.colors.border}`}
            />
          </section>
        )}

        {/* Details Card */}
        <section
          aria-label="Detalles del evento"
          style={{
            background: theme.colors.surface,
            borderRadius: '1.25rem',
            border: `1px solid ${theme.colors.border}`,
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <h2
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.4rem',
              color: theme.colors.primary,
              margin: '0 0 0.5rem 0',
              textAlign: 'center',
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: '0.75rem',
            }}
          >
            Coordenadas del Evento
          </h2>

          {event.date && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>📅</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: theme.colors.primary }}>FECHA Y HORA</strong>
                <span style={{ fontSize: '1.05rem', color: theme.colors.text }}>
                  {event.date} {event.startTime && `· ${event.startTime} hs`}
                </span>
              </div>
            </div>
          )}

          {event.location && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>📍</div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: theme.colors.primary }}>LUGAR</strong>
                <span style={{ fontSize: '1.05rem', color: theme.colors.text, display: 'block', fontWeight: 600 }}>
                  {event.location}
                </span>
                {event.address && (
                  <span style={{ fontSize: '0.9rem', color: theme.colors.textMuted, display: 'block', marginTop: '0.2rem' }}>
                    {event.address}
                  </span>
                )}
                {(event.mapsUrl || event.wazeUrl) && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {event.mapsUrl && (
                      <a
                        href={event.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '0.5rem',
                          background: 'rgba(197, 160, 40, 0.15)',
                          border: `1px solid ${theme.colors.primary}`,
                          color: theme.colors.primary,
                          textDecoration: 'none',
                        }}
                      >
                        🗺️ Google Maps
                      </a>
                    )}
                    {event.wazeUrl && (
                      <a
                        href={event.wazeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '0.4rem 0.8rem',
                          borderRadius: '0.5rem',
                          background: 'rgba(197, 160, 40, 0.15)',
                          border: `1px solid ${theme.colors.primary}`,
                          color: theme.colors.primary,
                          textDecoration: 'none',
                        }}
                      >
                        🚗 Waze
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {event.dressCode && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>👔</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: theme.colors.primary }}>DRESS CODE</strong>
                <span style={{ fontSize: '0.95rem', color: theme.colors.text }}>{event.dressCode}</span>
              </div>
            </div>
          )}

          {event.giftsText && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>🎁</div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: theme.colors.primary }}>REGALOS</strong>
                <span style={{ fontSize: '0.9rem', color: theme.colors.textMuted, lineHeight: 1.4, display: 'block' }}>
                  {event.giftsText}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Share Section */}
        <ShareSection
          title={event.title}
          eventName={event.name}
          btnBg="linear-gradient(135deg, #c5a028 0%, #8b0000 100%)"
          btnColor="#ffffff"
          cardBg={theme.colors.surface}
          borderColor={theme.colors.border}
          textColor={theme.colors.text}
        />

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '1.5rem 0',
            color: theme.colors.textMuted,
            fontSize: '0.8rem',
          }}
        >
          <div style={{ color: theme.colors.primary, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
            ♥ WONDERLAND THEME ♥
          </div>
          <p style={{ margin: 0 }}>Plataforma de Invitaciones Digitales</p>
        </footer>
      </main>
    </div>
  );
}
