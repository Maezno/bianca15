import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { getAdminEventById } from '@/lib/admin/events';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

interface PreviewPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventPreviewPage({ params }: PreviewPageProps) {
  const { eventId } = await params;
  const user = await getCurrentAdminUser();
  const { event } = await getAdminEventById(eventId);

  if (!event) {
    notFound();
  }

  const template = getTemplate(event.template_id);
  const slug = event.slug;

  return (
    <AdminLayout user={user} eventId={event.id} eventName={event.name}>
      {/* Preview Header Banner */}
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '0.75rem',
          padding: '0.9rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>👁️</span>
          <div>
            <strong style={{ fontSize: '0.95rem', color: '#78350f' }}>Modo Preview</strong>
            <p style={{ fontSize: '0.82rem', color: '#92400e', margin: '0.1rem 0 0 0' }}>
              Estás viendo la invitación como la verá un invitado.
              {event.status === 'draft' && (
                <> Este evento está en <strong>borrador</strong> y no es públicamente accesible.</>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {/* Template badge */}
          <span
            style={{
              background: '#f3e8ff',
              color: '#7e22ce',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: '99px',
              border: '1px solid #e9d5ff',
            }}
          >
            🎨 {template.name} v{template.version}
          </span>

          {/* Status badge */}
          <span
            style={{
              background:
                event.status === 'published'
                  ? '#dcfce7'
                  : event.status === 'draft'
                  ? '#fef9c3'
                  : '#f1f5f9',
              color:
                event.status === 'published'
                  ? '#166534'
                  : event.status === 'draft'
                  ? '#854d0e'
                  : '#475569',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.3rem 0.75rem',
              borderRadius: '99px',
            }}
          >
            {event.status === 'published'
              ? '🟢 Publicado'
              : event.status === 'draft'
              ? '🟡 Borrador'
              : '⚪ Archivado'}
          </span>

          <Link
            href={`/admin/events/${event.id}`}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '0.5rem',
              border: '1px solid #fbbf24',
              background: '#ffffff',
              color: '#78350f',
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ← Volver al panel
          </Link>
        </div>
      </div>

      {/* Iframe wrapper for the public invitation */}
      <div
        style={{
          borderRadius: '1rem',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        {/* Device selector toolbar */}
        <div
          style={{
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Vista previa:</span>
          <a
            href={`/admin/events/${event.id}/preview`}
            style={{
              fontSize: '0.8rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '0.35rem',
              background: '#e2e8f0',
              color: '#334155',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            📱 Móvil
          </a>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            /e/{slug}
          </span>
        </div>

        {/* The preview iframe — shows the actual public page */}
        <iframe
          src={`/e/${slug}`}
          title={`Preview: ${event.name}`}
          style={{
            width: '100%',
            minHeight: '80vh',
            border: 'none',
            display: 'block',
          }}
        />
      </div>

      {/* Quick links */}
      <div
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.875rem',
        }}
      >
        <Link
          href={`/admin/events/${event.id}/edit`}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #9333ea',
            background: '#faf5ff',
            color: '#7e22ce',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          ⚙️ Editar configuración
        </Link>

        {event.status === 'published' && (
          <Link
            href={`/e/${slug}`}
            target="_blank"
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            🔗 Abrir en nueva pestaña
          </Link>
        )}
      </div>
    </AdminLayout>
  );
}
