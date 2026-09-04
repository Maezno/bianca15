'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GuestGroupTable } from '@/components/admin/GuestGroupTable';
import { getAdminEventById } from '@/lib/admin/events';
import { getAdminGuestGroups } from '@/lib/admin/guests';
import type { AdminGuestGroupItem } from '@/lib/admin/types';
import type { EventRow } from '@/types/database';

export default function EventGuestsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [groups, setGroups] = useState<AdminGuestGroupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const { event: ev } = await getAdminEventById(eventId);
      if (ev) {
        setEvent(ev);
        const groupList = await getAdminGuestGroups(eventId, ev.slug);
        setGroups(groupList);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AdminLayout
      user={{ id: '1', email: 'admin@bianca15.com', name: 'Administrador', role: 'super_admin' }}
      eventId={eventId}
      eventName={event?.name || 'Invitados'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Gestión de Invitados
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Administrá grupos, cupos reservados, invitaciones personalizadas y códigos QR.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Cargando invitados...
        </div>
      ) : (
        <GuestGroupTable
          groups={groups}
          eventId={eventId}
          eventName={event?.name ?? undefined}
          whatsappTemplate={event?.whatsapp_template ?? undefined}
          onRefresh={loadData}
        />
      )}
    </AdminLayout>
  );
}
