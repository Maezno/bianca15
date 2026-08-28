import React from 'react';
import type { InvitationPageProps } from '../../types';
import { elegantTheme } from '../theme';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ConfirmationForm } from '@/components/confirmation/ConfirmationForm';
import { ShareSection } from '@/components/invitation/ShareSection';

export function ElegantInvitation({
  event,
  guestGroup,
  existingConfirmation,
}: InvitationPageProps) {
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
              marginBottom: '0.5rem',
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
              margin: '1.25rem auto',
            }}
          />

          {/* Personalized Invitation Box */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              background: '#faf9f6',
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div style={{ fontSize: '0.8rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Invitación Especial Para
            </div>
            <h2
              style={{
                fontFamily: theme.typography.headingFont,
                fontSize: '1.8rem',
                color: theme.colors.text,
                margin: '0.4rem 0',
                fontWeight: 500,
              }}
            >
              {guestGroup.name}
            </h2>
            <div style={{ fontSize: '0.9rem', color: theme.colors.textMuted, marginTop: '0.25rem' }}>
              Lugar reservado para:{' '}
              <strong style={{ color: theme.colors.text }}>
                {guestGroup.maxGuests} {guestGroup.maxGuests === 1 ? 'persona' : 'personas'}
              </strong>
            </div>
          </div>
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

        {/* Event Details */}
        <section
          aria-label="Detalles de la celebración"
          style={{
            background: theme.colors.surface,
            borderRadius: '1rem',
            border: `1px solid ${theme.colors.border}`,
            padding: '2rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.4rem',
              fontWeight: 500,
              color: theme.colors.text,
              margin: '0 0 0.5rem 0',
              textAlign: 'center',
              letterSpacing: '0.05em',
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: '0.75rem',
            }}
          >
            Detalles
          </h3>

          {event.date && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', color: theme.colors.primary }}>📅</span>
              <span style={{ fontSize: '0.95rem' }}>
                <strong>Fecha:</strong> {event.date} {event.startTime && `· ${event.startTime} hs`}
              </span>
            </div>
          )}

          {event.location && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', color: theme.colors.primary, lineHeight: 1 }}>📍</span>
              <div>
                <span style={{ fontSize: '0.95rem', display: 'block' }}>
                  <strong>Lugar:</strong> {event.location}
                </span>
                {event.address && (
                  <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted }}>{event.address}</span>
                )}
              </div>
            </div>
          )}

          {event.dressCode && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', color: theme.colors.primary }}>👔</span>
              <span style={{ fontSize: '0.95rem' }}>
                <strong>Dress Code:</strong> {event.dressCode}
              </span>
            </div>
          )}

          {event.giftsText && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', color: theme.colors.primary, lineHeight: 1 }}>🎁</span>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>Mesa de Regalos:</strong>
                <span style={{ fontSize: '0.85rem', color: theme.colors.textMuted, lineHeight: 1.4 }}>
                  {event.giftsText}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Confirmation Module (Shared Functional Component) */}
        <section aria-label="Confirmación de asistencia">
          <ConfirmationForm
            token={guestGroup.token}
            maxGuests={guestGroup.maxGuests}
            groupName={guestGroup.name}
            eventTitle={event.name}
            existingConfirmation={existingConfirmation}
          />
        </section>

        {/* Share Section */}
        <ShareSection
          title={event.title}
          eventName={event.name}
          groupName={guestGroup.name}
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
