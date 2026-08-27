'use client';

import React, { useState } from 'react';
import { addGuestPerson, removeGuestPerson } from '@/lib/admin/guests';
import type { AdminGuestGroupItem } from '@/lib/admin/types';

interface GuestPersonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  group: AdminGuestGroupItem | null;
}

export function GuestPersonsModal({
  isOpen,
  onClose,
  onSuccess,
  group,
}: GuestPersonsModalProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !group) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    setLoading(true);
    setError(null);

    const res = await addGuestPerson(group.id, newPersonName.trim());
    if (res.success) {
      setNewPersonName('');
      onSuccess();
    } else {
      setError(res.error || 'Error al agregar invitado.');
    }
    setLoading(false);
  };

  const handleRemove = async (guestId: string) => {
    if (!confirm('¿Quitar a esta persona del grupo?')) return;

    setLoading(true);
    const res = await removeGuestPerson(guestId);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error || 'Error al quitar invitado.');
    }
    setLoading(false);
  };

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
          maxWidth: '480px',
          width: '100%',
          padding: '1.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Integrantes de: {group.name}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          Cupo total reservado: <strong>{group.max_guests}</strong> personas
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Existing Guests List */}
        <div style={{ marginBottom: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
          {group.guests.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {group.guests.map((guest) => (
                <li
                  key={guest.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.9rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>👤 {guest.name}</span>
                  <button
                    onClick={() => handleRemove(guest.id)}
                    disabled={loading}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
              No hay personas individuales registradas en este grupo todavía.
            </p>
          )}
        </div>

        {/* Add New Person Form */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Nombre y apellido..."
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
            }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: '#9333ea',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            + Agregar
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}
