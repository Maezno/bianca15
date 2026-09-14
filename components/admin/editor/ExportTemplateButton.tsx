'use client';

import React, { useState } from 'react';
import type { EventDesignConfig, EventSectionConfig } from '@/types/event';

// ─── Metadatos de secciones ────────────────────────────────────────────────
const SECTION_META: Record<string, { label: string; icon: string; color: string }> = {
  hero:         { label: 'Hero / Portada',             icon: '👑', color: '#e0e7ff' },
  welcome:      { label: 'Bienvenida',                 icon: '✨', color: '#fce7f3' },
  countdown:    { label: 'Cuenta Regresiva',           icon: '⏳', color: '#ffe4e6' },
  date:         { label: 'Fecha y Hora',               icon: '📅', color: '#fef3c7' },
  location:     { label: 'Ubicación y Mapas',          icon: '📍', color: '#dcfce7' },
  schedule:     { label: 'Cronograma',                 icon: '⏰', color: '#e0f2fe' },
  dress_code:   { label: 'Código de Vestimenta',       icon: '👔', color: '#f3e8ff' },
  gifts:        { label: 'Mesa de Regalos / CBU',      icon: '🎁', color: '#fdf2f8' },
  photos:       { label: 'Álbum de Fotos',             icon: '📸', color: '#fff7ed' },
  confirmation: { label: 'Confirmación de Asistencia', icon: '✅', color: '#f0fdf4' },
  share:        { label: 'Compartir Invitación',       icon: '🔗', color: '#f8fafc' },
  footer:       { label: 'Pie de Página',              icon: '💌', color: '#fdf4ff' },
};

interface Props {
  designConfig: EventDesignConfig;
  sectionConfig: EventSectionConfig;
  eventName?: string;
}

function buildSVG(params: {
  width: number;
  sections: Array<{ id: string; height: number; label: string; icon: string; color: string }>;
  gap: number;
  eventName: string;
  designConfig: EventDesignConfig;
}): string {
  const { width, sections, gap, eventName, designConfig } = params;

  const MARGIN_LEFT = 80;
  const MARGIN_TOP  = 120;
  const COTA_RIGHT  = 70;
  const FOOTER_H    = 80;

  const totalH = sections.reduce((acc, s, i) => acc + s.height + (i < sections.length - 1 ? gap : 0), 0);
  const svgW = MARGIN_LEFT + width + COTA_RIGHT + 200;
  const svgH = MARGIN_TOP + totalH + FOOTER_H;

  const lines: string[] = [];
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  lines.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">`);
  lines.push(`<defs><style>text{font-family:'Inter','Segoe UI',Arial,sans-serif;}.sec-label{font-size:28px;font-weight:700;fill:#1e293b;}.sec-dim{font-size:20px;fill:#64748b;}.cota-text{font-size:14px;fill:#9333ea;font-weight:600;}.cota-line{stroke:#9333ea;stroke-width:1;stroke-dasharray:4 3;}</style></defs>`);

  // Fondo
  lines.push(`<rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#f1f5f9"/>`);

  // Header
  lines.push(`<rect x="0" y="0" width="${MARGIN_LEFT + width + COTA_RIGHT}" height="${MARGIN_TOP}" fill="#0f172a"/>`);
  lines.push(`<text x="${MARGIN_LEFT}" y="38" font-size="20" font-weight="700" fill="#f8fafc">PLANTILLA DE FONDO — ${esc(eventName.toUpperCase())}</text>`);
  lines.push(`<text x="${MARGIN_LEFT}" y="64" font-size="14" fill="#94a3b8">Ancho: ${width} px  |  Alto total: ${totalH} px  |  ${sections.length} secciones activas</text>`);
  lines.push(`<text x="${MARGIN_LEFT}" y="88" font-size="13" fill="#94a3b8">Modo: Alto Fijo — Gap entre secciones: ${gap} px</text>`);

  // Cota horizontal
  const cotaY = MARGIN_TOP - 18;
  lines.push(`<line x1="${MARGIN_LEFT}" y1="${cotaY}" x2="${MARGIN_LEFT + width}" y2="${cotaY}" class="cota-line"/>`);
  lines.push(`<polygon points="${MARGIN_LEFT},${cotaY} ${MARGIN_LEFT+10},${cotaY-4} ${MARGIN_LEFT+10},${cotaY+4}" fill="#9333ea"/>`);
  lines.push(`<polygon points="${MARGIN_LEFT+width},${cotaY} ${MARGIN_LEFT+width-10},${cotaY-4} ${MARGIN_LEFT+width-10},${cotaY+4}" fill="#9333ea"/>`);
  lines.push(`<text x="${MARGIN_LEFT + width/2}" y="${cotaY - 4}" class="cota-text" text-anchor="middle">${width} px</text>`);

  let cursorY = MARGIN_TOP;
  sections.forEach((sec, idx) => {
    const secY = cursorY;
    lines.push(`<g id="seccion_${sec.id}" inkscape:label="${esc(sec.label)}" inkscape:groupmode="layer">`);
    lines.push(`<rect x="${MARGIN_LEFT}" y="${secY}" width="${width}" height="${sec.height}" fill="${sec.color}" stroke="#94a3b8" stroke-width="1"/>`);
    lines.push(`<rect x="${MARGIN_LEFT+20}" y="${secY+20}" width="${width-40}" height="${sec.height-40}" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="8 4"/>`);

    const cx = MARGIN_LEFT + width / 2;
    const cy = secY + sec.height / 2;
    lines.push(`<text x="${cx}" y="${cy - 20}" font-size="32" text-anchor="middle">${esc(sec.icon)}</text>`);
    lines.push(`<text x="${cx}" y="${cy + 20}" class="sec-label" text-anchor="middle">${esc(sec.label)}</text>`);
    lines.push(`<text x="${cx}" y="${cy + 50}" class="sec-dim" text-anchor="middle">${width} × ${sec.height} px</text>`);

    // Número de sección
    lines.push(`<rect x="${MARGIN_LEFT}" y="${secY}" width="36" height="26" fill="#0f172a" rx="3"/>`);
    lines.push(`<text x="${MARGIN_LEFT+18}" y="${secY+18}" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle">${idx+1}</text>`);

    // Cota vertical derecha
    const cxR = MARGIN_LEFT + width + 35;
    lines.push(`<line x1="${MARGIN_LEFT+width}" y1="${secY}" x2="${MARGIN_LEFT+width+55}" y2="${secY}" class="cota-line"/>`);
    lines.push(`<line x1="${MARGIN_LEFT+width}" y1="${secY+sec.height}" x2="${MARGIN_LEFT+width+55}" y2="${secY+sec.height}" class="cota-line"/>`);
    lines.push(`<line x1="${cxR}" y1="${secY}" x2="${cxR}" y2="${secY+sec.height}" class="cota-line"/>`);
    lines.push(`<polygon points="${cxR},${secY} ${cxR-4},${secY+10} ${cxR+4},${secY+10}" fill="#9333ea"/>`);
    lines.push(`<polygon points="${cxR},${secY+sec.height} ${cxR-4},${secY+sec.height-10} ${cxR+4},${secY+sec.height-10}" fill="#9333ea"/>`);
    lines.push(`<text x="${cxR+8}" y="${secY + sec.height/2 + 5}" class="cota-text" text-anchor="middle" transform="rotate(-90,${cxR+8},${secY+sec.height/2+5})">${sec.height} px</text>`);

    // Y acumulado
    lines.push(`<text x="${MARGIN_LEFT-6}" y="${secY+sec.height/2+5}" font-size="12" fill="#64748b" text-anchor="end">y: ${secY - MARGIN_TOP}</text>`);

    lines.push(`</g>`);

    if (gap > 0 && idx < sections.length - 1) {
      const gapY = secY + sec.height;
      lines.push(`<g id="gap_${sec.id}" inkscape:label="Gap → ${esc(sections[idx+1].label)}" inkscape:groupmode="layer">`);
      lines.push(`<rect x="${MARGIN_LEFT}" y="${gapY}" width="${width}" height="${gap}" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="6 3"/>`);
      lines.push(`<text x="${MARGIN_LEFT+width/2}" y="${gapY+gap/2+5}" font-size="14" fill="#94a3b8" text-anchor="middle">gap: ${gap} px</text>`);
      lines.push(`</g>`);
    }

    cursorY += sec.height + (idx < sections.length - 1 ? gap : 0);
  });

  // Borde exterior
  const bordH = sections.reduce((a, s, i) => a + s.height + (i < sections.length - 1 ? gap : 0), 0);
  lines.push(`<rect x="${MARGIN_LEFT}" y="${MARGIN_TOP}" width="${width}" height="${bordH}" fill="none" stroke="#0f172a" stroke-width="2"/>`);

  // Panel de colores
  const colors = designConfig.colors || {};
  const colorPairs: Array<[string, string]> = [
    ['Primario',   colors.primary    || '#9333ea'],
    ['Secundario', colors.secondary  || '#db2777'],
    ['Fondo',      colors.background || '#ffffff'],
    ['Superficie', colors.surface    || '#f8fafc'],
    ['Texto',      colors.text       || '#0f172a'],
    ['Acento',     colors.accent     || '#f59e0b'],
  ];
  const panelX = MARGIN_LEFT + width + COTA_RIGHT + 16;
  const panelY = MARGIN_TOP;
  lines.push(`<g id="paleta_colores" inkscape:label="Paleta de Colores" inkscape:groupmode="layer">`);
  lines.push(`<rect x="${panelX}" y="${panelY}" width="172" height="${colorPairs.length*44+50}" fill="#ffffff" rx="8" stroke="#e2e8f0" stroke-width="1"/>`);
  lines.push(`<text x="${panelX+86}" y="${panelY+26}" font-size="15" font-weight="700" fill="#0f172a" text-anchor="middle">🎨 Colores del Evento</text>`);
  colorPairs.forEach(([name, hex], i) => {
    const cy2 = panelY + 46 + i * 44;
    lines.push(`<rect x="${panelX+12}" y="${cy2}" width="28" height="28" fill="${hex}" rx="4" stroke="#e2e8f0" stroke-width="1"/>`);
    lines.push(`<text x="${panelX+48}" y="${cy2+14}" font-size="13" font-weight="600" fill="#334155">${esc(name)}</text>`);
    lines.push(`<text x="${panelX+48}" y="${cy2+28}" font-size="11" fill="#64748b" font-family="monospace">${hex.toUpperCase()}</text>`);
  });
  lines.push(`</g>`);

  // Footer
  const footerY = MARGIN_TOP + totalH + 22;
  lines.push(`<text x="${MARGIN_LEFT}" y="${footerY+16}" font-size="12" fill="#94a3b8">Generado por Bianca15 Editor · ${new Date().toLocaleDateString('es-AR')}</text>`);
  lines.push(`<text x="${MARGIN_LEFT}" y="${footerY+34}" font-size="13" font-weight="600" fill="#64748b">Alto total: ${totalH} px — Ancho: ${width} px</text>`);

  lines.push(`</svg>`);
  return lines.join('\n');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildZip(files: Array<{ name: string; content: Uint8Array }>): Uint8Array {
  const toU16 = (n: number) => new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
  const toU32 = (n: number) => new Uint8Array([n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]);
  const concat = (...arrays: Uint8Array[]) => {
    const out = new Uint8Array(arrays.reduce((s, a) => s + a.length, 0));
    let p = 0; for (const a of arrays) { out.set(a, p); p += a.length; }
    return out;
  };
  const crc32 = (data: Uint8Array) => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) { let c = i; for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[i] = c; }
    let crc = 0xffffffff;
    for (const b of data) crc = t[(crc ^ b) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };
  const enc = new TextEncoder();
  const now = new Date();
  const dosDate = ((now.getFullYear()-1980) << 9) | ((now.getMonth()+1) << 5) | now.getDate();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const nb = enc.encode(f.name);
    const crc = crc32(f.content);
    const sz = f.content.length;
    const lh = concat(new Uint8Array([0x50,0x4b,0x03,0x04]),toU16(20),toU16(0),toU16(0),toU16(dosTime),toU16(dosDate),toU32(crc),toU32(sz),toU32(sz),toU16(nb.length),toU16(0),nb,f.content);
    locals.push(lh);
    central.push(concat(new Uint8Array([0x50,0x4b,0x01,0x02]),toU16(20),toU16(20),toU16(0),toU16(0),toU16(dosTime),toU16(dosDate),toU32(crc),toU32(sz),toU32(sz),toU16(nb.length),toU16(0),toU16(0),toU16(0),toU16(0),toU32(0),toU32(offset),nb));
    offset += lh.length;
  }
  const cd = concat(...central);
  const eocd = concat(new Uint8Array([0x50,0x4b,0x05,0x06]),toU16(0),toU16(0),toU16(files.length),toU16(files.length),toU32(cd.length),toU32(offset),toU16(0));
  return concat(...locals, cd, eocd);
}

export function ExportTemplateButton({ designConfig, sectionConfig, eventName = 'Evento' }: Props) {
  const [refWidth, setRefWidth] = useState(390);
  const [exporting, setExporting] = useState(false);

  if (designConfig.layout?.mode !== 'fixed') return null;

  const layout = designConfig.layout!;
  const globalH = layout.sectionHeight || 700;
  const gap = layout.sectionGap ?? 0;

  const allIds = Object.keys(SECTION_META);
  const order = (sectionConfig.order && sectionConfig.order.length > 0)
    ? sectionConfig.order.filter((s) => allIds.includes(s))
    : [...allIds];
  allIds.forEach((s) => { if (!order.includes(s)) order.push(s); });

  const activeSections = order
    .filter((id) => sectionConfig.enabled?.[id] !== false)
    .map((id) => ({
      id,
      height: layout.sectionHeights?.[id] || globalH,
      label: SECTION_META[id]?.label || id,
      icon: SECTION_META[id]?.icon || '📄',
      color: SECTION_META[id]?.color || '#f8fafc',
    }));

  const totalH = activeSections.reduce((acc, s, i) => acc + s.height + (i < activeSections.length - 1 ? gap : 0), 0);

  const handleExport = async () => {
    setExporting(true);
    try {
      const enc = new TextEncoder();
      const svgContent = buildSVG({ width: refWidth, sections: activeSections, gap, eventName, designConfig });

      const readme = [
        `PLANTILLA DE FONDO — ${eventName}`,
        '='.repeat(50),
        '',
        'Archivos incluidos:',
        '  • plantilla_fondo.svg  — Abrir en Illustrator, Inkscape o Affinity Designer',
        '  • como_usar.txt        — Este archivo',
        '',
        `Dimensiones de referencia:`,
        `  • Ancho:        ${refWidth} px`,
        `  • Alto total:   ${totalH} px`,
        `  • Gap:          ${gap} px`,
        '',
        'Secciones activas (en orden):',
        ...activeSections.map((s, i) => `  ${i+1}. ${s.label} — ${s.height} px`),
        '',
        'Cómo usar en Illustrator:',
        '  1. Archivo > Abrir > seleccionar plantilla_fondo.svg',
        '  2. Las capas aparecen en el panel Capas (F7)',
        '  3. Dibujá tu diseño encima de cada sección',
        '  4. Exportar > Exportar como... > PNG/JPG',
        '',
        'Para PDF: abrir el SVG en el navegador > Ctrl+P > Guardar como PDF',
        '',
        `Generado: ${new Date().toLocaleString('es-AR')}`,
      ].join('\n');

      const zip = buildZip([
        { name: 'plantilla_fondo.svg', content: enc.encode(svgContent) },
        { name: 'como_usar.txt',       content: enc.encode(readme) },
      ]);

      const safeName = eventName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      downloadBlob(new Blob([zip.buffer as ArrayBuffer], { type: 'application/zip' }), `plantilla_fondo_${safeName}.zip`);

      // Abrir SVG en nueva pestaña para guardar como PDF
      const svgUrl = URL.createObjectURL(new Blob([svgContent], { type: 'image/svg+xml' }));
      window.open(svgUrl, '_blank');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'linear-gradient(135deg,#faf5ff,#f0f9ff)', border: '1.5px solid #d8b4fe', borderRadius: '0.75rem' }}>
      <strong style={{ fontSize: '0.92rem', color: '#4c1d95', display: 'block', marginBottom: '0.2rem' }}>
        🗺️ Exportar Plantilla para Diseño
      </strong>
      <p style={{ fontSize: '0.78rem', color: '#6d28d9', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
        Descargá un <strong>.zip</strong> con la plantilla SVG lista para{' '}
        <strong>Illustrator · Inkscape · Affinity</strong>. Incluye secciones con dimensiones exactas,
        separadores, cotas y capas nombradas. También se abre el SVG para guardar como PDF.
      </p>

      {/* Resumen */}
      <div style={{ background: '#fff', border: '1px solid #e9d5ff', borderRadius: '0.5rem', padding: '0.6rem 0.85rem', marginBottom: '0.75rem', fontSize: '0.78rem', color: '#334155', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem' }}>
        <span>📐 Ancho: <strong>{refWidth} px</strong></span>
        <span>📏 Alto total: <strong>{totalH} px</strong></span>
        <span>📦 Secciones: <strong>{activeSections.length}</strong></span>
        <span>🔲 Gap: <strong>{gap} px</strong></span>
      </div>

      {/* Selector de ancho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Ancho de referencia:</span>
        {[375, 390, 428, 768].map((w) => (
          <button key={w} type="button" onClick={() => setRefWidth(w)} style={{ padding: '0.28rem 0.55rem', borderRadius: '0.35rem', border: `1.5px solid ${refWidth === w ? '#9333ea' : '#e2e8f0'}`, background: refWidth === w ? '#f3e8ff' : '#fff', color: refWidth === w ? '#7e22ce' : '#475569', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            {w}
          </button>
        ))}
        <input type="number" min={320} max={1920} value={refWidth} onChange={(e) => setRefWidth(parseInt(e.target.value,10)||390)}
          style={{ width: '68px', padding: '0.28rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.35rem', fontSize: '0.78rem', textAlign: 'center' }} />
        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>px</span>
      </div>

      {/* Botón */}
      <button type="button" onClick={handleExport} disabled={exporting || activeSections.length === 0}
        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', background: exporting ? '#a78bfa' : 'linear-gradient(135deg,#7c3aed,#9333ea)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: exporting || activeSections.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(147,51,234,0.35)' }}>
        {exporting ? '⏳ Generando…' : '📥 Exportar Plantilla SVG + PDF (.zip)'}
      </button>

      {activeSections.length === 0 && (
        <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem', textAlign: 'center' }}>
          No hay secciones activas. Activá al menos una en la pestaña Secciones.
        </p>
      )}
    </div>
  );
}
