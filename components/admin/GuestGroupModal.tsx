'use client';

import React, { useState, useEffect } from 'react';
import { createAdminGuestGroup, updateAdminGuestGroup } from '@/lib/admin/guests';
import type { AdminGuestGroupItem } from '@/lib/admin/types';

interface GuestGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventId: string;
  groupToEdit?: AdminGuestGroupItem | null;
}

export function GuestGroupModal({
  isOpen,
  onClose,
  onSuccess,
  eventId,
  groupToEdit,
}: GuestGroupModalProps) {
  const isEditing = !!groupToEdit;

  const [name, setName] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [initialGuests, setInitialGuests] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const confirmedPersons = groupToEdit?.confirmation?.status === 'confirmed'
    ? (groupToEdit.confirmation.guests_count || 0)
    : 0;

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name || '');
      setMaxGuests(groupToEdit.max_guests || 1);
      setPhone(groupToEdit.phone || '');
      setEmail(groupToEdit.email || '');
      setNotes(groupToEdit.notes || '');
      setPersonalMessage(groupToEdit.personal_message || '');
      setInitialGuests('');
    } else {
      setName('');
      setMaxGuests(1);
      setPhone('');
      setEmail('');
      setNotes('');
      setPersonalMessage('');
      setInitialGuests('');
    }
    setError(null);
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del grupo es obligatorio.');
      return;
    }

    if (maxGuests < 1) {
      setError('El cupo debe ser al menos 1.');
      return;
    }

    if (isEditing && confirmedPersons > 0 && maxGuests < confirmedPersons) {
      setError(
        `Actualmente hay ${confirmedPersons} personas confirmadas. No podés reducir el cupo a ${maxGuests} sin modificar primero la confirmación.`
      );
      return;
    }

    setLoading(true);

    try {
      if (isEditing && groupToEdit) {
        const res = await updateAdminGuestGroup({
          id: groupToEdit.id,
          eventId,
          name: name.trim(),
          maxGuests,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          personalMessage: personalMessage.trim() || undefined,
        });

        if (!res.success) {
          setError(res.error || 'Error al actualizar el grupo.');
          setLoading(false);
          return;
        }
      } else {
        const guestNames = initialGuests
          .split('\n')
          .map((n) => n.trim())
          .filter(Boolean);

        const res = await createAdminGuestGroup({
          eventId,
          name: name.trim(),
          maxGuests,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          personalMessage: personalMessage.trim() || undefined,
          initialGuests: guestNames,
        });

        if (!res.success) {
          setError(res.error || 'Error al crear el grupo.');
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch {
      setError('Error inesperado. Por favor intentá nuevamente.');
    } finally {
      setLoading(false);
    }
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
          maxWidth: '500px',
          width: '100%',
          padding: '1.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1.25rem 0' }}>
          {isEditing ? 'Editar Grupo de Invitados' : 'Nuevo Grupo de Invitados'}
        </h3>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Nombre del Grupo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Familia Pérez o Juan García"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Cupo Máximo (lugares reservados) *
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={maxGuests}
              onChange={(e) => setMaxGuests(parseInt(e.target.value, 10) || 1)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
              required
            />
            {confirmedPersons > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem', display: 'block' }}>
                ℹ️ Hay {confirmedPersons} personas confirmadas en este grupo.
              </span>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Teléfono / WhatsApp (opcional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 11 2233-4455"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Email (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: familia@ejemplo.com"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Mensaje personal para este invitado (opcional)
            </label>
            <textarea
              rows={2}
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Ej: ¡Queridos tíos, no pueden faltar en esta noche tan especial!"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {!isEditing && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                Nombres de personas iniciales (uno por línea, opcional)
              </label>
              <textarea
                rows={3}
                value={initialGuests}
                onChange={(e) => setInitialGuests(e.target.value)}
                placeholder={'Juan Pérez\nMaría Pérez\nPedro Pérez'}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
              Notas internas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Mesa principal / Amigos del colegio"
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: '#9333ea',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Grupo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
