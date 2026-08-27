'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CsvImporter } from '@/components/admin/CsvImporter';
import { getAdminEventById } from '@/lib/admin/events';
import { getAdminGuestGroups } from '@/lib/admin/guests';
import type { EventRow } from '@/types/database';

export default function EventImportPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [existingGroupNames, setExistingGroupNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      getAdminEventById(eventId),
      getAdminGuestGroups(eventId),
    ]).then(([{ event: ev }, groups]) => {
      setEvent(ev);
      setExistingGroupNames(groups.map((g) => g.name));
      setLoading(false);
    });
  }, [eventId]);

  const handleImportComplete = () => {
    setTimeout(() => {
      router.push(`/admin/events/${eventId}/guests`);
    }, 2000);
  };

  return (
    <AdminLayout
      user={{ id: '1', email: 'admin@bianca15.com', name: 'Administrador', role: 'super_admin' }}
      eventId={eventId}
      eventName={event?.name || 'Importar CSV'}
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href={`/admin/events/${eventId}/guests`} style={{ fontSize: '0.85rem', color: '#64748b', textDecoration: 'none' }}>
            ← Volver a Gestión de Invitados
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0.5rem 0 0.25rem 0' }}>
            Importación Masiva de Invitados
          </h1>
        </div>
      </div>

      {loading ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Cargando configuración...
        </div>
      ) : (
        <CsvImporter
          eventId={eventId}
          existingGroupNames={existingGroupNames}
          onImportComplete={handleImportComplete}
        />
      )}
    </AdminLayout>
  );
}
