/**
 * lib/utils/csv.ts
 * Utilidades puras para generación y descarga de CSV — no dependen de servidor.
 */

import type { AdminGuestGroupItem } from '@/lib/admin/types';

/**
 * Exporta la lista de invitados y grupos a formato CSV estándar UTF-8 (Punto 18 del Hito 8).
 */
export function exportGuestsToCsv(groups: AdminGuestGroupItem[]): string {
  const headers = ['Nombre / Integrantes', 'Grupo', 'Teléfono', 'Email', 'Cupo', 'Confirmados', 'Estado', 'Comentario'];

  const rows = groups.map((g) => {
    const statusText =
      g.confirmation?.status === 'confirmed'
        ? 'Confirmado'
        : g.confirmation?.status === 'declined'
        ? 'No asiste'
        : 'Pendiente';

    const members = g.guests.map((gu) => gu.name).join('; ') || g.name;
    const confirmedCount =
      g.confirmation?.guests_count !== null && g.confirmation?.guests_count !== undefined
        ? String(g.confirmation.guests_count)
        : '0';

    const escapeCsv = (val: string | null | undefined) => {
      const str = val || '';
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      escapeCsv(members),
      escapeCsv(g.name),
      escapeCsv(g.phone),
      escapeCsv(g.email),
      String(g.max_guests),
      confirmedCount,
      statusText,
      escapeCsv(g.confirmation?.comment),
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) para correcta apertura en Excel
  return `\uFEFF${headers.join(',')}\n${rows.join('\n')}`;
}

/**
 * Dispara una descarga del CSV en el navegador.
 */
export function downloadCsv(csvContent: string, filename: string = 'invitados.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
