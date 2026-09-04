'use client';

/**
 * components/admin/editor/tabs/ImagesTab.tsx
 * Pestaña de Multimedia, Portada y Álbum de Fotos en el Editor (Hito 9).
 * Permite seleccionar la imagen de portada con MediaPicker, configurar el álbum Memoroo,
 * validar URLs y generar/descargar el código QR del álbum.
 */

import React, { useState } from 'react';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { QrModal } from '@/components/admin/QrModal';
import type { EventSectionConfig, PhotosSectionConfig } from '@/types/event';

interface ImagesTabProps {
  eventId: string;
  coverImage: string;
  setCoverImage: (v: string) => void;
  memorooUrl: string;
  setMemorooUrl: (v: string) => void;
  memorooQrUrl: string;
  setMemorooQrUrl: (v: string) => void;
  sectionConfig: EventSectionConfig;
  setSectionConfig: React.Dispatch<React.SetStateAction<EventSectionConfig>>;
}

export function ImagesTab({
  eventId,
  coverImage,
  setCoverImage,
  memorooUrl,
  setMemorooUrl,
  memorooQrUrl,
  setMemorooQrUrl,
  sectionConfig,
  setSectionConfig,
}: ImagesTabProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const isPhotosEnabled = sectionConfig.enabled?.photos ?? false;
  const photosConfig: PhotosSectionConfig = sectionConfig.photos || {};

  const togglePhotosEnabled = (enabled: boolean) => {
    setSectionConfig((prev) => ({
      ...prev,
      enabled: {
        ...(prev.enabled || {}),
        photos: enabled,
      },
      photos: {
        ...(prev.photos || {}),
        enabled,
      },
    }));
  };

  const updatePhotosField = (field: keyof PhotosSectionConfig, value: unknown) => {
    setSectionConfig((prev) => ({
      ...prev,
      photos: {
        ...(prev.photos || {}),
        [field]: value,
      },
    }));
  };

  // Validación de URL
  const isValidUrl = (url: string) => {
    if (!url.trim()) return true; // Vacío se maneja aparte
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isAlbumUrlValid = isValidUrl(memorooUrl);
  const showEmptyWarning = isPhotosEnabled && !memorooUrl.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Encabezado */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Multimedia, Portada y Álbum de Fotos
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Personalizá la imagen principal del evento y la integración del álbum colaborativo.
        </p>
      </div>

      {/* ─── 1. SECCIÓN: IMAGEN DE PORTADA (COVER IMAGE) ─── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
              👑 Imagen de Portada Principal
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Se muestra en la cabecera (Hero) y como imagen de vista previa en redes sociales (Open Graph / WhatsApp).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '0.5rem',
              background: '#9333ea',
              color: '#ffffff',
              fontSize: '0.825rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            🖼️ {coverImage ? 'Cambiar imagen' : 'Seleccionar de biblioteca'}
          </button>
        </div>

        {coverImage ? (
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '0.65rem',
              overflow: 'hidden',
              background: '#0f172a',
              position: 'relative',
              maxHeight: '260px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={coverImage}
              alt="Portada del evento"
              style={{
                width: '100%',
                maxHeight: '260px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <button
              type="button"
              onClick={() => setCoverImage('')}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.75)',
                color: '#ffffff',
                border: 'none',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✕ Quitar portada
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsPickerOpen(true)}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '0.65rem',
              padding: '2rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f8fafc',
              transition: 'background 0.2s ease',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>📷</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569' }}>
              Ninguna imagen seleccionada como portada
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Hacé clic aquí para elegir o subir una foto desde la biblioteca
            </div>
          </div>
        )}
      </div>

      {/* ─── 2. SECCIÓN: CONFIGURACIÓN DE ÁLBUM (MEMOROO) ─── */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
              📸 Álbum de Fotos Compartido (Memoroo)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Permite a los invitados compartir fotos en vivo durante la celebración.
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isPhotosEnabled ? '#166534' : '#64748b' }}>
              {isPhotosEnabled ? 'Habilitado' : 'Deshabilitado'}
            </span>
            <input
              type="checkbox"
              checked={isPhotosEnabled}
              onChange={(e) => togglePhotosEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#9333ea', cursor: 'pointer' }}
            />
          </label>
        </div>

        {/* Advertencia de Fallback Seguro */}
        {showEmptyWarning && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '0.5rem',
              color: '#92400e',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              lineHeight: 1.4,
            }}
          >
            ⚠️ <strong>Sección habilitada sin URL configurada:</strong> En la invitación pública la sección se ocultará automáticamente hasta que ingreses un enlace válido para evitar botones rotos.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* URL del Álbum */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              URL del Álbum de Fotos (Memoroo u otro servicio)
            </label>
            <input
              type="url"
              value={memorooUrl}
              onChange={(e) => {
                setMemorooUrl(e.target.value);
                updatePhotosField('albumUrl', e.target.value);
              }}
              placeholder="https://memoroo.app/e/mi-evento"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: !isAlbumUrlValid ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
            {!isAlbumUrlValid && (
              <span style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ La URL debe comenzar con http:// o https://
              </span>
            )}
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
              Enlace directo al que serán redirigidos los invitados al pulsar el botón de fotos.
            </span>
          </div>

          {/* Texto del Botón */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              Texto del Botón de Fotos
            </label>
            <input
              type="text"
              value={photosConfig.buttonText ?? 'Subir mis fotos'}
              onChange={(e) => updatePhotosField('buttonText', e.target.value)}
              placeholder="Subir mis fotos"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* QR del Álbum */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
                📱 Código QR para escanear y subir fotos
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Genera un código QR dinámico apuntando directamente a la URL de tu álbum.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={photosConfig.qrEnabled ?? true}
                  onChange={(e) => updatePhotosField('qrEnabled', e.target.checked)}
                  style={{ accentColor: '#9333ea', cursor: 'pointer' }}
                />
                Mostrar QR en invitación
              </label>

              {memorooUrl.trim() && (
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.4rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  👁️ Ver / Descargar QR
                </button>
              )}
            </div>
          </div>

          {/* URL de Imagen QR personalizada (opcional) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              URL de Imagen QR personalizada (opcional)
            </label>
            <input
              type="url"
              value={memorooQrUrl}
              onChange={(e) => setMemorooQrUrl(e.target.value)}
              placeholder="https://.../mi-qr-personalizado.png"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
              Dejalo vacío para generar automáticamente el código QR dinámico a partir de la URL del álbum.
            </span>
          </div>
        </div>
      </div>

      {/* Modal MediaPicker */}
      <MediaPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => setCoverImage(url)}
        eventId={eventId}
        currentUrl={coverImage}
        title="Seleccionar Portada del Evento"
      />

      {/* Modal QrModal para Álbum */}
      {memorooUrl.trim() && (
        <QrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          title="Código QR del Álbum de Fotos"
          subtitle="Escaneá para subir o ver fotos del evento"
          invitationUrl={memorooUrl}
        />
      )}
    </div>
  );
}
