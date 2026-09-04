'use client';

import React, { useState } from 'react';
import type { AdminGuestGroupItem } from '@/lib/admin/types';
import { formatWhatsAppMessage, buildWhatsAppLink } from '@/lib/utils/whatsapp';

interface GuestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: AdminGuestGroupItem | null;
  whatsappTemplate?: string | null;
  eventName?: string;
  onEdit: (group: AdminGuestGroupItem) => void;
  onDuplicate: (group: AdminGuestGroupItem) => void;
  onShowQr: (group: AdminGuestGroupItem) => void;
  onDelete: (group: AdminGuestGroupItem) => void;
}

export function GuestDetailModal({
  isOpen,
  onClose,
  group,
  whatsappTemplate,
  eventName = 'Evento',
  onEdit,
  onDuplicate,
  onShowQr,
  onDelete,
}: GuestDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !group) return null;

  const fullInvitationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${group.invitationUrl}`
      : group.invitationUrl;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullInvitationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const status = group.confirmation?.status || 'pending';
  const statusColor =
    status === 'confirmed' ? '#166534' : status === 'declined' ? '#991b1b' : '#854d0e';
  const statusBg =
    status === 'confirmed' ? '#dcfce7' : status === 'declined' ? '#fee2e2' : '#fef9c3';
  const statusText =
    status === 'confirmed' ? '🟢 CONFIRMADO' : status === 'declined' ? '🔴 NO ASISTE' : '🟡 PENDIENTE';

  const waMessage = formatWhatsAppMessage(whatsappTemplate, {
    guestName: group.guests[0]?.name || group.name,
    groupName: group.name,
    allowedGuests: group.max_guests,
    invitationUrl: fullInvitationUrl,
    eventName,
  });

  const waLink = buildWhatsAppLink(group.phone, waMessage);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {group.name}
              </h2>
              <span
                style={{
                  background: statusBg,
                  color: statusColor,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '99px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}
              >
                {statusText}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Cupo asignado: <strong>{group.max_guests} {group.max_guests === 1 ? 'persona' : 'personas'}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#94a3b8',
            }}
          >
            ✕
          </button>
        </div>

        {/* Datos de Contacto */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>TELÉFONO</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{group.phone || 'No registrado'}</span>
          </div>
          <div>
            <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>EMAIL</span>
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{group.email || 'No registrado'}</span>
          </div>
        </div>

        {/* Mensaje Personalizado & Notas */}
        {(group.personal_message || group.notes) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {group.personal_message && (
              <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                <strong style={{ color: '#86198f', display: 'block', marginBottom: '0.2rem' }}>💌 Mensaje Personalizado:</strong>
                <span style={{ color: '#701a75', fontStyle: 'italic' }}>&ldquo;{group.personal_message}&rdquo;</span>
              </div>
            )}
            {group.notes && (
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.2rem' }}>📝 Notas Internas:</strong>
                <span style={{ color: '#713f12' }}>{group.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Detalle de Confirmación (RSVP) */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Estado de Confirmación (RSVP)
          </h3>

          {group.confirmation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Asistentes confirmados: </span>
                <strong style={{ color: status === 'confirmed' ? '#166534' : '#0f172a' }}>
                  {group.confirmation.guests_count || 0} de {group.max_guests} personas
                </strong>
              </div>

              {group.confirmation.confirmed_at && (
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  Respondido el {new Date(group.confirmation.confirmed_at).toLocaleString('es-AR')}
                </div>
              )}

              {group.confirmation.comment && (
                <div style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, display: 'block' }}>COMENTARIO DEL INVITADO:</span>
                  <span style={{ color: '#334155' }}>{group.confirmation.comment}</span>
                </div>
              )}

              {/* Lista de Acompañantes y Restricciones */}
              {group.attendees && group.attendees.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                    Acompañantes Registrados:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {group.attendees.map((att) => (
                      <div
                        key={att.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.4rem 0.65rem',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.375rem',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{att.name}</span>
                        {att.dietary_restriction && att.dietary_restriction !== 'none' ? (
                          <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.45rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                            🥗 {att.dietary_restriction}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin restricción</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>
              El invitado aún no ha respondido a la invitación.
            </p>
          )}
        </div>

        {/* Enlace Personalizado */}
        <div style={{ background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
            ENLACE PERSONALIZADO
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#334155', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {fullInvitationUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid #cbd5e1',
                background: copied ? '#dcfce7' : '#ffffff',
                color: copied ? '#166534' : '#0f172a',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Botones de Acción (Punto 42) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.55rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: '#25d366',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            💬 WhatsApp
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onShowQr(group);
            }}
            style={{
              padding: '0.55rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📱 Ver QR
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(group);
            }}
            style={{
              padding: '0.55rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ✏️ Editar
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onDuplicate(group);
            }}
            style={{
              padding: '0.55rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📋 Duplicar
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(group);
            }}
            style={{
              padding: '0.55rem',
              borderRadius: '0.5rem',
              border: '1px solid #fecaca',
              background: '#fff1f2',
              color: '#e11d48',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
