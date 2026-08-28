import React from 'react';
import type { EventPageProps } from '../../types';
import { elegantTheme } from '../theme';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ShareSection } from '@/components/invitation/ShareSection';

export function ElegantEvent({ event }: EventPageProps) {
  const theme = elegantTheme;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.bodyFont,
        padding: '2.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <main
        style={{
          maxWidth: '560px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Subtle Decorative Monogram / Line */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '1.5rem', color: theme.colors.primary, letterSpacing: '0.3em' }}>
            ✦ — ✦ — ✦
          </span>
        </div>

        {/* Hero Section */}
        <header
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            background: theme.colors.surface,
            borderRadius: '1rem',
            border: `1px solid ${theme.colors.border}`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: theme.colors.primary,
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            {event.title}
          </div>

          <h1
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: 'clamp(2.6rem, 8vw, 3.6rem)',
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: theme.colors.text,
              margin: '0.25rem 0 1rem 0',
              lineHeight: 1.15,
            }}
          >
            {event.name}
          </h1>

          <div
            style={{
              width: '40px',
              height: '1px',
              background: theme.colors.primary,
              margin: '1rem auto',
            }}
          />

          <p
            style={{
              fontSize: '0.95rem',
              color: theme.colors.textMuted,
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            Tenemos el honor de invitarte a celebrar con nosotros
          </p>
        </header>

        {/* Countdown */}
        {event.date && (
          <section aria-label="Cuenta regresiva">
            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  color: theme.colors.primary,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Cuenta Regresiva
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
          aria-label="Detalles de la celebración"
          style={{
            background: theme.colors.surface,
            borderRadius: '1rem',
            border: `1px solid ${theme.colors.border}`,
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          }}
        >
          <h2
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.6rem',
              fontWeight: 500,
              color: theme.colors.text,
              margin: '0 0 0.5rem 0',
              textAlign: 'center',
              letterSpacing: '0.05em',
            }}
          >
            Detalles de la Celebración
          </h2>

          {event.date && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: theme.colors.primary, fontWeight: 700 }}>
                FECHA Y HORA
              </div>
              <div style={{ fontSize: '1.2rem', fontFamily: theme.typography.headingFont, color: theme.colors.text, marginTop: '0.25rem' }}>
                {event.date}
              </div>
              {event.startTime && (
                <div style={{ fontSize: '0.9rem', color: theme.colors.textMuted }}>
                  A las {event.startTime} horas
                </div>
              )}
            </div>
          )}

          {event.location && (
            <div style={{ textAlign: 'center', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: theme.colors.primary, fontWeight: 700 }}>
                LUGAR
              </div>
              <div style={{ fontSize: '1.2rem', fontFamily: theme.typography.headingFont, color: theme.colors.text, marginTop: '0.25rem' }}>
                {event.location}
              </div>
              {event.address && (
                <div style={{ fontSize: '0.9rem', color: theme.colors.textMuted, marginTop: '0.15rem' }}>
                  {event.address}
                </div>
              )}
              {(event.mapsUrl || event.wazeUrl) && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {event.mapsUrl && (
                    <a
                      href={event.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '0.375rem',
                        background: '#faf9f6',
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.text,
                        textDecoration: 'none',
                      }}
                    >
                      Ver en Google Maps
                    </a>
                  )}
                  {event.wazeUrl && (
                    <a
                      href={event.wazeUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.35rem 0.75rem',
                        borderRadius: '0.375rem',
                        background: '#faf9f6',
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.text,
                        textDecoration: 'none',
                      }}
                    >
                      Ver en Waze
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {event.dressCode && (
            <div style={{ textAlign: 'center', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: theme.colors.primary, fontWeight: 700 }}>
                DRESS CODE
              </div>
              <div style={{ fontSize: '1rem', color: theme.colors.text, marginTop: '0.25rem' }}>
                {event.dressCode}
              </div>
            </div>
          )}

          {event.giftsText && (
            <div style={{ textAlign: 'center', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: theme.colors.primary, fontWeight: 700 }}>
                MESA DE REGALOS
              </div>
              <div style={{ fontSize: '0.875rem', color: theme.colors.textMuted, marginTop: '0.25rem', lineHeight: 1.5 }}>
                {event.giftsText}
              </div>
            </div>
          )}
        </section>

        {/* Share Section */}
        <ShareSection
          title={event.title}
          eventName={event.name}
          btnBg={theme.colors.primary}
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
            ✦ ELEGANT THEME ✦
          </div>
          <p style={{ margin: 0 }}>Plataforma de Invitaciones Digitales</p>
        </footer>
      </main>
    </div>
  );
}
