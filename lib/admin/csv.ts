import type { CsvParsedRow, CsvValidatedRow, CsvValidationSummary } from './types';

export const CSV_TEMPLATE_HEADER = 'grupo,cupo,nombre,apellido,telefono,email';

export function generateCsvTemplate(): string {
  const sample = [
    CSV_TEMPLATE_HEADER,
    'Familia Pérez,5,Juan,Pérez,1122334455,juan@email.com',
    'Familia Pérez,5,María,Pérez,1122334455,maria@email.com',
    'Familia Pérez,5,Pedro,Pérez,,',
    'Juan García,1,Juan,García,1199887766,',
    'Familia Rodríguez,4,Roberto,Rodríguez,1144556677,roberto@email.com',
  ].join('\r\n');

  return '\uFEFF' + sample;
}

export function parseCsv(content: string): CsvParsedRow[] {
  const clean = content.replace(/^\uFEFF/, '').trim();
  if (!clean) return [];

  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headerLine = lines[0].toLowerCase();
  const headers = splitCsvLine(headerLine);

  const groupIdx = headers.findIndex((h) => h.includes('grupo'));
  const cupoIdx = headers.findIndex((h) => h.includes('cupo') || h.includes('max'));
  const nameIdx = headers.findIndex((h) => h.includes('nombre') && !h.includes('grupo'));
  const lastNameIdx = headers.findIndex((h) => h.includes('apellido'));
  const phoneIdx = headers.findIndex((h) => h.includes('tel') || h.includes('phone') || h.includes('cel'));
  const emailIdx = headers.findIndex((h) => h.includes('mail'));

  const parsed: CsvParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length === 0 || cols.every((c) => !c.trim())) continue;

    parsed.push({
      grupo: groupIdx >= 0 ? (cols[groupIdx] || '').trim() : (cols[0] || '').trim(),
      cupo: cupoIdx >= 0 ? (cols[cupoIdx] || '').trim() : (cols[1] || '1').trim(),
      nombre: nameIdx >= 0 ? (cols[nameIdx] || '').trim() : (cols[2] || '').trim(),
      apellido: lastNameIdx >= 0 ? (cols[lastNameIdx] || '').trim() : (cols[3] || '').trim(),
      telefono: phoneIdx >= 0 ? (cols[phoneIdx] || '').trim() : (cols[4] || '').trim(),
      email: emailIdx >= 0 ? (cols[emailIdx] || '').trim() : (cols[5] || '').trim(),
    });
  }

  return parsed;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export function validateCsvRows(
  rows: CsvParsedRow[],
  existingGroupNames: string[] = []
): CsvValidationSummary {
  const validated: CsvValidatedRow[] = [];
  const groupsSeen = new Set<string>();

  const lowerExistingGroups = new Set(existingGroupNames.map((g) => g.trim().toLowerCase()));

  rows.forEach((row, idx) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const groupName = row.grupo?.trim() || '';
    const firstName = row.nombre?.trim() || '';
    const lastName = row.apellido?.trim() || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const phone = row.telefono?.trim() || '';
    const email = row.email?.trim() || '';

    if (!groupName) {
      errors.push('El nombre del grupo es obligatorio.');
    } else if (groupName.length > 100) {
      errors.push('El nombre del grupo es demasiado largo (máx. 100 caracteres).');
    }

    const cupoNum = typeof row.cupo === 'number' ? row.cupo : parseInt(String(row.cupo || '1'), 10);
    if (isNaN(cupoNum) || cupoNum < 1) {
      errors.push('El cupo debe ser un número entero mayor o igual a 1.');
    } else if (cupoNum > 50) {
      warnings.push(`Cupo elevado (${cupoNum} personas).`);
    }

    if (!firstName) {
      errors.push('El nombre de la persona es obligatorio.');
    } else if (firstName.length > 100) {
      errors.push('El nombre es demasiado largo (máx. 100 caracteres).');
    }

    const isDuplicate = lowerExistingGroups.has(groupName.toLowerCase());
    if (isDuplicate) {
      warnings.push(`El grupo "${groupName}" ya existe en este evento. Se agregarán personas.`);
    }

    if (groupName) {
      groupsSeen.add(groupName.toLowerCase());
    }

    validated.push({
      rowIndex: idx + 2,
      groupName,
      maxGuests: isNaN(cupoNum) || cupoNum < 1 ? 1 : cupoNum,
      firstName,
      lastName,
      fullName,
      phone,
      email,
      isValid: errors.length === 0,
      errors,
      warnings,
      isDuplicate,
    });
  });

  const validRowsCount = validated.filter((r) => r.isValid && r.warnings.length === 0).length;
  const warningRowsCount = validated.filter((r) => r.isValid && r.warnings.length > 0).length;
  const errorRowsCount = validated.filter((r) => !r.isValid).length;

  return {
    totalRows: validated.length,
    validRowsCount,
    warningRowsCount,
    errorRowsCount,
    distinctGroupsCount: groupsSeen.size,
    rows: validated,
  };
}

export function generateCsvExport(
  data: Array<{
    groupName: string;
    maxGuests: number;
    guestName: string;
    phone: string | null;
    status: string;
    confirmedCount: number | null;
    attendees: string;
    dietary: string;
    comment: string | null;
    confirmedAt: string | null;
  }>
): string {
  const headers = [
    'Grupo',
    'Cupo Máximo',
    'Invitado',
    'Teléfono',
    'Estado Confirmación',
    'Personas Confirmadas',
    'Asistentes Registrados',
    'Restricciones Alimentarias',
    'Mensaje / Comentario',
    'Fecha Confirmación',
  ];

  const lines = [headers.map(escapeCsv).join(',')];

  data.forEach((row) => {
    const line = [
      escapeCsv(row.groupName),
      escapeCsv(String(row.maxGuests)),
      escapeCsv(row.guestName),
      escapeCsv(row.phone || ''),
      escapeCsv(
        row.status === 'confirmed' ? 'Confirmado' : row.status === 'declined' ? 'No asiste' : 'Pendiente'
      ),
      escapeCsv(row.confirmedCount != null ? String(row.confirmedCount) : '0'),
      escapeCsv(row.attendees || ''),
      escapeCsv(row.dietary || ''),
      escapeCsv(row.comment || ''),
      escapeCsv(row.confirmedAt ? new Date(row.confirmedAt).toLocaleDateString('es-AR') : ''),
    ];
    lines.push(line.join(','));
  });

  return '\uFEFF' + lines.join('\r\n');
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes(';')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
