'use client';

import React from 'react';
import { getAllTemplates } from '@/templates/registry';

interface GeneralTabProps {
  name: string;
  setName: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  welcomeText: string;
  setWelcomeText: (v: string) => void;
  type: string;
  setType: (v: string) => void;
  templateId: string;
  setTemplateId: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  mapsUrl: string;
  setMapsUrl: (v: string) => void;
  wazeUrl: string;
  setWazeUrl: (v: string) => void;
  dressCode: string;
  setDressCode: (v: string) => void;
  giftsText: string;
  setGiftsText: (v: string) => void;
}

export function GeneralTab({
  name,
  setName,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  welcomeText,
  setWelcomeText,
  type,
  setType,
  templateId,
  setTemplateId,
  date,
  setDate,
  startTime,
  setStartTime,
  location,
  setLocation,
  address,
  setAddress,
  mapsUrl,
  setMapsUrl,
  wazeUrl,
  setWazeUrl,
  dressCode,
  setDressCode,
  giftsText,
  setGiftsText,
}: GeneralTabProps) {
  const templates = getAllTemplates();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Información Básica */}
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
          Nombre Interno del Evento *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ej: Bianca - 15 años"
          style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Título Público *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ej: Mis 15 años"
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Subtítulo (opcional)
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="ej: Te invito a compartir una noche mágica"
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
          Texto de Bienvenida / Mensaje Principal
        </label>
        <textarea
          rows={3}
          value={welcomeText}
          onChange={(e) => setWelcomeText(e.target.value)}
          placeholder="Mensaje de bienvenida que se muestra a los invitados..."
          style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Tipo de Evento
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', background: '#fff' }}
          >
            <option value="15_years">Cumpleaños de 15</option>
            <option value="wedding">Boda / Casamiento</option>
            <option value="birthday">Cumpleaños</option>
            <option value="corporate">Corporativo</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Plantilla Visual 🎨
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #9333ea', fontSize: '0.9rem', boxSizing: 'border-box', background: '#fff', fontWeight: 600, color: '#9333ea' }}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} (v{t.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fecha y Lugar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Hora de Inicio
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
          Lugar / Salón
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="ej: Salón Las Camelias"
          style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
          Dirección
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ej: Av. Libertador 4500, Buenos Aires"
          style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Google Maps URL (opcional)
          </label>
          <input
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
            Waze URL (opcional)
          </label>
          <input
            type="url"
            value={wazeUrl}
            onChange={(e) => setWazeUrl(e.target.value)}
            placeholder="https://waze.com/..."
            style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
          Dress Code / Código de Vestimenta
        </label>
        <input
          type="text"
          value={dressCode}
          onChange={(e) => setDressCode(e.target.value)}
          placeholder="ej: Elegante Sport, Black Tie, etc."
          style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
          Texto de Regalos / Datos Bancarios
        </label>
        <textarea
          rows={3}
          value={giftsText}
          onChange={(e) => setGiftsText(e.target.value)}
          placeholder="Datos bancarios, CBU, alias o mensaje sobre regalos..."
          style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
}
