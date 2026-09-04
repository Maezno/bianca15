'use client';

import React from 'react';
import Link from 'next/link';

interface SaveBarProps {
  eventId: string;
  eventName: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  isDirty: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  onSave: () => Promise<void>;
  onPublishToggle: () => Promise<void>;
}

export function SaveBar({
  eventId,
  eventName,
  slug,
  status,
  isDirty,
  isSaving,
  saveSuccess,
  onSave,
  onPublishToggle,
}: SaveBarProps) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          href={`/admin/events/${eventId}`}
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 600,
          }}
        >
          ← Volver
        </Link>
        <span style={{ color: '#cbd5e1' }}>|</span>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>✏️</span> {eventName}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '99px',
                background:
                  status === 'published' ? '#dcfce7' : status === 'draft' ? '#fef9c3' : '#f1f5f9',
                color:
                  status === 'published' ? '#166534' : status === 'draft' ? '#854d0e' : '#475569',
              }}
            >
              {status === 'published' ? '🟢 Publicado' : status === 'draft' ? '🟡 Borrador' : '⚪ Archivado'}
            </span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/invitacion/{slug}</span>
            {status === 'published' && (
              <a
                href={`/invitacion/${slug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '0.75rem',
                  color: '#16a34a',
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: '#f0fdf4',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #bbf7d0',
                }}
              >
                🔗 Ver pública
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {isDirty && (
          <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>●</span> Cambios sin guardar
          </span>
        )}

        {saveSuccess && (
          <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700 }}>
            ✓ Guardado
          </span>
        )}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          style={{
            padding: '0.55rem 1.25rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: '#9333ea',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.25)',
          }}
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>

        <button
          type="button"
          onClick={onPublishToggle}
          disabled={isSaving}
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '0.5rem',
            border: status === 'published' ? '1px solid #cbd5e1' : 'none',
            background: status === 'published' ? '#ffffff' : '#16a34a',
            color: status === 'published' ? '#64748b' : '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'published' ? 'Despublicar' : 'Publicar Evento'}
        </button>
      </div>
    </div>
  );
}
