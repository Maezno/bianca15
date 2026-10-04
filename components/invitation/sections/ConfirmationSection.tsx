'use client';

import React, { useState } from 'react';
import type { SectionBaseProps } from './types';
import { ConfirmationForm } from '@/components/confirmation/ConfirmationForm';
import { RsvpModal } from '@/components/confirmation/RsvpModal';
import { ActionButton } from '@/components/invitation/ActionButton';

export function ConfirmationSection({
  event,
  theme,
  guestGroup,
  existingConfirmation,
}: SectionBaseProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'attend' | 'decline'>('attend');
  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['confirmation'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

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
          textAlign: 'center',
          boxShadow: (theme.colors.surface === 'transparent' || theme.styles?.cardShadow === 'none')
            ? 'none'
            : '0 8px 30px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          data-heading-container="true"
          style={{
            textAlign: 'center',
            marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 24 + titleOffsetY)}px` : '1.5rem',
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
              textAlign: 'center',
            }}
          >
            CONFIRMACIÓN DE ASISTENCIA
          </span>
          <h2
            data-heading="true"
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.5rem',
              color: sectionStyle?.titleColor || theme.colors.text,
              margin: '0.35rem 0 0.5rem 0',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {guestGroup.name}
          </h2>
          <p data-body="true" style={{ fontSize: '0.95rem', color: theme.colors.textMuted, margin: 0, textAlign: 'center' }}>
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
          confirmButtonBackgroundImage={sectionStyle?.confirmButtonBackgroundImage || sectionStyle?.buttonBackgroundImage}
          declineButtonBackgroundImage={sectionStyle?.declineButtonBackgroundImage || sectionStyle?.buttonBackgroundImage}
          hideButtonLabel={sectionStyle?.hideButtonLabel}
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
          boxShadow: (theme.colors.surface === 'transparent' || theme.styles?.cardShadow === 'none')
            ? 'none'
            : '0 12px 36px rgba(0, 0, 0, 0.12)',
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

        <div
          data-heading-container="true"
          style={{
            marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 8 + titleOffsetY)}px` : '0.5rem',
            transition: 'margin-bottom 0.15s ease',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <span
            data-badge="true"
            style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: sectionStyle?.titleColor || theme.colors.primary,
              fontWeight: 700,
              marginBottom: '0.35rem',
              textAlign: 'center',
            }}
          >
            CONFIRMACIÓN DE ASISTENCIA
          </span>

          <h2
            data-heading="true"
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.65rem',
              color: sectionStyle?.titleColor || theme.colors.text,
              margin: '0.25rem 0 0.75rem 0',
              fontWeight: 500,
              lineHeight: 1.25,
              textAlign: 'center',
            }}
          >
            ¿Vas a acompañarme?
          </h2>
        </div>

        <p
          data-body="true"
          style={{
            fontSize: '0.95rem',
            color: theme.colors.textMuted,
            maxWidth: '430px',
            margin: '0 auto 1.75rem auto',
            lineHeight: 1.6,
            textAlign: 'center',
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
          <ActionButton
            label="Sí, asistiré"
            onClick={openAttendModal}
            variant="primary"
            primaryColor={theme.colors.primary}
            textColor="#ffffff"
            fullWidth
            backgroundImage={sectionStyle?.confirmButtonBackgroundImage || sectionStyle?.buttonBackgroundImage}
            hideLabel={Boolean(
              sectionStyle?.hideButtonLabel &&
              (sectionStyle?.confirmButtonBackgroundImage || sectionStyle?.buttonBackgroundImage)
            )}
          />
          <ActionButton
            label="No podré asistir"
            onClick={openDeclineModal}
            variant="outline"
            primaryColor={theme.colors.primary}
            fullWidth
            backgroundImage={sectionStyle?.declineButtonBackgroundImage}
            hideLabel={Boolean(sectionStyle?.hideButtonLabel && sectionStyle?.declineButtonBackgroundImage)}
          />
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
