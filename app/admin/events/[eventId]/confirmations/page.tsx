'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getAdminEventById } from '@/lib/admin/events';
import { getAdminConfirmations, exportEventCsv } from '@/lib/admin/confirmations';
import type { AdminConfirmationRow } from '@/lib/admin/confirmations';
import type { EventRow } from '@/types/database';

export default function EventConfirmationsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [confirmations, setConfirmations] = useState<AdminConfirmationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    Promise.all([
      getAdminEventById(eventId),
      getAdminConfirmations(eventId),
    ]).then(([{ event: ev }, confs]) => {
      setEvent(ev);
      setConfirmations(confs);
      setLoading(false);
    });
  }, [eventId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const csv = await exportEventCsv(eventId);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `confirmaciones_${event?.slug || 'evento'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('Error al exportar el archivo CSV.');
    } finally {
      setExporting(false);
    }
  };

  const filtered = confirmations.filter((c) => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <AdminLayout
      user={{ id: '1', email: 'admin@bianca15.com', name: 'Administrador', role: 'super_admin' }}
      eventId={eventId}
      eventName={event?.name || 'Confirmaciones'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Respuestas y Confirmaciones
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Listado detallado de asistentes, restricciones dietarias y mensajes recibidos.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || loading}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '0.5rem',
            background: '#16a34a',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: exporting ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
          }}
        >
          <span>📊</span> {exporting ? 'Generando...' : 'EXPORTAR CSV'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {(['all', 'confirmed', 'pending', 'declined'] as const).map((st) => {
          const label = st === 'all' ? 'Todas las Respuestas' : st === 'confirmed' ? 'Confirmados' : st === 'pending' ? 'Pendientes' : 'No Asisten';
          const active = filter === st;
          return (
            <button
              key={st}
              onClick={() => setFilter(st)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: active ? '1px solid #9333ea' : '1px solid #e2e8f0',
                background: active ? '#f3e8ff' : '#ffffff',
                color: active ? '#7e22ce' : '#475569',
                fontSize: '0.85rem',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {label} ({confirmations.filter((c) => st === 'all' || c.status === st).length})
            </button>
          );
        })}
      </div>

      {/* Confirmations Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>Grupo</th>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569', textAlign: 'center' }}>Cupo</th>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569', textAlign: 'center' }}>Estado</th>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>Asistentes & Restricciones</th>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>Mensaje</th>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569', textAlign: 'right' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c) => {
                const statusBadge =
                  c.status === 'confirmed' ? (
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                      ✓ CONFIRMADO ({c.confirmedCount})
                    </span>
                  ) : c.status === 'declined' ? (
                    <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                      NO ASISTE
                    </span>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                      PENDIENTE
                    </span>
                  );

                return (
                  <tr key={c.groupId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.groupName}</div>
                      {c.phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {c.phone}</div>}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#475569' }}>
                      {c.maxGuests}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                      {statusBadge}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      {c.attendees.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {c.attendees.map((att, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>{att.name}</span>
                              {att.dietary && att.dietary.toLowerCase() !== 'ninguna' && att.dietary.toLowerCase() !== 'none' && (
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {att.dietary}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', color: '#475569', fontSize: '0.85rem', maxWidth: '240px' }}>
                      {c.comment ? <em>"{c.comment}"</em> : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
                      {c.confirmedAt ? new Date(c.confirmedAt).toLocaleDateString('es-AR') : '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No hay confirmaciones registradas con este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
