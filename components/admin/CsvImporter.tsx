'use client';

import React, { useState } from 'react';
import { generateCsvTemplate, parseCsv, validateCsvRows } from '@/lib/admin/csv';
import { importCsvGuestGroups } from '@/lib/admin/guests';
import type { CsvValidationSummary } from '@/lib/admin/types';

interface CsvImporterProps {
  eventId: string;
  existingGroupNames: string[];
  onImportComplete: () => void;
}

export function CsvImporter({ eventId, existingGroupNames, onImportComplete }: CsvImporterProps) {
  const [summary, setSummary] = useState<CsvValidationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ groups: number; guests: number } | null>(null);

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_invitados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = parseCsv(text);

        if (parsed.length === 0) {
          setError('El archivo CSV está vacío o no contiene filas válidas.');
          return;
        }

        const validation = validateCsvRows(parsed, existingGroupNames);
        setSummary(validation);
      } catch {
        setError('Error al procesar el archivo CSV. Asegurate de que sea un archivo de texto o CSV válido.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = async () => {
    if (!summary || summary.validRowsCount === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await importCsvGuestGroups(eventId, summary.rows);
      if (res.success) {
        setSuccessResult({
          groups: res.importedGroupsCount,
          guests: res.importedGuestsCount,
        });
        setSummary(null);
        onImportComplete();
      } else {
        setError(res.error || 'Error al guardar los invitados en la base de datos.');
      }
    } catch {
      setError('Error inesperado durante la importación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
      {/* Header & Template Download */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Importador de Invitados por CSV
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            Cargá masivamente grupos e invitados a partir de una planilla CSV.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          style={{
            padding: '0.55rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#334155',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          📥 Descargar Plantilla CSV
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      {successResult && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700 }}>¡Importación completada con éxito! 🎉</h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Se crearon/actualizaron <strong>{successResult.groups}</strong> grupos y <strong>{successResult.guests}</strong> invitados.
          </p>
        </div>
      )}

      {/* File Upload Drop Area */}
      {!summary && (
        <div
          style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '0.75rem',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            background: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
            Seleccioná o arrastrá tu archivo CSV
          </p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Columnas soportadas: <code>grupo, cupo, nombre, apellido, telefono, email</code>
          </p>
          <label
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.5rem',
              background: '#9333ea',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-block',
            }}
          >
            Buscar Archivo CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {/* Validation Preview */}
      {summary && (
        <div>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{summary.totalRows}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Filas encontradas</div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{summary.validRowsCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>✓ Válidas</div>
            </div>
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ca8a04' }}>{summary.warningRowsCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#854d0e', fontWeight: 600 }}>⚠️ Con avisos</div>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626' }}>{summary.errorRowsCount}</div>
              <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>❌ Con errores</div>
            </div>
          </div>

          {/* Table Preview */}
          <div style={{ overflowX: 'auto', maxHeight: '360px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Fila</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Grupo</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Cupo</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Persona</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Teléfono</th>
                  <th style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {summary.rows.map((row) => (
                  <tr
                    key={row.rowIndex}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: !row.isValid ? '#fef2f2' : row.warnings.length > 0 ? '#fefce8' : '#ffffff',
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', color: '#94a3b8' }}>#{row.rowIndex}</td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{row.groupName || '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{row.maxGuests}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{row.fullName || '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{row.phone || '—'}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {!row.isValid ? (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>❌ {row.errors.join('; ')}</span>
                      ) : row.warnings.length > 0 ? (
                        <span style={{ color: '#ca8a04', fontWeight: 600 }}>⚠️ {row.warnings.join('; ')}</span>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Válido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setSummary(null)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              ← Cancelar y elegir otro archivo
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={loading || summary.validRowsCount === 0}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: '#9333ea',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: loading || summary.validRowsCount === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(147, 51, 234, 0.25)',
              }}
            >
              {loading ? 'Importando...' : `Confirmar e Importar (${summary.validRowsCount} filas)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
