'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PublicEvent } from '@/types/event';

interface PreviewPanelProps {
  slug: string;
  refreshKey: number;
  liveData?: Partial<PublicEvent>;
  onUpdateSectionHeight?: (sectionId: string, height: number) => void;
}

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  hero: { label: 'Portada (Hero)', icon: '👑' },
  welcome: { label: 'Bienvenida', icon: '✨' },
  countdown: { label: 'Cuenta Regresiva', icon: '⏳' },
  date: { label: 'Fecha y Hora', icon: '📅' },
  location: { label: 'Ubicación', icon: '📍' },
  schedule: { label: 'Cronograma', icon: '⏰' },
  dress_code: { label: 'Dress Code', icon: '👔' },
  gifts: { label: 'Regalos', icon: '🎁' },
  photos: { label: 'Fotos', icon: '📸' },
  confirmation: { label: 'Confirmación', icon: '✅' },
  share: { label: 'Compartir', icon: '🔗' },
  footer: { label: 'Cierre', icon: '💌' },
};

export function PreviewPanel({
  slug,
  refreshKey,
  liveData,
  onUpdateSectionHeight,
}: PreviewPanelProps) {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getWidth = () => {
    switch (device) {
      case 'mobile':
        return '390px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '100%';
    }
  };

  const previewUrl = `/invitacion/${slug}?preview=true`;

  const syncPreview = useCallback(() => {
    if (!liveData || !iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'PREVIEW_STATE_UPDATE',
          payload: liveData,
        },
        '*'
      );
    } catch {
      // Ignorar errores de cross-window
    }
  }, [liveData]);

  // Sincronizar en tiempo real cuando cambia liveData
  useEffect(() => {
    syncPreview();
  }, [syncPreview]);

  // Escuchar cuando el iframe esté listo para recibir el primer estado
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PREVIEW_READY') {
        syncPreview();
        if (selectedSection && iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'SCROLL_TO_SECTION', sectionId: selectedSection },
            '*'
          );
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [syncPreview, selectedSection]);

  const handleSelectSection = (secId: string) => {
    setSelectedSection(secId);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'SCROLL_TO_SECTION',
          sectionId: secId,
        },
        '*'
      );
    }
  };

  const activeSections =
    liveData?.sectionConfig?.order || Object.keys(SECTION_LABELS);
  const layout = liveData?.designConfig?.layout;
  const isFixed = layout?.mode === 'fixed';
  const defaultHeight = layout?.sectionHeight || 700;
  const currentSelectedHeight = selectedSection
    ? layout?.sectionHeights?.[selectedSection] || defaultHeight
    : defaultHeight;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#f1f5f9',
        borderRadius: '1rem',
        border: '1px solid #cbd5e1',
        overflow: 'hidden',
      }}
    >
      {/* Device Toolbar */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, marginRight: '0.25rem' }}>
            Vista:
          </span>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '0.4rem',
              border: '1px solid',
              borderColor: device === 'mobile' ? '#9333ea' : '#e2e8f0',
              background: device === 'mobile' ? '#faf5ff' : '#ffffff',
              color: device === 'mobile' ? '#7e22ce' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📱 Mobile
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '0.4rem',
              border: '1px solid',
              borderColor: device === 'tablet' ? '#9333ea' : '#e2e8f0',
              background: device === 'tablet' ? '#faf5ff' : '#ffffff',
              color: device === 'tablet' ? '#7e22ce' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📲 Tablet
          </button>
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '0.4rem',
              border: '1px solid',
              borderColor: device === 'desktop' ? '#9333ea' : '#e2e8f0',
              background: device === 'desktop' ? '#faf5ff' : '#ffffff',
              color: device === 'desktop' ? '#7e22ce' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🖥 Desktop
          </button>

          {/* Selector de Sección en el previsualizador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
              🎯 Sección:
            </span>
            <select
              value={selectedSection}
              onChange={(e) => handleSelectSection(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '0.4rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0f172a',
                background: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Ver todas --</option>
              {activeSections.map((sec) => (
                <option key={sec} value={sec}>
                  {SECTION_LABELS[sec]?.icon || '📄'} {SECTION_LABELS[sec]?.label || sec}
                </option>
              ))}
            </select>
          </div>

          {/* Modificador rápido de altura para la sección seleccionada */}
          {isFixed && selectedSection && onUpdateSectionHeight && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: '#faf5ff',
                padding: '0.2rem 0.5rem',
                borderRadius: '0.4rem',
                border: '1px solid #e9d5ff',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7e22ce' }}>
                ↕ {currentSelectedHeight}px
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSectionHeight(
                    selectedSection,
                    Math.max(250, currentSelectedHeight - 50)
                  )
                }
                title="Reducir 50px"
                style={{
                  padding: '0.15rem 0.4rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: '#ffffff',
                  border: '1px solid #d8b4fe',
                  borderRadius: '0.25rem',
                  color: '#6b21a8',
                  cursor: 'pointer',
                }}
              >
                -50
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateSectionHeight(
                    selectedSection,
                    Math.min(2500, currentSelectedHeight + 50)
                  )
                }
                title="Aumentar 50px"
                style={{
                  padding: '0.15rem 0.4rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: '#ffffff',
                  border: '1px solid #d8b4fe',
                  borderRadius: '0.25rem',
                  color: '#6b21a8',
                  cursor: 'pointer',
                }}
              >
                +50
              </button>
            </div>
          )}
        </div>

        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '0.8rem',
            color: '#7e22ce',
            textDecoration: 'none',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          ↗ Abrir en pestaña nueva
        </a>
      </div>

      {/* Frame Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: device === 'desktop' ? '0' : '1.25rem',
          overflowY: 'auto',
          minHeight: '650px',
        }}
      >
        <div
          style={{
            width: getWidth(),
            maxWidth: '100%',
            height: device === 'desktop' ? '100%' : '780px',
            background: '#ffffff',
            borderRadius: device === 'desktop' ? 0 : '1rem',
            boxShadow: device === 'desktop' ? 'none' : '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            border: device === 'desktop' ? 'none' : '4px solid #1e293b',
            transition: 'width 0.25s ease',
          }}
        >
          <iframe
            ref={iframeRef}
            key={refreshKey}
            src={previewUrl}
            onLoad={syncPreview}
            title="Vista Previa de la Invitación"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}
