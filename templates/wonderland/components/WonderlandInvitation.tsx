import React from 'react';
import type { InvitationPageProps } from '../../types';
import { wonderlandTheme } from '../theme';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';
import { ConfirmationForm } from '@/components/confirmation/ConfirmationForm';
import { ShareSection } from '@/components/invitation/ShareSection';

export function WonderlandInvitation({
  event,
  guestGroup,
  existingConfirmation,
}: InvitationPageProps) {
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
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: theme.colors.primary,
              fontWeight: 700,
              marginBottom: '0.5rem',
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

          {/* Personalized Greeting Box */}
          <div
            style={{
              marginTop: '1rem',
              padding: '1.25rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.2) 0%, rgba(197, 160, 40, 0.1) 100%)',
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div style={{ fontSize: '0.85rem', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Invitación Especial Para
            </div>
            <h2
              style={{
                fontFamily: theme.typography.headingFont,
                fontSize: '1.6rem',
                color: theme.colors.primary,
                margin: '0.35rem 0',
                fontWeight: 700,
              }}
            >
              {guestGroup.name}
            </h2>
            <div style={{ fontSize: '0.9rem', color: theme.colors.text, marginTop: '0.25rem' }}>
              Lugares reservados:{' '}
              <strong style={{ color: '#ffffff' }}>
                {guestGroup.maxGuests} {guestGroup.maxGuests === 1 ? 'persona' : 'personas'}
              </strong>
            </div>
          </div>
        </header>

        {/* Countdown */}
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

        {/* Event Details */}
        <section
          aria-label="Detalles del evento"
          style={{
            background: theme.colors.surface,
            borderRadius: '1.25rem',
            border: `1px solid ${theme.colors.border}`,
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.3rem',
              color: theme.colors.primary,
              margin: '0 0 0.5rem 0',
              textAlign: 'center',
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: '0.5rem',
            }}
          >
            Detalles del Evento
          </h3>

          {event.date && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>📅</span>
              <span style={{ fontSize: '0.95rem' }}>
                <strong>Fecha:</strong> {event.date} {event.startTime && `· ${event.startTime} hs`}
              </span>
            </div>
          )}

          {event.location && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>📍</span>
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
              <span style={{ fontSize: '1.25rem' }}>👔</span>
              <span style={{ fontSize: '0.95rem' }}>
                <strong>Dress Code:</strong> {event.dressCode}
              </span>
            </div>
          )}

          {event.giftsText && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🎁</span>
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>Regalos:</strong>
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
