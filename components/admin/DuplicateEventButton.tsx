'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { duplicateEvent } from '@/lib/admin/events';

interface DuplicateEventButtonProps {
  eventId: string;
}

export function DuplicateEventButton({ eventId }: DuplicateEventButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    const confirm = window.confirm(
      '¿Deseás duplicar este evento? Se creará una copia con su diseño, configuración y secciones en estado borrador, sin invitados ni confirmaciones.'
    );
    if (!confirm) return;

    setLoading(true);
    const res = await duplicateEvent(eventId);

    if (res.success && res.eventId) {
      alert('¡Evento duplicado con éxito!');
      router.push(`/admin/events/${res.eventId}`);
    } else {
      alert(res.error || 'Error al duplicar el evento.');
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={loading}
      title="Crear una copia limpia de este evento (sin invitados)"
      style={{
        padding: '0.6rem 0.9rem',
        borderRadius: '0.5rem',
        border: '1px solid #cbd5e1',
        background: '#ffffff',
        color: '#475569',
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      📋 {loading ? 'Duplicando...' : 'Duplicar Evento'}
    </button>
  );
}
