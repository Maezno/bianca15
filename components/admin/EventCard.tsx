import React from 'react';
import Link from 'next/link';
import type { AdminEventSummary } from '@/lib/admin/types';

interface EventCardProps {
  event: AdminEventSummary;
}

export function EventCard({ event }: EventCardProps) {
  const statusBadge =
    event.status === 'published' ? (
      <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
        PUBLICADO
      </span>
    ) : event.status === 'archived' ? (
      <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
        ARCHIVADO
      </span>
    ) : (
      <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
        BORRADOR
      </span>
    );

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 700 }}>
              {event.title}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '0.2rem 0' }}>
              {event.name}
            </h2>
          </div>
          {statusBadge}
        </div>

        <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
          {event.date && <span>📅 {event.date}</span>}
          {event.startTime && <span> · ⏰ {event.startTime} hs</span>}
          {event.location && <div>📍 {event.location}</div>}
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            background: '#f8fafc',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            marginBottom: '1.25rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{event.confirmedGroups}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Confirmados</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eab308' }}>{event.pendingGroups}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Pendientes</div>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{event.declinedGroups}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>No asisten</div>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>👥 Personas confirmadas: <strong>{event.confirmedPersons}</strong></span>
          <span>🎟️ Cupos libres: <strong>{event.remainingCapacity}</strong></span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <Link
          href={`/admin/events/${event.id}`}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            background: '#9333ea',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          ADMINISTRAR
        </Link>
        <Link
          href={`/e/${event.slug}`}
          target="_blank"
          style={{
            padding: '0.65rem 0.8rem',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            color: '#475569',
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
          title="Ver invitación pública"
        >
          👁️
        </Link>
      </div>
    </div>
  );
}
