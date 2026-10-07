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
  const textOffsetX = sectionStyle?.contentOffsetX ?? 0;
  const textOffsetY = sectionStyle?.contentOffsetY ?? 0;
  const hasTextOffset = textOffsetX !== 0 || textOffsetY !== 0;

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
          style={{
            width: '100%',
            transform: hasTextOffset ? `translate(${textOffsetX}px, ${textOffsetY}px)` : undefined,
            transition: 'transform 0.15s ease',
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
            {!sectionStyle?.hideTitle && !sectionStyle?.hideText && (
              <>
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
              </>
            )}
            {!sectionStyle?.hideSubtitle && !sectionStyle?.hideText && (
              <p data-body="true" style={{ fontSize: '0.95rem', color: theme.colors.textMuted, margin: 0, textAlign: 'center' }}>
                {guestGroup.maxGuests === 1
                  ? 'Tenés 1 lugar reservado.'
                  : `Tienen ${guestGroup.maxGuests} lugares reservados.`}
              </p>
            )}
          </div>
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
          buttonsLayout={sectionStyle?.buttonsLayout}
          buttonsAlign={sectionStyle?.buttonsAlign}
          buttonsOffsetX={sectionStyle?.buttonsOffsetX}
          buttonsOffsetY={sectionStyle?.buttonsOffsetY}
          buttonsGap={sectionStyle?.buttonsGap}
          buttonBackgroundScale={sectionStyle?.buttonBackgroundScale}
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
        }}
      >
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit', pointerEvents: 'none' }}>
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
        </div>

        <div
          style={{
            width: '100%',
            transform: hasTextOffset ? `translate(${textOffsetX}px, ${textOffsetY}px)` : undefined,
            transition: 'transform 0.15s ease',
          }}
        >
          {!sectionStyle?.hideTitle && !sectionStyle?.hideText && (
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
                {sectionStyle?.customTitle || '¿Vas a acompañarme?'}
              </h2>
            </div>
          )}

          {!sectionStyle?.hideSubtitle && !sectionStyle?.hideText && (
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
              {sectionStyle?.customSubtitle || 'Por favor confirmanos si vas a asistir para que podamos organizar todos los detalles y tener tu lugar listo en esta noche inolvidable.'}
            </p>
          )}
        </div>

        {/* Botones de acción principales */}
        {(() => {
          const hasBgImage = Boolean(
            sectionStyle?.confirmButtonBackgroundImage ||
            sectionStyle?.declineButtonBackgroundImage ||
            sectionStyle?.buttonBackgroundImage
          );
          const bgScale = sectionStyle?.buttonBackgroundScale;
          const rawGap = sectionStyle?.buttonsGap;
          const effectiveGap = rawGap !== undefined ? Math.max(0, rawGap) : 12;
          const negativeMargin = (rawGap !== undefined && rawGap < 0) ? rawGap : 0;

          return (
            <div
              style={{
                display: 'flex',
                flexDirection: sectionStyle?.buttonsLayout === 'row' ? 'row' : 'column',
                gap: `calc(${effectiveGap}px * var(--desktop-btn-scale, 1))`,
                maxWidth: sectionStyle?.buttonsLayout === 'row'
                  ? (hasBgImage ? `calc(${Math.max(260, Math.round(360 * ((bgScale ?? 100) / 100)))}px * var(--desktop-btn-scale, 1))` : `calc(420px * var(--desktop-btn-scale, 1))`)
                  : `calc(360px * var(--desktop-btn-scale, 1))`,
                margin: '0 auto',
                width: '100%',
                justifyContent: sectionStyle?.buttonsAlign === 'left' ? 'flex-start' : sectionStyle?.buttonsAlign === 'right' ? 'flex-end' : 'center',
                alignItems: 'center',
                flexWrap: sectionStyle?.buttonsLayout === 'row' ? 'nowrap' : 'wrap',
                transform: (sectionStyle?.buttonsOffsetX || sectionStyle?.buttonsOffsetY)
                  ? `translate(calc(${sectionStyle?.buttonsOffsetX ?? 0}px * var(--desktop-btn-scale, 1)), calc(${sectionStyle?.buttonsOffsetY ?? 0}px * var(--desktop-btn-scale, 1)))`
                  : undefined,
                transition: 'transform 0.15s ease',
              }}
            >
              <ActionButton
                label="Sí, asistiré"
                onClick={openAttendModal}
                variant="primary"
                primaryColor={theme.colors.primary}
                textColor="#ffffff"
                fullWidth={sectionStyle?.buttonsLayout !== 'row'}
                backgroundImage={sectionStyle?.confirmButtonBackgroundImage || sectionStyle?.buttonBackgroundImage}
                backgroundScale={bgScale}
                hideLabel={Boolean(
                  sectionStyle?.hideButtonLabel &&
                  (sectionStyle?.confirmButtonBackgroundImage || sectionStyle?.buttonBackgroundImage)
                )}
                style={
                  sectionStyle?.buttonsLayout === 'row'
                    ? { flex: '1 1 0', minWidth: 0, width: '100%' }
                    : undefined
                }
              />
              <ActionButton
                label="No podré asistir"
                onClick={openDeclineModal}
                variant="outline"
                primaryColor={theme.colors.primary}
                fullWidth={sectionStyle?.buttonsLayout !== 'row'}
                backgroundImage={sectionStyle?.declineButtonBackgroundImage}
                backgroundScale={bgScale}
                hideLabel={Boolean(sectionStyle?.hideButtonLabel && sectionStyle?.declineButtonBackgroundImage)}
                style={
                  sectionStyle?.buttonsLayout === 'row'
                    ? {
                        flex: '1 1 0',
                        minWidth: 0,
                        width: '100%',
                        marginLeft: negativeMargin ? `${negativeMargin}px` : undefined,
                      }
                    : undefined
                }
              />
            </div>
          );
        })()}
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
