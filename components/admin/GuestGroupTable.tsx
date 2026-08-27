'use client';

import React, { useState, useMemo } from 'react';
import { deleteAdminGuestGroup } from '@/lib/admin/guests';
import { QrModal } from './QrModal';
import { GuestGroupModal } from './GuestGroupModal';
import { GuestPersonsModal } from './GuestPersonsModal';
import type { AdminGuestGroupItem } from '@/lib/admin/types';

interface GuestGroupTableProps {
  groups: AdminGuestGroupItem[];
  eventId: string;
  onRefresh: () => void;
}

export function GuestGroupTable({ groups, eventId, onRefresh }: GuestGroupTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'max_guests' | 'status' | 'confirmed_count'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [qrGroup, setQrGroup] = useState<AdminGuestGroupItem | null>(null);
  const [editGroup, setEditGroup] = useState<AdminGuestGroupItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [personsGroup, setPersonsGroup] = useState<AdminGuestGroupItem | null>(null);

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const status = g.confirmation?.status || 'pending';
      if (statusFilter !== 'all' && status !== statusFilter) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchPhone = (g.phone || '').toLowerCase().includes(q);
      const matchGuests = g.guests.some((gu) => gu.name.toLowerCase().includes(q));

      return matchName || matchPhone || matchGuests;
    });
  }, [groups, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'max_guests') {
        comparison = a.max_guests - b.max_guests;
      } else if (sortBy === 'status') {
        const sA = a.confirmation?.status || 'pending';
        const sB = b.confirmation?.status || 'pending';
        comparison = sA.localeCompare(sB);
      } else if (sortBy === 'confirmed_count') {
        const cA = a.confirmation?.guests_count || 0;
        const cB = b.confirmation?.guests_count || 0;
        comparison = cA - cB;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filtered, sortBy, sortAsc]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleDelete = async (g: AdminGuestGroupItem) => {
    const msg = `¿Eliminar al grupo "${g.name}"?\n\nEsta acción eliminará al grupo, sus invitados registrados y cualquier confirmación asociada.`;
    if (!confirm(msg)) return;

    const res = await deleteAdminGuestGroup(g.id);
    if (res.success) {
      onRefresh();
    } else {
      alert(res.error || 'No se pudo eliminar el grupo.');
    }
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', marginTop: '1.5rem' }}>
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por grupo, invitado, tel..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              minWidth: '240px',
            }}
          />

          <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.2rem', borderRadius: '0.5rem', gap: '0.2rem' }}>
            {(['all', 'confirmed', 'pending', 'declined'] as const).map((st) => {
              const label = st === 'all' ? 'Todos' : st === 'confirmed' ? 'Confirmados' : st === 'pending' ? 'Pendientes' : 'No asisten';
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#0f172a' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: active ? 700 : 500,
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: '#9333ea',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
          }}
        >
          <span>+</span> Nuevo Grupo
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th
                style={{ padding: '0.65rem 0.75rem', color: '#475569', cursor: 'pointer' }}
                onClick={() => {
                  if (sortBy === 'name') setSortAsc(!sortAsc);
                  else { setSortBy('name'); setSortAsc(true); }
                }}
              >
                Grupo {sortBy === 'name' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                style={{ padding: '0.65rem 0.75rem', color: '#475569', cursor: 'pointer', textAlign: 'center' }}
                onClick={() => {
                  if (sortBy === 'max_guests') setSortAsc(!sortAsc);
                  else { setSortBy('max_guests'); setSortAsc(true); }
                }}
              >
                Cupo {sortBy === 'max_guests' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>Invitados</th>
              <th
                style={{ padding: '0.65rem 0.75rem', color: '#475569', cursor: 'pointer', textAlign: 'center' }}
                onClick={() => {
                  if (sortBy === 'status') setSortAsc(!sortAsc);
                  else { setSortBy('status'); setSortAsc(true); }
                }}
              >
                Estado {sortBy === 'status' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th
                style={{ padding: '0.65rem 0.75rem', color: '#475569', cursor: 'pointer', textAlign: 'center' }}
                onClick={() => {
                  if (sortBy === 'confirmed_count') setSortAsc(!sortAsc);
                  else { setSortBy('confirmed_count'); setSortAsc(true); }
                }}
              >
                Asistentes {sortBy === 'confirmed_count' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th style={{ padding: '0.65rem 0.75rem', color: '#475569', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? (
              paginated.map((g) => {
                const conf = g.confirmation;
                const status = conf?.status || 'pending';

                const statusBadge =
                  status === 'confirmed' ? (
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                      🟢 CONFIRMADO
                    </span>
                  ) : status === 'declined' ? (
                    <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                      🔴 NO ASISTE
                    </span>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                      🟡 PENDIENTE
                    </span>
                  );

                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{g.name}</div>
                      {g.phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {g.phone}</div>}
                      {g.notes && <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>📝 {g.notes}</div>}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#475569' }}>
                      {g.max_guests}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#334155' }}>
                          {g.guests.length > 0
                            ? g.guests.map((gu) => gu.name).join(', ')
                            : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin personas</span>}
                        </span>
                        <button
                          onClick={() => setPersonsGroup(g)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.25rem',
                            padding: '0.15rem 0.4rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            color: '#475569',
                          }}
                          title="Gestionar integrantes"
                        >
                          ✏️ +
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                      {statusBadge}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                      {status === 'confirmed' ? (
                        <span style={{ color: '#16a34a' }}>{conf?.guests_count || 0} personas</span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button
                          onClick={() => setQrGroup(g)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Ver QR y Enlace"
                        >
                          📱 QR
                        </button>
                        <button
                          onClick={() => setEditGroup(g)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            color: '#475569',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Editar grupo"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #fee2e2',
                            background: '#fff5f5',
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Eliminar grupo"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No se encontraron grupos de invitados con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#64748b' }}>
          <span>
            Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} de {sorted.length} grupos
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                background: page <= 1 ? '#f8fafc' : '#ffffff',
                color: page <= 1 ? '#cbd5e1' : '#0f172a',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0',
                background: page >= totalPages ? '#f8fafc' : '#ffffff',
                color: page >= totalPages ? '#cbd5e1' : '#0f172a',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <QrModal
        isOpen={!!qrGroup}
        onClose={() => setQrGroup(null)}
        groupName={qrGroup?.name || ''}
        invitationUrl={qrGroup?.invitationUrl || ''}
      />

      <GuestGroupModal
        isOpen={isCreateOpen || !!editGroup}
        onClose={() => {
          setIsCreateOpen(false);
          setEditGroup(null);
        }}
        onSuccess={onRefresh}
        eventId={eventId}
        groupToEdit={editGroup}
      />

      <GuestPersonsModal
        isOpen={!!personsGroup}
        onClose={() => setPersonsGroup(null)}
        onSuccess={onRefresh}
        group={personsGroup}
      />
    </div>
  );
}
