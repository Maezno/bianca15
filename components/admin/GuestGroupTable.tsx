'use client';

import React, { useState, useMemo } from 'react';
import { deleteAdminGuestGroup, duplicateAdminGuestGroup } from '@/lib/admin/guests';
import { exportGuestsToCsv } from '@/lib/utils/csv';
import { QrModal } from './QrModal';
import { GuestGroupModal } from './GuestGroupModal';
import { GuestPersonsModal } from './GuestPersonsModal';
import { GuestDetailModal } from './GuestDetailModal';
import type { AdminGuestGroupItem } from '@/lib/admin/types';
import { formatWhatsAppMessage, buildWhatsAppLink } from '@/lib/utils/whatsapp';

interface GuestGroupTableProps {
  groups: AdminGuestGroupItem[];
  eventId: string;
  eventName?: string;
  whatsappTemplate?: string | null;
  onRefresh: () => void;
}

export function GuestGroupTable({
  groups,
  eventId,
  eventName = 'Evento',
  whatsappTemplate,
  onRefresh,
}: GuestGroupTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'declined'>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'max_guests' | 'status' | 'confirmed_count'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [page, setPage] = useState(1);
  const pageSize = 15;

  const [qrGroup, setQrGroup] = useState<AdminGuestGroupItem | null>(null);
  const [editGroup, setEditGroup] = useState<AdminGuestGroupItem | null>(null);
  const [detailGroup, setDetailGroup] = useState<AdminGuestGroupItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [personsGroup, setPersonsGroup] = useState<AdminGuestGroupItem | null>(null);

  // Estadísticas globales en tiempo real (Puntos 31 y 32 del Hito 8)
  const stats = useMemo(() => {
    let totalAssignedSeats = 0;
    let confirmedSeats = 0;
    let confirmedGroupsCount = 0;
    let pendingGroupsCount = 0;
    let declinedGroupsCount = 0;

    groups.forEach((g) => {
      totalAssignedSeats += g.max_guests || 0;
      const st = g.confirmation?.status || 'pending';
      if (st === 'confirmed') {
        confirmedGroupsCount++;
        confirmedSeats += g.confirmation?.guests_count || 0;
      } else if (st === 'declined') {
        declinedGroupsCount++;
      } else {
        pendingGroupsCount++;
      }
    });

    return {
      totalGroups: groups.length,
      totalAssignedSeats,
      confirmedSeats,
      confirmedGroupsCount,
      pendingGroupsCount,
      declinedGroupsCount,
      percentageConfirmed: totalAssignedSeats > 0 ? Math.round((confirmedSeats / totalAssignedSeats) * 100) : 0,
    };
  }, [groups]);

  // Lista única de grupos para el selector de filtro
  const distinctGroupNames = useMemo(() => {
    const names = Array.from(new Set(groups.map((g) => g.name))).sort();
    return names;
  }, [groups]);

  // Filtrado
  const filtered = useMemo(() => {
    return groups.filter((g) => {
      const status = g.confirmation?.status || 'pending';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (groupFilter !== 'all' && g.name !== groupFilter) return false;

      if (!search.trim()) return true;

      const q = search.toLowerCase();
      const matchName = g.name.toLowerCase().includes(q);
      const matchPhone = (g.phone || '').toLowerCase().includes(q);
      const matchEmail = (g.email || '').toLowerCase().includes(q);
      const matchNotes = (g.notes || '').toLowerCase().includes(q);
      const matchGuests = g.guests.some((gu) => gu.name.toLowerCase().includes(q));

      return matchName || matchPhone || matchEmail || matchNotes || matchGuests;
    });
  }, [groups, search, statusFilter, groupFilter]);

  // Ordenamiento
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

  // Acciones
  const handleDelete = async (g: AdminGuestGroupItem) => {
    const msg = `¿Eliminar la invitación de "${g.name}"?\n\nEsta acción eliminará su URL personalizada y cualquier confirmación asociada.`;
    if (!confirm(msg)) return;

    const res = await deleteAdminGuestGroup(g.id);
    if (res.success) {
      onRefresh();
    } else {
      alert(res.error || 'No se pudo eliminar el grupo.');
    }
  };

  const handleDuplicate = async (g: AdminGuestGroupItem) => {
    const res = await duplicateAdminGuestGroup(g.id);
    if (res.success) {
      onRefresh();
    } else {
      alert(res.error || 'No se pudo duplicar el grupo.');
    }
  };

  const handleExportCsv = () => {
    const csvContent = exportGuestsToCsv(sorted);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invitados-${eventId.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Panel Superior de Estadísticas (Punto 31 del Hito 8) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
            TOTAL INVITACIONES
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
            {stats.totalGroups}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {stats.totalAssignedSeats} cupos asignados
          </span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
            🟢 CONFIRMADOS
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a', margin: '0.2rem 0' }}>
            {stats.confirmedSeats}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#166534' }}>
            {stats.confirmedGroupsCount} grupos ({stats.percentageConfirmed}%)
          </span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
            🟡 PENDIENTES
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', margin: '0.2rem 0' }}>
            {stats.pendingGroupsCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#b45309' }}>
            grupos sin responder
          </span>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
            🔴 NO ASISTEN
          </span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#dc2626', margin: '0.2rem 0' }}>
            {stats.declinedGroupsCount}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#991b1b' }}>
            grupos declinados
          </span>
        </div>
      </div>

      {/* Controles de Búsqueda, Filtros y Acciones Globales */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
            {/* Buscador */}
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, tel, email, notas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                minWidth: '260px',
                flex: 1,
                maxWidth: '400px',
              }}
            />

            {/* Filtro por Estado */}
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

            {/* Filtro por Grupo */}
            {distinctGroupNames.length > 1 && (
              <select
                value={groupFilter}
                onChange={(e) => {
                  setGroupFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  background: '#ffffff',
                  color: '#334155',
                }}
              >
                <option value="all">Todos los grupos ({distinctGroupNames.length})</option>
                {distinctGroupNames.map((gn) => (
                  <option key={gn} value={gn}>
                    {gn}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Acciones Globales: Exportar CSV + Nuevo Grupo */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              📥 Exportar CSV
            </button>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              style={{
                padding: '0.55rem 1.15rem',
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
                boxShadow: '0 2px 8px rgba(147, 51, 234, 0.25)',
              }}
            >
              <span>+</span> Nuevo Invitado
            </button>
          </div>
        </div>

        {/* Tabla de Invitados */}
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
                  Invitado / Grupo {sortBy === 'name' ? (sortAsc ? '▲' : '▼') : ''}
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
                <th style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>Personas</th>
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
                  Confirmados {sortBy === 'confirmed_count' ? (sortAsc ? '▲' : '▼') : ''}
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

                  const fullUrl =
                    typeof window !== 'undefined'
                      ? `${window.location.origin}${g.invitationUrl}`
                      : g.invitationUrl;

                  const waMessage = formatWhatsAppMessage(whatsappTemplate, {
                    guestName: g.guests[0]?.name || g.name,
                    groupName: g.name,
                    allowedGuests: g.max_guests,
                    invitationUrl: fullUrl,
                    eventName,
                  });
                  const waLink = buildWhatsAppLink(g.phone, waMessage);

                  return (
                    <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div
                          onClick={() => setDetailGroup(g)}
                          style={{ fontWeight: 700, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          title="Ver detalle completo"
                        >
                          <span>{g.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>↗</span>
                        </div>
                        {g.phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {g.phone}</div>}
                        {g.email && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>✉️ {g.email}</div>}
                      </td>

                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 700, color: '#475569' }}>
                        {g.max_guests}
                      </td>

                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#334155' }}>
                            {g.guests.length > 0
                              ? g.guests.map((gu) => gu.name).join(', ')
                              : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin integrantes</span>}
                          </span>
                          <button
                            type="button"
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
                          <span style={{ color: '#166534' }}>{conf?.guests_count || 0} personas</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      {/* Acciones Rápidas (Puntos 14, 15, 20, 34, 42 del Hito 8) */}
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setDetailGroup(g)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#334155',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                            title="Ficha detallada del invitado"
                          >
                            👁 Ficha
                          </button>

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #bbf7d0',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              fontSize: '0.8rem',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title="Abrir WhatsApp"
                          >
                            💬
                          </a>

                          <button
                            type="button"
                            onClick={() => setQrGroup(g)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#0f172a',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                            title="Ver Código QR"
                          >
                            📱
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(g)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#475569',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                            title="Duplicar invitado (nuevo token)"
                          >
                            📋
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditGroup(g)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#475569',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                            title="Editar"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(g)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #fee2e2',
                              background: '#fff5f5',
                              color: '#ef4444',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                            title="Eliminar"
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
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    No se encontraron invitados con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#64748b' }}>
            <span>
              Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} de {sorted.length} invitados
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
      </div>

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

      <GuestDetailModal
        isOpen={!!detailGroup}
        onClose={() => setDetailGroup(null)}
        group={detailGroup}
        whatsappTemplate={whatsappTemplate}
        eventName={eventName}
        onEdit={(g) => setEditGroup(g)}
        onDuplicate={(g) => handleDuplicate(g)}
        onShowQr={(g) => setQrGroup(g)}
        onDelete={(g) => handleDelete(g)}
      />
    </div>
  );
}
