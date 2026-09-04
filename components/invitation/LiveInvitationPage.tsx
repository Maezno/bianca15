'use client';

import React, { useState, useEffect } from 'react';
import type { PublicEvent } from '@/types/event';
import { getTemplate } from '@/templates/registry';

interface LiveInvitationPageProps {
  initialEvent: PublicEvent;
  isPreview?: boolean;
}

export function LiveInvitationPage({ initialEvent, isPreview }: LiveInvitationPageProps) {
  const [event, setEvent] = useState<PublicEvent>(initialEvent);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  useEffect(() => {
    setEvent(initialEvent);
  }, [initialEvent]);

  useEffect(() => {
    if (!isPreview) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'PREVIEW_STATE_UPDATE' && e.data?.payload) {
        setEvent((prev) => ({
          ...prev,
          ...e.data.payload,
          designConfig: e.data.payload.designConfig !== undefined ? e.data.payload.designConfig : prev.designConfig,
          sectionConfig: e.data.payload.sectionConfig !== undefined ? e.data.payload.sectionConfig : prev.sectionConfig,
        }));
      } else if (e.data?.type === 'SCROLL_TO_SECTION') {
        const secId = e.data.sectionId;
        setSelectedSectionId(secId || null);
        if (secId) {
          const el = document.getElementById(`section-${secId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notificar al editor que el iframe está montado y listo
    try {
      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');
      }
    } catch {
      // Ignorar si hay restricciones cross-origin
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [isPreview]);

  const handleUpdateSectionHeight = (sectionId: string, newHeight: number) => {
    const clamped = Math.max(250, Math.min(2500, Math.round(newHeight)));
    setEvent((prev) => ({
      ...prev,
      designConfig: {
        ...(prev.designConfig || {}),
        layout: {
          ...(prev.designConfig?.layout || {}),
          sectionHeights: {
            ...(prev.designConfig?.layout?.sectionHeights || {}),
            [sectionId]: clamped,
          },
        },
      },
    }));

    // Notificar al editor principal para sincronizar formulario y guardado
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: 'UPDATE_SECTION_HEIGHT',
            sectionId,
            height: clamped,
          },
          '*'
        );
      }
    } catch {
      // Ignorar cross-origin
    }
  };

  const template = getTemplate(event.templateId);
  const EventPageComponent = template.EventPage;

  return (
    <>
      {isPreview && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            background: event.status === 'draft' ? '#fef3c7' : '#f0fdf4',
            color: event.status === 'draft' ? '#92400e' : '#166534',
            borderBottom: `1px solid ${event.status === 'draft' ? '#fde68a' : '#bbf7d0'}`,
            padding: '0.4rem 1rem',
            textAlign: 'center',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span>👁 VISTA PREVIA EN VIVO</span>
          {event.status === 'draft' && <span style={{ opacity: 0.8 }}>(Borrador)</span>}
        </div>
      )}
      <EventPageComponent
        event={event}
        isInteractivePreview={isPreview}
        selectedSectionId={selectedSectionId}
        onUpdateSectionHeight={handleUpdateSectionHeight}
      />
    </>
  );
}
