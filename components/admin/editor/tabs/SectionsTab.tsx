'use client';

import React from 'react';
import type { EventSectionConfig } from '@/types/event';

interface SectionsTabProps {
  sectionConfig: EventSectionConfig;
  setSectionConfig: React.Dispatch<React.SetStateAction<EventSectionConfig>>;
  supportedSections: string[];
}

const SECTION_METADATA: Record<string, { label: string; icon: string; description: string }> = {
  hero: { label: 'Portada (Hero)', icon: '👑', description: 'Nombre, título del evento y botón principal' },
  welcome: { label: 'Bienvenida', icon: '✨', description: 'Mensaje especial o palabras de los anfitriones' },
  countdown: { label: 'Cuenta Regresiva', icon: '⏳', description: 'Contador dinámico de días, horas y minutos' },
  date: { label: 'Fecha y Hora', icon: '📅', description: 'Día, hora de inicio y coordenadas temporales' },
  location: { label: 'Ubicación y Mapas', icon: '📍', description: 'Nombre del salón, dirección y enlaces a Maps/Waze' },
  schedule: { label: 'Cronograma', icon: '⏰', description: 'Itinerario y horarios de las actividades' },
  dress_code: { label: 'Código de Vestimenta', icon: '👔', description: 'Formal, Elegante Sport, Black Tie, etc.' },
  gifts: { label: 'Mesa de Regalos / CBU', icon: '🎁', description: 'Datos bancarios, alias o buzón de sobres' },
  confirmation: { label: 'Confirmación de Asistencia', icon: '✅', description: 'Formulario interactivo de RSVP' },
  photos: { label: 'Álbum de Fotos', icon: '📸', description: 'Enlace al álbum digital colaborativo' },
  share: { label: 'Compartir Invitación', icon: '🔗', description: 'Botón para compartir vía WhatsApp y redes' },
  footer: { label: 'Pie de Página', icon: '💌', description: 'Mensaje de cierre y créditos de la invitación' },
};

export function SectionsTab({
  sectionConfig,
  setSectionConfig,
  supportedSections,
}: SectionsTabProps) {
  const currentOrder = (sectionConfig.order && sectionConfig.order.length > 0)
    ? sectionConfig.order.filter((s) => supportedSections.includes(s))
    : supportedSections;

  // Asegurarse de incluir cualquier sección soportada que no esté aún en el orden
  supportedSections.forEach((s) => {
    if (!currentOrder.includes(s)) currentOrder.push(s);
  });

  const toggleSection = (key: string) => {
    setSectionConfig((prev) => ({
      ...prev,
      enabled: {
        ...(prev.enabled || {}),
        [key]: prev.enabled?.[key] === false ? true : false,
      },
    }));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const nextOrder = [...currentOrder];
    const temp = nextOrder[index - 1];
    nextOrder[index - 1] = nextOrder[index];
    nextOrder[index] = temp;
    setSectionConfig((prev) => ({ ...prev, order: nextOrder }));
  };

  const moveDown = (index: number) => {
    if (index === currentOrder.length - 1) return;
    const nextOrder = [...currentOrder];
    const temp = nextOrder[index + 1];
    nextOrder[index + 1] = nextOrder[index];
    nextOrder[index] = temp;
    setSectionConfig((prev) => ({ ...prev, order: nextOrder }));
  };

  // Drag & drop básico con eventos HTML5
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(dragIndex, 1);
    nextOrder.splice(dropIndex, 0, moved);
    setSectionConfig((prev) => ({ ...prev, order: nextOrder }));
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Organización y Visibilidad de Secciones
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Activá o desactivá secciones y cambialas de posición arrastrándolas o con las flechas.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {currentOrder.map((sectionKey, index) => {
          const meta = SECTION_METADATA[sectionKey] || {
            label: sectionKey,
            icon: '📄',
            description: 'Sección del evento',
          };
          const isEnabled = sectionConfig.enabled?.[sectionKey] !== false;

          return (
            <div
              key={sectionKey}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                background: isEnabled ? '#ffffff' : '#f8fafc',
                border: '1px solid',
                borderColor: isEnabled ? '#e2e8f0' : '#cbd5e1',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: isEnabled ? 1 : 0.65,
                transition: 'all 0.15s ease',
                boxShadow: isEnabled ? '0 1px 3px rgba(0,0,0,0.03)' : 'none',
                cursor: 'grab',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ cursor: 'grab', color: '#94a3b8', fontSize: '1.1rem', userSelect: 'none' }}>
                  ☰
                </span>
                <span style={{ fontSize: '1.35rem' }}>{meta.icon}</span>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: isEnabled ? '#0f172a' : '#64748b', display: 'block' }}>
                    {meta.label}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {meta.description}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Mover hacia arriba"
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '0.35rem',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                    opacity: index === 0 ? 0.3 : 1,
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === currentOrder.length - 1}
                  title="Mover hacia abajo"
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '0.35rem',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    cursor: index === currentOrder.length - 1 ? 'not-allowed' : 'pointer',
                    opacity: index === currentOrder.length - 1 ? 0.3 : 1,
                  }}
                >
                  ▼
                </button>

                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.45rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: isEnabled ? '#dcfce7' : '#f1f5f9',
                    color: isEnabled ? '#166534' : '#64748b',
                  }}
                >
                  {isEnabled ? '✓ Visible' : 'Oculto'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
