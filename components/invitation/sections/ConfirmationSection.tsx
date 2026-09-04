import React from 'react';
import type { SectionBaseProps } from './types';
import { ConfirmationForm } from '@/components/confirmation/ConfirmationForm';

export function ConfirmationSection({
  event,
  theme,
  guestGroup,
  existingConfirmation,
}: SectionBaseProps) {
  // Modo Personalizado (Invitado con token)
  if (guestGroup) {
    return (
      <section
        id="confirmacion"
        aria-label="Confirmación de asistencia"
        style={{
          background: theme.colors.surface,
          borderRadius: '1.25rem',
          border: `1px solid ${theme.colors.border}`,
          padding: '2rem 1.5rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: theme.colors.primary,
              fontWeight: 700,
            }}
          >
            CONFIRMACIÓN DE ASISTENCIA
          </span>
          <h2
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.5rem',
              color: theme.colors.text,
              margin: '0.35rem 0 0.5rem 0',
              fontWeight: 700,
            }}
          >
            {guestGroup.name}
          </h2>
          <p style={{ fontSize: '0.95rem', color: theme.colors.textMuted, margin: 0 }}>
            {guestGroup.maxGuests === 1
              ? 'Tenés 1 lugar reservado.'
              : `Tienen ${guestGroup.maxGuests} lugares reservados.`}
          </p>
        </div>

        <ConfirmationForm
          token={guestGroup.token}
          maxGuests={guestGroup.maxGuests}
          groupName={guestGroup.name}
          eventTitle={event.title}
          existingConfirmation={existingConfirmation || null}
        />
      </section>
    );
  }

  // Modo Público General (Sin token de invitado)
  return (
    <section
      aria-label="Confirmación de asistencia"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '2rem 1.5rem',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} aria-hidden="true">
        💌
      </div>
      <span
        style={{
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: theme.colors.primary,
          fontWeight: 700,
        }}
      >
        CONFIRMACIÓN DE ASISTENCIA
      </span>
      <h2
        style={{
          fontFamily: theme.typography.headingFont,
          fontSize: '1.35rem',
          color: theme.colors.text,
          margin: '0.25rem 0 0.5rem 0',
          fontWeight: 700,
        }}
      >
        ¿Asistirás al evento?
      </h2>
      <p
        style={{
          fontSize: '0.95rem',
          color: theme.colors.textMuted,
          maxWidth: '420px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}
      >
        Para confirmar tu asistencia de forma personalizada, utilizá el enlace exclusivo enviado por los anfitriones a tu WhatsApp o mensaje personal.
      </p>
    </section>
  );
}
