import React from 'react';
import type { SectionBaseProps } from './types';
import { ActionButton } from '@/components/invitation/ActionButton';

export function HeroSection({ event, theme, guestGroup }: SectionBaseProps) {
  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['hero'];

  // Título Público (ej: "Mis 15 años")
  const publicTitleColor = sectionStyle?.titleColor || theme.colors.primary;
  const publicTitleSize = sectionStyle?.titleFontSize
    ? (typeof sectionStyle.titleFontSize === 'number' ? `${sectionStyle.titleFontSize}px` : sectionStyle.titleFontSize)
    : undefined;

  // Nombre del Evento (ej: "Bianca")
  const nameColor = sectionStyle?.nameColor || sectionStyle?.titleColor || theme.colors.text;
  const nameSize = sectionStyle?.nameFontSize
    ? (typeof sectionStyle.nameFontSize === 'number' ? `${sectionStyle.nameFontSize}px` : sectionStyle.nameFontSize)
    : undefined;

  // Subtítulo
  const subtitleColor = sectionStyle?.textColor || theme.colors.textMuted;
  const subtitleSize = sectionStyle?.bodyFontSize
    ? (typeof sectionStyle.bodyFontSize === 'number' ? `${sectionStyle.bodyFontSize}px` : sectionStyle.bodyFontSize)
    : undefined;

  const textOffsetX = sectionStyle?.contentOffsetX ?? 0;
  const textOffsetY = sectionStyle?.contentOffsetY ?? 0;
  const hasTextOffset = textOffsetX !== 0 || textOffsetY !== 0;

  const buttonText = (sectionStyle?.startButtonText || sectionStyle?.buttonText || 'Empezar').trim();
  const showButton =
    sectionStyle?.showStartButton !== false &&
    Boolean(
      sectionStyle?.showStartButton ||
      sectionStyle?.startButtonText ||
      sectionStyle?.buttonText ||
      sectionStyle?.buttonBackgroundImage
    );

  return (
    <header
      style={{
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: (theme.colors.surface === 'transparent' || theme.styles?.cardShadow === 'none')
          ? 'none'
          : '0 8px 30px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          transform: hasTextOffset ? `translate(${textOffsetX}px, ${textOffsetY}px)` : undefined,
          transition: 'transform 0.15s ease',
        }}
      >
        {guestGroup && (
          <div
            data-card-copy="true"
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
            Invitación para <strong>{guestGroup.name}</strong>
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

        {/* Contenedor de Título Público y Nombre con soporte de desplazamiento vertical (titleOffsetY) */}
        <div
          data-heading-container="true"
          style={{
            marginBottom: sectionStyle?.titleOffsetY !== undefined ? `${Math.max(0, 14 + sectionStyle.titleOffsetY)}px` : '1rem',
            transition: 'margin-bottom 0.15s ease',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {/* Título Público */}
          {!sectionStyle?.hideTitle && !sectionStyle?.hideText && (
            <div
              data-public-title="true"
              style={{
                fontSize: publicTitleSize || '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                color: publicTitleColor,
                fontWeight: 600,
                marginBottom: '0.75rem',
                textAlign: 'center',
              }}
            >
              {event.title}
            </div>
          )}

          {/* Nombre del Evento (Autoajustable al contenedor para que Bianca nunca se corte ni desborde en móvil o iframe) */}
          {!sectionStyle?.hideText && (
            <h1
              data-event-name="true"
              style={{
                fontFamily: theme.typography.headingFont,
                fontSize: nameSize || 'min(15vw, 3.8rem)',
                margin: '0.25rem 0 0.85rem 0',
                color: nameColor,
                fontWeight: 400,
                WebkitTextStroke: '0px',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                wordBreak: 'keep-all',
                overflowWrap: 'normal',
                maxWidth: 'calc(100vw - 50px)',
                boxSizing: 'border-box',
              }}
            >
              {event.name}
            </h1>
          )}
        </div>

        {!sectionStyle?.hideSubtitle && !sectionStyle?.hideText && event.subtitle && (
          <p
            data-body="true"
            style={{
              color: subtitleColor,
              fontSize: subtitleSize || '1.05rem',
              margin: '0 0 1rem 0',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            {event.subtitle}
          </p>
        )}

        <div
          data-card-copy="true"
          style={{
            width: '50px',
            height: '2px',
            background: theme.colors.primary,
            margin: '0.5rem auto 0 auto',
            borderRadius: '99px',
            opacity: 0.7,
          }}
        />
      </div>

      {showButton && (
        <div
          style={{
            marginTop: '1.75rem',
            display: 'flex',
            justifyContent: sectionStyle?.buttonsAlign === 'left' ? 'flex-start' : sectionStyle?.buttonsAlign === 'right' ? 'flex-end' : 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 5,
            transform: (sectionStyle?.buttonsOffsetX || sectionStyle?.buttonsOffsetY)
              ? `translate(calc(${sectionStyle?.buttonsOffsetX ?? 0}px * var(--desktop-btn-scale, 1)), calc(${sectionStyle?.buttonsOffsetY ?? 0}px * var(--desktop-btn-scale, 1)))`
              : undefined,
            transition: 'transform 0.15s ease',
          }}
        >
          <ActionButton
            label={buttonText}
            onClick={() => {
              // 1. Iniciar la reproducción de música inmediatamente en el evento de clic
              try {
                if (typeof window !== 'undefined') {
                  if (window.__playInvitationMusic) {
                    window.__playInvitationMusic();
                  } else if (window.__invitationAudio) {
                    window.__invitationAudio.play().catch(() => {});
                  } else {
                    const audio = new Audio('/audio/alices-theme.mp3');
                    audio.loop = true;
                    audio.volume = 0.70;
                    window.__invitationAudio = audio;
                    audio.play().catch(() => {});
                  }
                  window.dispatchEvent(new CustomEvent('play-invitation-music'));
                }
              } catch (e) {
                console.warn('Error al activar música:', e);
              }

              // 2. Scroll suave a la siguiente sección
              const heroSection = document.getElementById('section-hero');
              if (heroSection && heroSection.nextElementSibling) {
                heroSection.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
              }
            }}
            variant="primary"
            primaryColor={theme.colors.primary}
            textColor="#ffffff"
            customBg={sectionStyle?.buttonBg}
            customColor={sectionStyle?.buttonTextColor}
            backgroundImage={sectionStyle?.buttonBackgroundImage}
            backgroundScale={sectionStyle?.buttonBackgroundScale}
            hideLabel={Boolean(sectionStyle?.hideButtonLabel && sectionStyle?.buttonBackgroundImage)}
          />
        </div>
      )}
    </header>
  );
}
