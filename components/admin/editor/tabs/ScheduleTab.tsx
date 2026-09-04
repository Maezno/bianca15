'use client';

import React, { useState } from 'react';
import type { ScheduleItem } from '@/types/event';

interface ScheduleTabProps {
  schedule: ScheduleItem[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
}

export function ScheduleTab({ schedule, setSchedule }: ScheduleTabProps) {
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime.trim() || !newTitle.trim()) return;

    const newItem: ScheduleItem = {
      id: Math.random().toString(36).substring(2, 9),
      time: newTime.trim(),
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
    };

    setSchedule((prev) => [...prev, newItem]);
    setNewTime('');
    setNewTitle('');
    setNewDesc('');
  };

  const handleRemove = (id: string) => {
    setSchedule((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdate = (id: string, field: keyof ScheduleItem, val: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...schedule];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setSchedule(next);
  };

  const moveDown = (index: number) => {
    if (index === schedule.length - 1) return;
    const next = [...schedule];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setSchedule(next);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Itinerario / Cronograma del Evento
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Definí los momentos clave de la noche (recepción, entrada, cena, brindis, fiesta).
        </p>
      </div>

      {/* Lista de actividades existentes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {schedule.length === 0 ? (
          <div style={{ padding: '1.5rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            No hay actividades configuradas en el cronograma. Agregá la primera abajo.
          </div>
        ) : (
          schedule.map((item, index) => (
            <div
              key={item.id || index}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.75rem', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === schedule.length - 1}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.25rem', padding: '0.25rem 0.4rem', fontSize: '0.75rem', cursor: index === schedule.length - 1 ? 'not-allowed' : 'pointer', opacity: index === schedule.length - 1 ? 0.3 : 1 }}
                >
                  ▼
                </button>
              </div>

              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.75rem' }}>
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => handleUpdate(item.id, 'time', e.target.value)}
                  placeholder="ej: 21:00"
                  style={{ padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 700, textAlign: 'center' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdate(item.id, 'title', e.target.value)}
                    placeholder="Título (ej: Recepción de invitados)"
                    style={{ padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 600 }}
                  />
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                    placeholder="Detalle opcional (ej: Cocktail y canapés en el jardín)"
                    style={{ padding: '0.45rem', borderRadius: '0.35rem', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                title="Eliminar actividad"
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: 'none',
                  borderRadius: '0.4rem',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Formulario para agregar actividad */}
      <form
        onSubmit={handleAdd}
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
          + Agregar Nueva Actividad
        </strong>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem' }}>
          <input
            type="text"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder="Horario (21:30)"
            required
            style={{ padding: '0.55rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nombre de la actividad (ej: Entrada triunfal)"
            required
            style={{ padding: '0.55rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Descripción opcional"
          style={{ padding: '0.55rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.4rem',
              background: '#9333ea',
              color: '#fff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Agregar al Cronograma
          </button>
        </div>
      </form>
    </div>
  );
}
