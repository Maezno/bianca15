'use client';

/**
 * components/admin/GeneralQrButton.tsx
 * Botón interactivo para generar, ver y descargar el QR de la invitación general.
 */

import React, { useState } from 'react';
import { QrModal } from './QrModal';

interface GeneralQrButtonProps {
  eventName: string;
  slug: string;
}

export function GeneralQrButton({ eventName, slug }: GeneralQrButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const invitationUrl = `/invitacion/${slug}`;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '0.6rem 0.9rem',
          borderRadius: '0.5rem',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          color: '#334155',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
        title="Generar y descargar código QR para la invitación general"
      >
        📱 QR de Invitación
      </button>

      <QrModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Código QR — Invitación General"
        subtitle={eventName}
        invitationUrl={invitationUrl}
      />
    </>
  );
}
