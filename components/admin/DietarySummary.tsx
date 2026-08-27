import React from 'react';
import type { AdminEventStats } from '@/lib/admin/types';

interface DietarySummaryProps {
  stats: AdminEventStats;
}

export function DietarySummary({ stats }: DietarySummaryProps) {
  const { summary, details } = stats.dietary;

  const specialDietary = summary.filter((s) => s.key !== 'none' && s.count > 0);
  const totalSpecial = specialDietary.reduce((acc, s) => acc + s.count, 0);

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          🥗 Restricciones Alimentarias
        </h3>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          Total especiales: <strong style={{ color: '#9333ea' }}>{totalSpecial}</strong>
        </span>
      </div>

      {/* Badges Summary */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {summary.map((item) => (
          <div
            key={item.key}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '0.5rem',
              background: item.count > 0 && item.key !== 'none' ? '#fdf4ff' : '#f8fafc',
              border: item.count > 0 && item.key !== 'none' ? '1px solid #f0abfc' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
            }}
          >
            <span style={{ color: '#475569', fontWeight: 600 }}>{item.label}:</span>
            <strong style={{ color: item.count > 0 && item.key !== 'none' ? '#9333ea' : '#0f172a' }}>
              {item.count}
            </strong>
          </div>
        ))}
      </div>

      {/* Details Table */}
      {details.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Asistente</th>
                <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Grupo</th>
                <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Restricción</th>
              </tr>
            </thead>
            <tbody>
              {details.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>{d.attendeeName}</td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{d.groupName}</td>
                  <td style={{ padding: '0.5rem 0.75rem' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                      {d.restriction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
          No hay restricciones alimentarias especiales registradas por el momento.
        </p>
      )}
    </div>
  );
}
