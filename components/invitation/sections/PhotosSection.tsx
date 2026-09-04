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

  const rawAlbumUrl = (photosConfig?.albumUrl || event.memorooUrl || '').trim();

  // Validación de URL
  const isValidUrl = Boolean(
    rawAlbumUrl && (rawAlbumUrl.startsWith('http://') || rawAlbumUrl.startsWith('https://'))
  );

  const albumUrl = isValidUrl ? rawAlbumUrl : '';
  const title = photosConfig?.title || '¡Compartí tus recuerdos!';
  const description =
    photosConfig?.description ||
    'Subí tus fotos y videos durante la fiesta para que todos podamos revivir cada momento.';
  const buttonText = photosConfig?.buttonText || '📷 Compartir fotos';
  const isQrEnabled = photosConfig?.qrEnabled !== false;

  const [qrUrl, setQrUrl] = useState<string>(event.memorooQrUrl || '');

  useEffect(() => {
    // Si ya viene memorooQrUrl preconfigurado, respetarlo; si no, generar QR dinámico para el albumUrl
    if (event.memorooQrUrl) {
      setQrUrl(event.memorooQrUrl);
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
  }, [albumUrl, isQrEnabled, event.memorooQrUrl]);

  // Fallback seguro: Si no hay URL válida ni QR disponible, no mostrar la sección ni un botón roto
  if (!albumUrl && !event.memorooQrUrl) {
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
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} aria-hidden="true">
        📸
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
        ÁLBUM DE FOTOS
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
        {title}
      </h2>
      <p
        style={{
          fontSize: '0.9rem',
          color: theme.colors.textMuted,
          maxWidth: '380px',
          margin: '0 auto 1.25rem auto',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {/* QR del Álbum */}
      {isQrEnabled && qrUrl && (
        <div style={{ marginBottom: '1.25rem' }}>
          <img
            src={qrUrl}
            alt="Código QR para subir fotos al álbum"
            style={{
              width: '160px',
              height: '160px',
              margin: '0 auto',
              borderRadius: '0.75rem',
              border: `1px solid ${theme.colors.border}`,
              padding: '0.5rem',
              background: '#ffffff',
              display: 'block',
            }}
          />
          <span style={{ fontSize: '0.78rem', color: theme.colors.textMuted, marginTop: '0.5rem', display: 'block' }}>
            Escaneá con tu celular para subir fotos
          </span>
        </div>
      )}

      {/* Botón de acceso directo al álbum */}
      {albumUrl && (
        <ActionButton
          label={buttonText}
          icon="📤"
          href={albumUrl}
          variant="primary"
          primaryColor={theme.colors.primary}
          textColor="#ffffff"
          target="_blank"
          rel="noopener noreferrer"
        />
      )}
    </section>
  );
}
