'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAdmin } from '@/lib/admin/auth';
import type { AdminUser } from '@/lib/admin/types';

interface AdminLayoutProps {
  user: AdminUser | null;
  eventId?: string;
  eventName?: string;
  children: React.ReactNode;
}

export function AdminLayout({ user, eventId, eventName, children }: AdminLayoutProps) {
  const pathname = usePathname();

  const isEventHome = eventId && pathname === `/admin/events/${eventId}`;
  const isGuests = eventId && pathname.includes('/guests');
  const isConfirmations = eventId && pathname.includes('/confirmations');
  const isImport = eventId && pathname.includes('/import');
  const isEdit = eventId && pathname.includes('/edit');
  const isEditor = eventId && pathname.includes('/editor');
  const isPreview = eventId && pathname.includes('/preview');
  const isMedia = eventId && pathname.includes('/media');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            href="/admin/events"
            style={{
              fontWeight: 800,
              fontSize: '1.25rem',
              color: '#9333ea',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>✨</span> Plataforma Eventos
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Panel Administrativo</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <span
                style={{
                  background: user.role === 'super_admin' ? '#f3e8ff' : '#e0f2fe',
                  color: user.role === 'super_admin' ? '#7e22ce' : '#0369a1',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '99px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          )}
          <button
            onClick={() => logoutAdmin()}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Event Sub-Navigation if inside an event */}
      {eventId && (
        <div
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.5rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Link href="/admin/events" style={{ color: '#64748b', textDecoration: 'none' }}>
              Eventos
            </Link>
            <span style={{ color: '#94a3b8' }}>›</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{eventName || 'Evento'}</span>
          </div>

          <nav style={{ display: 'flex', gap: '0.5rem' }}>
            <Link
              href={`/admin/events/${eventId}`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isEventHome ? '#f3e8ff' : 'transparent',
                color: isEventHome ? '#7e22ce' : '#475569',
              }}
            >
              📊 Resumen
            </Link>
            <Link
              href={`/admin/events/${eventId}/guests`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isGuests ? '#f3e8ff' : 'transparent',
                color: isGuests ? '#7e22ce' : '#475569',
              }}
            >
              👥 Invitados
            </Link>
            <Link
              href={`/admin/events/${eventId}/confirmations`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isConfirmations ? '#f3e8ff' : 'transparent',
                color: isConfirmations ? '#7e22ce' : '#475569',
              }}
            >
              ✅ Confirmaciones
            </Link>
            <Link
              href={`/admin/events/${eventId}/import`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isImport ? '#f3e8ff' : 'transparent',
                color: isImport ? '#7e22ce' : '#475569',
              }}
            >
              📥 Importar CSV
            </Link>
            <Link
              href={`/admin/events/${eventId}/media`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isMedia ? '#f3e8ff' : 'transparent',
                color: isMedia ? '#7e22ce' : '#475569',
              }}
            >
              🖼️ Multimedia
            </Link>
            <Link
              href={`/admin/events/${eventId}/editor`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                background: isEditor ? '#f3e8ff' : '#faf5ff',
                color: isEditor ? '#7e22ce' : '#9333ea',
                border: '1px solid #d8b4fe',
              }}
            >
              ✏️ Editor
            </Link>
            <Link
              href={`/admin/events/${eventId}/edit`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isEdit ? '#f3e8ff' : 'transparent',
                color: isEdit ? '#7e22ce' : '#475569',
              }}
            >
              ⚙️ Configuración
            </Link>
            <Link
              href={`/admin/events/${eventId}/preview`}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                background: isPreview ? '#fef9c3' : 'transparent',
                color: isPreview ? '#854d0e' : '#475569',
              }}
            >
              👁️ Preview
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>{children}</main>
    </div>
  );
}
