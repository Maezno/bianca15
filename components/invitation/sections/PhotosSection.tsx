'use client';

/**
 * components/invitation/sections/PhotosSection.tsx
 * Sección de Álbum de Fotos Compartido (Memoroo) (Hito 9).
 * Soporta configuración dinámica, botón hacia el álbum en pestaña nueva,
 * generación de QR y fallback seguro ante URLs vacías o inválidas.
 */

import React, { useState, useEffect } from 'react';
import type { SectionBaseProps } from './types';
import { ActionButton } from '@/components/invitation/ActionButton';
import { generateQrDataUrl, getQrFallbackUrl } from '@/lib/admin/qr';

export function PhotosSection({ event, theme }: SectionBaseProps) {
  const photosConfig = event.sectionConfig?.photos;
  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['photos'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  const rawAlbumUrl = (sectionStyle?.albumUrl || photosConfig?.albumUrl || event.memorooUrl || '').trim();

  // Validación de URL
  const isValidUrl = Boolean(
    rawAlbumUrl && (rawAlbumUrl.startsWith('http://') || rawAlbumUrl.startsWith('https://'))
  );

  const albumUrl = isValidUrl ? rawAlbumUrl : '';
  const title = sectionStyle?.customTitle || photosConfig?.title || '¡Compartí tus recuerdos!';
  const description =
    sectionStyle?.customSubtitle ||
    photosConfig?.description ||
    'Subí tus fotos y videos durante la fiesta para que todos podamos revivir cada momento.';
  const buttonText = (sectionStyle?.buttonText || photosConfig?.buttonText || 'Compartir fotos').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  const isQrEnabled = sectionStyle?.showQr !== undefined ? sectionStyle.showQr : (photosConfig?.qrEnabled !== false);
  const customQrUrl = (sectionStyle?.qrUrl || event.memorooQrUrl || '').trim();

  const [qrUrl, setQrUrl] = useState<string>(customQrUrl);

  useEffect(() => {
    if (customQrUrl) {
      setQrUrl(customQrUrl);
      return;
    }

    if (albumUrl && isQrEnabled) {
      let isMounted = true;
      setQrUrl(getQrFallbackUrl(albumUrl, 240));

      generateQrDataUrl(albumUrl, { size: 400, margin: 2, errorCorrectionLevel: 'M' })
        .then((dataUrl) => {
          if (isMounted) setQrUrl(dataUrl);
        })
        .catch(() => {
          // Mantener fallback
        });

      return () => {
        isMounted = false;
      };
    }
  }, [albumUrl, isQrEnabled, customQrUrl]);

  if (!albumUrl && !customQrUrl) {
    return null;
  }

  return (
    <section
      aria-label="Álbum de fotos compartido"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.75rem',
        textAlign: 'center',
        boxShadow: (theme.colors.surface === 'transparent' || theme.styles?.cardShadow === 'none')
          ? 'none'
          : '0 4px 15px rgba(0, 0, 0, 0.04)',
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
              display: 'block',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: sectionStyle?.titleColor || theme.colors.primary,
              fontWeight: 700,
              marginBottom: '0.35rem',
              textAlign: 'center',
            }}
          >
            ÁLBUM DE FOTOS
          </span>
          <h2
            data-heading="true"
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.35rem',
              color: sectionStyle?.titleColor || theme.colors.text,
              margin: '0.25rem 0 0.5rem 0',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {title}
          </h2>
        </div>
      )}

      {!sectionStyle?.hideSubtitle && !sectionStyle?.hideText && (
        <p
          data-body="true"
          style={{
            fontSize: '0.9rem',
            color: theme.colors.textMuted,
            maxWidth: '380px',
            margin: '0 auto 1.25rem auto',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          {description}
        </p>
      )}

      {/* QR del Álbum */}
      {isQrEnabled && qrUrl && (
        <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
          <img
            src={qrUrl}
            alt="Código QR para subir fotos al álbum"
            style={{
              width: '160px',
              height: '160px',
              maxWidth: '100%',
              objectFit: 'contain',
              boxSizing: 'border-box',
              margin: '0 auto',
              borderRadius: '0.75rem',
              border: `1px solid ${theme.colors.border}`,
              padding: '0.5rem',
              background: '#ffffff',
              display: 'block',
            }}
          />
          <span data-card-copy="true" style={{ fontSize: '0.78rem', color: theme.colors.textMuted, marginTop: '0.5rem', display: 'block', textAlign: 'center' }}>
            Escaneá con tu celular para subir fotos
          </span>
        </div>
      )}

      {/* Botón de acceso directo al álbum */}
      {albumUrl && (
        <div
          style={{
            display: 'flex',
            justifyContent: sectionStyle?.buttonsAlign === 'left' ? 'flex-start' : sectionStyle?.buttonsAlign === 'right' ? 'flex-end' : 'center',
            transform: (sectionStyle?.buttonsOffsetX || sectionStyle?.buttonsOffsetY)
              ? `translate(${sectionStyle?.buttonsOffsetX ?? 0}px, ${sectionStyle?.buttonsOffsetY ?? 0}px)`
              : undefined,
            transition: 'transform 0.15s ease',
          }}
        >
          <ActionButton
            label={buttonText}
            href={albumUrl}
            variant="primary"
            primaryColor={theme.colors.primary}
            textColor="#ffffff"
            target="_blank"
            rel="noopener noreferrer"
            backgroundImage={sectionStyle?.buttonBackgroundImage}
            backgroundScale={sectionStyle?.buttonBackgroundScale}
            hideLabel={Boolean(sectionStyle?.hideButtonLabel && sectionStyle?.buttonBackgroundImage)}
          />
        </div>
      )}
    </section>
  );
}
