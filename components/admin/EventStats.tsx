import React from 'react';
import type { AdminEventStats } from '@/lib/admin/types';

interface EventStatsProps {
  stats: AdminEventStats;
}

export function EventStats({ stats }: EventStatsProps) {
  const { groups, persons } = stats;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {/* Grupos Totales */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Grupos / Enlaces</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>{groups.total}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Capacidad máx: {persons.maxCapacity} personas</div>
      </div>

      {/* Grupos Confirmados */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Grupos Confirmados</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', margin: '0.25rem 0' }}>{groups.confirmed}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{groups.total > 0 ? Math.round((groups.confirmed / groups.total) * 100) : 0}% de los grupos</div>
      </div>

      {/* Personas Confirmadas */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9333ea', textTransform: 'uppercase' }}>Personas Confirmadas</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#9333ea', margin: '0.25rem 0' }}>{persons.confirmedPersons}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Asistentes reales registrados</div>
      </div>

      {/* Pendientes */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#eab308', textTransform: 'uppercase' }}>Grupos Pendientes</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ca8a04', margin: '0.25rem 0' }}>{groups.pending}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Aún no han respondido</div>
      </div>

      {/* No Asisten */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>No Asisten</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', margin: '0.25rem 0' }}>{groups.declined}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Declinaron invitación</div>
      </div>

      {/* Cupos Restantes */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Cupos Libres</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', margin: '0.25rem 0' }}>{persons.remainingCapacity}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Margen disponible</div>
      </div>
    </div>
  );
}
