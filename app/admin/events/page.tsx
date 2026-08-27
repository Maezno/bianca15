import React from 'react';
import Link from 'next/link';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { getAdminEvents } from '@/lib/admin/events';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventCard } from '@/components/admin/EventCard';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const user = await getCurrentAdminUser();
  const events = await getAdminEvents();

  return (
    <AdminLayout user={user}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Mis Eventos
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Administrá invitaciones, grupos y confirmaciones de cada evento.
          </p>
        </div>

        <Link
          href="/admin/events/new"
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '0.5rem',
            background: '#9333ea',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(147, 51, 234, 0.25)',
          }}
        >
          <span>+</span> NUEVO EVENTO
        </Link>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>🎈</p>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            No tenés eventos creados
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
            Comenzá creando tu primer evento para gestionar invitados.
          </p>
          <Link
            href="/admin/events/new"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.5rem',
              background: '#9333ea',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            + Crear Primer Evento
          </Link>
        </div>
      )}
    </AdminLayout>
  );
}
