'use client';

import React, { useState } from 'react';
import type { SectionBaseProps } from './types';
import { ConfirmationForm } from '@/components/confirmation/ConfirmationForm';
import { RsvpModal } from '@/components/confirmation/RsvpModal';

export function ConfirmationSection({
  event,
  theme,
  guestGroup,
  existingConfirmation,
}: SectionBaseProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'attend' | 'decline'>('attend');

  const openAttendModal = () => {
    setModalMode('attend');
    setIsModalOpen(true);
  };

  const openDeclineModal = () => {
    setModalMode('decline');
    setIsModalOpen(true);
  };

  // Modo Personalizado (Invitado con token asignado)
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

  // Modo Público General (Cualquier visitante en la invitación pública)
  return (
    <>
      <section
        id="confirmacion"
        aria-label="Confirmación de asistencia"
        style={{
          background: theme.colors.surface,
          borderRadius: '1.25rem',
          border: `1px solid ${theme.colors.border}`,
          padding: '2.5rem 1.75rem',
          textAlign: 'center',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorador sutil en el fondo de la tarjeta */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.colors.primary}25 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }} aria-hidden="true">
          💌
        </div>

        <span
          style={{
            display: 'inline-block',
            fontSize: '0.8rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: theme.colors.primary,
            fontWeight: 700,
            marginBottom: '0.35rem',
          }}
        >
          CONFIRMACIÓN DE ASISTENCIA
        </span>

        <h2
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: '1.65rem',
            color: theme.colors.text,
            margin: '0.25rem 0 0.75rem 0',
            fontWeight: 800,
            lineHeight: 1.25,
          }}
        >
          ¿Vas a acompañarme?
        </h2>

        <p
          style={{
            fontSize: '0.95rem',
            color: theme.colors.textMuted,
            maxWidth: '430px',
            margin: '0 auto 1.75rem auto',
            lineHeight: 1.6,
          }}
        >
          Por favor confirmanos si vas a asistir para que podamos organizar todos los detalles y tener tu lugar listo en esta noche inolvidable.
        </p>

        {/* Botones de acción principales */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '360px',
            margin: '0 auto',
          }}
        >
          <button
            type="button"
            onClick={openAttendModal}
            style={{
              padding: '0.95rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: `0 6px 20px ${theme.colors.primary}45`,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.filter = 'brightness(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.filter = 'none';
            }}
          >
            <span>✨</span> Sí, asistiré
          </button>

          <button
            type="button"
            onClick={openDeclineModal}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: `1px solid ${theme.colors.border}`,
              backgroundColor: 'transparent',
              color: theme.colors.textMuted,
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${theme.colors.text}10`;
              e.currentTarget.style.color = theme.colors.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.colors.textMuted;
            }}
          >
            No podré asistir
          </button>
        </div>
      </section>

      {/* Modal emergente con fondo desenfocado */}
      <RsvpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={event.id}
        eventSlug={event.slug}
        eventTitle={event.title}
        theme={theme}
        initialMode={modalMode}
      />
    </>
  );
}
