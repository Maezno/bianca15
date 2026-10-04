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
  mobileView?: 'editor' | 'preview';
  setMobileView?: (view: 'editor' | 'preview') => void;
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
  mobileView,
  setMobileView,
}: SaveBarProps) {
  return (
    <div
      className="admin-savebar"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      }}
    >
      {/* Fila 1: Volver + Nombre + Badge de Estado + Enlace Ver Pública */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
          <Link
            href={`/admin/events/${eventId}`}
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            ← Volver
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h1 className="admin-savebar-title" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span>✏️</span> {eventName}
            </h1>
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '99px',
              flexShrink: 0,
              background:
                status === 'published' ? '#dcfce7' : status === 'draft' ? '#fef9c3' : '#f1f5f9',
              color:
                status === 'published' ? '#166534' : status === 'draft' ? '#854d0e' : '#475569',
            }}
          >
            {status === 'published' ? '🟢 Publicado' : status === 'draft' ? '🟡 Borrador' : '⚪ Archivado'}
          </span>
        </div>

        {status === 'published' && (
          <a
            href={`/invitacion/${slug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.72rem',
              color: '#16a34a',
              fontWeight: 700,
              textDecoration: 'none',
              background: '#f0fdf4',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.35rem',
              border: '1px solid #bbf7d0',
              flexShrink: 0,
            }}
          >
            🔗 Ver pública
          </a>
        )}
      </div>

      {/* Fila 2: Switcher Móvil (Opciones / Visualizador) + Indicador de cambios + Botones Guardar / Publicar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', width: '100%' }}>
        {/* Switcher Móvil */}
        {setMobileView && (
          <div
            className="admin-mobile-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '2px',
              borderRadius: '0.5rem',
              gap: '2px',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setMobileView('editor')}
              style={{
                padding: '0.28rem 0.55rem',
                borderRadius: '0.35rem',
                border: 'none',
                background: mobileView === 'editor' ? '#ffffff' : 'transparent',
                color: mobileView === 'editor' ? '#9333ea' : '#64748b',
                fontWeight: mobileView === 'editor' ? 700 : 500,
                fontSize: '0.72rem',
                cursor: 'pointer',
                boxShadow: mobileView === 'editor' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>⚙️</span> Opciones
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              style={{
                padding: '0.28rem 0.55rem',
                borderRadius: '0.35rem',
                border: 'none',
                background: mobileView === 'preview' ? '#ffffff' : 'transparent',
                color: mobileView === 'preview' ? '#9333ea' : '#64748b',
                fontWeight: mobileView === 'preview' ? 700 : 500,
                fontSize: '0.72rem',
                cursor: 'pointer',
                boxShadow: mobileView === 'preview' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>👁️</span> Visualizador
            </button>
          </div>
        )}

        {/* Acciones: Estado de guardado y Botones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: 'auto', flexWrap: 'nowrap' }}>
          {isDirty && (
            <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
              <span>●</span> <span className="hide-on-very-small">Sin guardar</span>
            </span>
          )}

          {saveSuccess && (
            <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>
              ✓ Guardado
            </span>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            style={{
              padding: '0.32rem 0.75rem',
              borderRadius: '0.45rem',
              border: 'none',
              background: '#9333ea',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1,
              boxShadow: '0 1px 4px rgba(147, 51, 234, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>

          <button
            type="button"
            onClick={onPublishToggle}
            disabled={isSaving}
            style={{
              padding: '0.32rem 0.65rem',
              borderRadius: '0.45rem',
              border: status === 'published' ? '1px solid #cbd5e1' : 'none',
              background: status === 'published' ? '#ffffff' : '#16a34a',
              color: status === 'published' ? '#64748b' : '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'published' ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
