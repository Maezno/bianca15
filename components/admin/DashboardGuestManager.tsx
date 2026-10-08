'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GuestGroupTable } from './GuestGroupTable';
import type { AdminGuestGroupItem } from '@/lib/admin/types';
import { getAdminGuestGroups } from '@/lib/admin/guests';

interface DashboardGuestManagerProps {
  eventId: string;
  eventSlug: string;
  eventName: string;
  whatsappTemplate?: string | null;
  initialGroups: AdminGuestGroupItem[];
}

export function DashboardGuestManager({
  eventId,
  eventSlug,
  eventName,
  whatsappTemplate,
  initialGroups,
}: DashboardGuestManagerProps) {
  const router = useRouter();
  const [groups, setGroups] = useState<AdminGuestGroupItem[]>(initialGroups);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = async () => {
    startTransition(async () => {
      try {
        const fresh = await getAdminGuestGroups(eventId, eventSlug);
        setGroups(fresh);
      } catch {
        // Fallback refresh de página completa
        router.refresh();
      }
    });
  };

  return (
    <div
      id="lista-invitados"
      style={{
        marginTop: '2.5rem',
        paddingTop: '2rem',
        borderTop: '2px dashed #e2e8f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              👥 Lista de Invitados del Evento
            </h2>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                background: '#f1f5f9',
                color: '#475569',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.3rem 0 0 0' }}>
            Gestioná directamente los invitados, sus enlaces personalizados de confirmación y códigos QR.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isPending}
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isPending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            🔄 {isPending ? 'Actualizando...' : 'Refrescar'}
          </button>
          <Link
            href={`/admin/events/${eventId}/guests`}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '0.5rem',
              background: '#7c3aed',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            ↗ Pantalla completa de invitados
          </Link>
        </div>
      </div>

      <GuestGroupTable
        groups={groups}
        eventId={eventId}
        eventName={eventName}
        whatsappTemplate={whatsappTemplate}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
