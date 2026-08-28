import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { getAdminEventById } from '@/lib/admin/events';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { EventStats } from '@/components/admin/EventStats';
import { DietarySummary } from '@/components/admin/DietarySummary';
import { getTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

interface EventDetailPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;
  const user = await getCurrentAdminUser();
  const { event, stats } = await getAdminEventById(eventId);

  if (!event) {
    notFound();
  }

  const template = getTemplate(event.template_id);

  return (
    <AdminLayout user={user} eventId={event.id} eventName={event.name}>
      {/* Event Header Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9333ea', fontWeight: 700 }}>
            {event.title}
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0 0.5rem 0' }}>
            {event.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
            {event.date && <span>📅 {event.date} {event.start_time && `· ⏰ ${event.start_time} hs`}</span>}
            {event.location && <span>📍 {event.location}</span>}
            {event.address && <span>🗺️ {event.address}</span>}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <Link
            href={`/admin/events/${event.id}/guests`}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              background: '#9333ea',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            👥 Gestionar Invitados
          </Link>
          <Link
            href={`/admin/events/${event.id}/import`}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            📥 Importar CSV
          </Link>
          <Link
            href={`/e/${event.slug}`}
            target="_blank"
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
            title="Abrir portada pública del evento"
          >
            👁️ Ver Invitación
          </Link>
        </div>
      </div>

      {/* Template Card Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          padding: '1.25rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.75rem',
              background: template.id === 'wonderland' ? '#0a0a0f' : '#f3e8ff',
              border: `2px solid ${template.theme.colors.primary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            {template.id === 'wonderland' ? '♠' : '✨'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{template.name}</strong>
              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: 600 }}>
                v{template.version}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              {template.description}
            </p>
          </div>
        </div>

        <Link
          href={`/admin/events/${event.id}/edit`}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #9333ea',
            background: '#faf5ff',
            color: '#7e22ce',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          🎨 Cambiar Plantilla
        </Link>
      </div>

      {/* KPI Stats */}
      <EventStats stats={stats} />

      {/* Dietary Restrictions Breakdown */}
      <DietarySummary stats={stats} />
    </AdminLayout>
  );
}
