'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { EventDesignConfig, EventSectionConfig } from '@/types/event';
import type { ColorPreset, TemplateTheme } from '@/templates/types';
import { ExportTemplateButton } from '../ExportTemplateButton';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { uploadEventFont } from '@/lib/admin/media';

/** Mapa compacto de fuente predefinida → URL de Google Fonts (para preview en editor) */
const EDITOR_FONT_URLS: Record<string, string> = {
  'Great Vibes, cursive': 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
  'Alex Brush, cursive': 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap',
  'Pinyon Script, cursive': 'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap',
  'Tangerine, cursive': 'https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap',
  'Dancing Script, cursive': 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
  'Parisienne, cursive': 'https://fonts.googleapis.com/css2?family=Parisienne&display=swap',
  'Italianno, cursive': 'https://fonts.googleapis.com/css2?family=Italianno&display=swap',
  'Cormorant Garamond, Georgia, serif': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap',
  'Playfair Display, Georgia, serif': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
  'Cinzel, serif': 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap',
  'EB Garamond, Georgia, serif': 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap',
  'Libre Baskerville, Georgia, serif': 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap',
  'DM Serif Display, Georgia, serif': 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap',
  'Cardo, serif': 'https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&display=swap',
  'Montserrat, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Raleway, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Josefin Sans, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,600;1,300&display=swap',
  'Lato, sans-serif': 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&display=swap',
  'Poppins, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Nunito, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Open Sans, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap',
};

function loadEditorFont(fontFamilyOrUrl: string) {
  if (!fontFamilyOrUrl || typeof window === 'undefined') return;

  if (fontFamilyOrUrl.startsWith('http://') || fontFamilyOrUrl.startsWith('https://')) {
    const id = `editor-url-${fontFamilyOrUrl.replace(/[^a-z0-9]/gi, '-').slice(-24)}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = fontFamilyOrUrl;
    document.head.appendChild(link);
    return;
  }

  const url = EDITOR_FONT_URLS[fontFamilyOrUrl];
  if (!url) return;
  const id = `editor-gf-${fontFamilyOrUrl.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

function injectUploadedFontsInEditor(fonts?: Array<{ name: string; url: string; format?: string }>) {
  if (!fonts || fonts.length === 0 || typeof window === 'undefined') return;
  const id = 'editor-uploaded-fonts';
  let styleEl = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = id;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = fonts
    .map((f) => {
      const formatStr = f.format ? ` format('${f.format}')` : '';
      return `@font-face { font-family: '${f.name}'; src: url('${f.url}')${formatStr}; font-display: swap; }`;
    })
    .join('\n');
}

function ButtonImageRow({
  label,
  url,
  onPick,
  onClear,
}: {
  label: string;
  url?: string;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>{label}</span>
      {url && (
        <div
          title={url.split('/').pop()}
          style={{
            width: '52px',
            height: '28px',
            borderRadius: '0.3rem',
            backgroundImage: `url("${url}")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            flexShrink: 0,
          }}
        />
      )}
      <button
        type="button"
        onClick={onPick}
        style={{
          padding: '0.18rem 0.5rem',
          borderRadius: '0.3rem',
          border: '1px solid',
          borderColor: url ? '#16a34a' : '#cbd5e1',
          background: url ? '#dcfce7' : '#ffffff',
          color: url ? '#14532d' : '#334155',
          fontSize: '0.68rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {url ? 'Cambiar PNG' : 'Elegir PNG'}
      </button>
      {url && (
        <button
          type="button"
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: '#b91c1c',
            fontSize: '0.65rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Quitar
        </button>
      )}
    </div>
  );
}

interface DesignTabProps {
  designConfig: EventDesignConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<EventDesignConfig>>;
  baseTheme: TemplateTheme;
  presets: ColorPreset[];
  sectionConfig?: EventSectionConfig;
  eventName?: string;
  eventId: string;
  selectedSectionId?: string | null;
}

export function DesignTab({
  designConfig,
  setDesignConfig,
  baseTheme,
  presets,
  sectionConfig,
  eventName,
  eventId,
  selectedSectionId,
}: DesignTabProps) {
  const currentColors = {
    primary: designConfig.colors?.primary || baseTheme.colors.primary,
    secondary: designConfig.colors?.secondary || baseTheme.colors.secondary,
    background: designConfig.colors?.background || baseTheme.colors.background,
    surface: designConfig.colors?.surface || baseTheme.colors.surface,
    text: designConfig.colors?.text || baseTheme.colors.text,
    accent: designConfig.colors?.accent || baseTheme.colors.accent,
  };

  const handleColorChange = (key: keyof typeof currentColors, value: string) => {
    setDesignConfig((prev) => ({
      ...prev,
      colors: {
        ...(prev.colors || {}),
        [key]: value,
      },
    }));
  };

  const applyPreset = (preset: ColorPreset) => {
    setDesignConfig((prev) => ({
      ...prev,
      colors: {
        ...(prev.colors || {}),
        ...preset.colors,
      },
    }));
  };

  const resetToDefault = () => {
    setDesignConfig((prev) => ({
      ...prev,
      colors: undefined,
      typography: undefined,
      layout: undefined,
    }));
  };

  // Sub-pestañas organizadoras para no saturar la pantalla con demasiadas herramientas juntas
  const [designSubTab, setDesignSubTab] = useState<'cards' | 'layout' | 'colors' | 'typography'>('cards');

  // Estado para colapsar/minimizar las opciones de diseño de cada tarjeta
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Auto-expandir y hacer scroll suave al seleccionar una tarjeta desde el preview
  useEffect(() => {
    if (selectedSectionId) {
      setDesignSubTab('cards');
      setExpandedCards((prev) => ({ ...prev, [selectedSectionId]: true }));
      const timer = setTimeout(() => {
        const el = document.getElementById(`design-card-${selectedSectionId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedSectionId]);

  const expandAllCards = () => {
    const all: Record<string, boolean> = {};
    SECTIONS_LIST.forEach((s) => {
      all[s.id] = true;
    });
    setExpandedCards(all);
  };

  const collapseAllCards = () => {
    setExpandedCards({});
  };

  // Estado para el MediaPicker (sección, fluido, continuo, general o bandas laterales)
  const [activePicker, setActivePicker] = useState<{
    type: 'section' | 'fluid' | 'continuous' | 'general' | 'sidebars' | 'button' | 'mapsButton' | 'wazeButton' | 'confirmButton' | 'declineButton';
    sectionId?: string;
  } | null>(null);

  // Estado para subida de fuentes (.woff2, .woff, .ttf, .otf)
  const fontFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFont, setIsUploadingFont] = useState(false);
  const [fontUploadMessage, setFontUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manejador de subida de fuentes
  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFont(true);
    setFontUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('eventId', eventId);

      const result = await uploadEventFont(formData);

      if (!result.success || !result.fontUrl || !result.fontFamily) {
        setFontUploadMessage({ type: 'error', text: result.error || 'Error al subir la fuente.' });
        setIsUploadingFont(false);
        return;
      }

      const newFont = {
        name: result.fontFamily,
        url: result.fontUrl,
        format: result.format,
      };

      setDesignConfig((prev) => {
        const existing = prev.typography?.uploadedFonts || [];
        const filtered = existing.filter((f) => f.name !== newFont.name);
        return {
          ...prev,
          typography: {
            ...(prev.typography || {}),
            headingFont: prev.typography?.headingFont || newFont.name,
            uploadedFonts: [...filtered, newFont],
          },
        };
      });

      setFontUploadMessage({
        type: 'success',
        text: `¡Fuente "${result.fontFamily}" subida exitosamente!`,
      });

      if (fontFileInputRef.current) fontFileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el archivo de fuente.';
      setFontUploadMessage({ type: 'error', text: msg });
    } finally {
      setIsUploadingFont(false);
    }
  };

  // Cargar fuentes en el DOM del editor para visualización en tiempo real
  useEffect(() => {
    // 1. Inyectar fuentes subidas del usuario
    injectUploadedFontsInEditor(designConfig.typography?.uploadedFonts);

    // 2. Cargar fuentes globales (Google Fonts o URL custom)
    const headingFont = designConfig.typography?.headingFont || baseTheme.typography.headingFont;
    const bodyFont = designConfig.typography?.bodyFont || baseTheme.typography.bodyFont;
    if (headingFont) loadEditorFont(headingFont);
    if (bodyFont) loadEditorFont(bodyFont);
    if (designConfig.typography?.customFontUrl) {
      loadEditorFont(designConfig.typography.customFontUrl);
    }

    // 3. Cargar fuentes específicas de cada sección
    const sectionStyles = designConfig.layout?.sectionStyles || {};
    Object.values(sectionStyles).forEach((style) => {
      if (style.sectionFont) loadEditorFont(style.sectionFont);
      if (style.sectionFontUrl) loadEditorFont(style.sectionFontUrl);
      if (style.sectionBodyFont) loadEditorFont(style.sectionBodyFont);
      if (style.sectionBodyFontUrl) loadEditorFont(style.sectionBodyFontUrl);
    });
  }, [
    designConfig.typography?.headingFont,
    designConfig.typography?.bodyFont,
    designConfig.typography?.customFontUrl,
    designConfig.typography?.uploadedFonts,
    designConfig.layout?.sectionStyles,
    baseTheme.typography.headingFont,
    baseTheme.typography.bodyFont,
  ]);

  const uploadedFonts = designConfig.typography?.uploadedFonts || [];

  const renderFontSelectOptions = (includeInherit = false) => (
    <>
      {includeInherit && (
        <option value="">— Heredar fuente global —</option>
      )}
      {uploadedFonts.length > 0 && (
        <optgroup label="⭐ Mis Fuentes Subidas">
          {uploadedFonts.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name} (Subida)
            </option>
          ))}
        </optgroup>
      )}
      <optgroup label="✨ Caligráficas / Bodas">
        <option value="Great Vibes, cursive">Great Vibes – Elegante caligráfica</option>
        <option value="Alex Brush, cursive">Alex Brush – Caligráfica fluida</option>
        <option value="Pinyon Script, cursive">Pinyon Script – Manuscrita formal</option>
        <option value="Tangerine, cursive">Tangerine – Clásica inclinada</option>
        <option value="Dancing Script, cursive">Dancing Script – Movida y festiva</option>
        <option value="Parisienne, cursive">Parisienne – Parisina y refinada</option>
      </optgroup>
      <optgroup label="📖 Serif Elegantes">
        <option value="Cormorant Garamond, Georgia, serif">Cormorant Garamond – Editorial / Bodas</option>
        <option value="Playfair Display, Georgia, serif">Playfair Display – Elegante clásica</option>
        <option value="Cinzel, serif">Cinzel – Teatral / Majestuosa</option>
        <option value="EB Garamond, Georgia, serif">EB Garamond – Clásica académica</option>
        <option value="Libre Baskerville, Georgia, serif">Libre Baskerville – Publicación seria</option>
        <option value="DM Serif Display, Georgia, serif">DM Serif Display – Moderna y serif</option>
        <option value="Cardo, serif">Cardo – Humanista clásica</option>
      </optgroup>
      <optgroup label="🎨 Sans-serif Modernas">
        <option value="Montserrat, system-ui, sans-serif">Montserrat – Moderna geométrica</option>
        <option value="Raleway, system-ui, sans-serif">Raleway – Estilosa y delgada</option>
        <option value="Josefin Sans, system-ui, sans-serif">Josefin Sans – Geométrica vintage</option>
        <option value="Lato, sans-serif">Lato – Limpia y minimalista</option>
        <option value="Poppins, system-ui, sans-serif">Poppins – Amigable y moderna</option>
        <option value="Nunito, system-ui, sans-serif">Nunito – Redondeada y amigable</option>
        <option value="Open Sans, system-ui, sans-serif">Open Sans – Neutral legible</option>
      </optgroup>
      <optgroup label="🖋️ Decorativas y Temáticas">
        <option value="'Alice in Wonderland', cursive">Alice in Wonderland (Tema Bianca 15)</option>
        <option value="Italianno, cursive">Italianno – Italiana estilizada</option>
      </optgroup>
    </>
  );

  const SECTIONS_LIST = [
    { id: 'hero', label: '👑 Hero / Portada' },
    { id: 'welcome', label: 'Bienvenida' },
    { id: 'countdown', label: '⏳ Cuenta Regresiva' },
    { id: 'date', label: '📅 Fecha y Hora' },
    { id: 'location', label: '📍 Ubicación' },
    { id: 'schedule', label: '⏰ Cronograma' },
    { id: 'dress_code', label: '👔 Dress Code' },
    { id: 'gifts', label: '🎁 Regalos' },
    { id: 'photos', label: '📸 Fotos' },
    { id: 'confirmation', label: '✅ Confirmación' },
    { id: 'share', label: '🔗 Compartir' },
    { id: 'footer', label: '💌 Cierre' },
  ];

  const getSectionStyle = (sectionId: string) =>
    designConfig.layout?.sectionStyles?.[sectionId] || {};

  const updateSectionStyle = (sectionId: string, patch: Record<string, unknown>) => {
    setDesignConfig((prev) => ({
      ...prev,
      layout: {
        ...(prev.layout || {}),
        sectionStyles: {
          ...(prev.layout?.sectionStyles || {}),
          [sectionId]: {
            ...(prev.layout?.sectionStyles?.[sectionId] || {}),
            ...patch,
          },
        },
      },
    }));
  };

  const clearSectionStyle = (sectionId: string) => {
    setDesignConfig((prev) => {
      const styles = { ...(prev.layout?.sectionStyles || {}) };
      delete styles[sectionId];
      return {
        ...prev,
        layout: {
          ...(prev.layout || {}),
          sectionStyles: styles,
        },
      };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Selector de sub-categorías de diseño para mantener la vista limpia y cómoda en móvil y desktop */}
      <div
        className="scrollbar-hidden"
        style={{
          display: 'flex',
          gap: '0.3rem',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: '0.65rem',
          border: '1px solid #e2e8f0',
          overflowX: 'auto',
          position: 'relative',
          zIndex: 5,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {[
          { id: 'cards', label: '🖼️ Tarjetas', desc: 'Fondos, textos y separación' },
          { id: 'layout', label: '📐 Estructura & Gap', desc: 'Modo, distancias y visor' },
          { id: 'colors', label: '🎨 Colores', desc: 'Temas y tonos globales' },
          { id: 'typography', label: '🔤 Tipografías', desc: 'Fuentes globales y Google Fonts' },
        ].map((tab) => {
          const isActive = designSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDesignSubTab(tab.id as typeof designSubTab)}
              style={{
                flex: '1 0 auto',
                padding: '0.45rem 0.65rem',
                borderRadius: '0.45rem',
                border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#7e22ce' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.75rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── PESTAÑA: COLORES & PALETAS ─── */}
      {designSubTab === 'colors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Presets de Color */}
          {presets && presets.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                🎨 Paletas Recomendadas
              </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.primary }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.secondary }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.background, border: '1px solid #e2e8f0' }} />
                  <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: preset.colors.accent }} />
                </div>
                <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                  {preset.name}
                </strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector Individual de Colores */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          Personalización Detallada de Colores
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Color Primario (Títulos y Acentos)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={currentColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.35rem', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Color Secundario (Decoración)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={currentColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.35rem', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Color de Fondo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={currentColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.35rem', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Color de Superficie / Tarjetas
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={currentColors.surface}
                onChange={(e) => handleColorChange('surface', e.target.value)}
                style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.35rem', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentColors.surface}
                onChange={(e) => handleColorChange('surface', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Color del Texto Principal
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={currentColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.35rem', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
              Color de Acento / Botones
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={currentColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                style={{ width: '40px', height: '36px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.35rem', cursor: 'pointer' }}
              />
              <input
                type="text"
                value={currentColors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        {/* Imagen de Fondo General (Opcional - Base para todo el evento) */}
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
              🖼️ Imagen de Fondo General (Opcional - Base para todo el evento)
            </label>
            <button
              type="button"
              onClick={() => setActivePicker({ type: 'general' })}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '0.35rem',
                border: '1px solid #9333ea',
                background: '#f3e8ff',
                color: '#7e22ce',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {designConfig.layout?.generalBackgroundUrl ? '🔄 Cambiar fondo' : '➕ Elegir de biblioteca'}
            </button>
          </div>

          {designConfig.layout?.generalBackgroundUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1', marginBottom: '0.4rem' }}>
              <img
                src={designConfig.layout.generalBackgroundUrl}
                alt="Fondo general"
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.3rem', border: '1px solid #94a3b8' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {designConfig.layout.generalBackgroundUrl}
              </span>
              <button
                type="button"
                onClick={() =>
                  setDesignConfig((prev) => ({
                    ...prev,
                    layout: { ...(prev.layout || {}), generalBackgroundUrl: undefined },
                  }))
                }
                style={{
                  padding: '0.2rem 0.45rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✕ Quitar
              </button>
            </div>
          )}

          <input
            type="url"
            placeholder="O ingresa una URL directa: https://ejemplo.com/fondo-base.webp"
            value={designConfig.layout?.generalBackgroundUrl || ''}
            onChange={(e) =>
              setDesignConfig((prev) => ({
                ...prev,
                layout: { ...(prev.layout || {}), generalBackgroundUrl: e.target.value },
              }))
            }
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              border: '1px solid #cbd5e1',
              borderRadius: '0.35rem',
              fontSize: '0.8rem',
              boxSizing: 'border-box',
            }}
          />

          {/* Selector de comportamiento del fondo (Fijo en pantalla / Desplazable) */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              📌 Fijación del fondo en pantalla
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() =>
                  setDesignConfig((prev) => ({
                    ...prev,
                    layout: { ...(prev.layout || {}), backgroundAttachment: 'fixed' },
                  }))
                }
                style={{
                  padding: '0.45rem 0.55rem',
                  borderRadius: '0.35rem',
                  border: (designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed'
                    ? '2px solid #9333ea'
                    : '1px solid #cbd5e1',
                  background: (designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed'
                    ? '#f3e8ff'
                    : '#ffffff',
                  color: (designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed'
                    ? '#7e22ce'
                    : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: (designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                }}
              >
                <span>📌 Fijo (Wallpaper)</span>
                <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 400 }}>
                  Cubre la pantalla de punta a punta y no se mueve con el scroll
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDesignConfig((prev) => ({
                    ...prev,
                    layout: { ...(prev.layout || {}), backgroundAttachment: 'scroll' },
                  }))
                }
                style={{
                  padding: '0.45rem 0.55rem',
                  borderRadius: '0.35rem',
                  border: designConfig.layout?.backgroundAttachment === 'scroll'
                    ? '2px solid #9333ea'
                    : '1px solid #cbd5e1',
                  background: designConfig.layout?.backgroundAttachment === 'scroll'
                    ? '#f3e8ff'
                    : '#ffffff',
                  color: designConfig.layout?.backgroundAttachment === 'scroll'
                    ? '#7e22ce'
                    : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: designConfig.layout?.backgroundAttachment === 'scroll' ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                }}
              >
                <span>📜 Desplazable</span>
                <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 400 }}>
                  Acompaña el avance del scroll a lo largo de la página
                </span>
              </button>
            </div>
          </div>
        </div>
        </div>
        </div>
      )}

      {/* ─── PESTAÑA: TIPOGRAFÍA GLOBAL ─── */}
      {designSubTab === 'typography' && (
        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#6b21a8' }}>
              🔤 Tipografía Global
            </label>

          {/* Botón rápido para subir fuente */}
          <button
            type="button"
            onClick={() => fontFileInputRef.current?.click()}
            disabled={isUploadingFont}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.4rem',
              border: '1px solid #c084fc',
              background: '#ffffff',
              color: '#7e22ce',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: isUploadingFont ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(126, 34, 206, 0.1)',
            }}
          >
            {isUploadingFont ? '⏳ Subiendo...' : '📤 Subir archivo de fuente (.ttf, .otf, .woff)'}
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#7e22ce', margin: '0 0 1rem 0' }}>
          Elegí fuentes para títulos y cuerpo, subí tus propios archivos de tipografía o conectá una URL de Google Fonts.
        </p>

        {/* Input file oculto para subir fuentes */}
        <input
          ref={fontFileInputRef}
          type="file"
          accept=".woff2,.woff,.ttf,.otf,font/*,application/font-woff,application/x-font-ttf"
          onChange={handleFontUpload}
          style={{ display: 'none' }}
        />

        {/* Mensaje de feedback de subida */}
        {fontUploadMessage && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: fontUploadMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${fontUploadMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: fontUploadMessage.type === 'success' ? '#15803d' : '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{fontUploadMessage.text}</span>
            <button
              type="button"
              onClick={() => setFontUploadMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Lista de fuentes subidas por el usuario */}
        {uploadedFonts.length > 0 && (
          <div style={{ marginBottom: '1rem', padding: '0.65rem 0.75rem', background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#86198f', display: 'block', marginBottom: '0.4rem' }}>
              ⭐ Tus Fuentes Subidas ({uploadedFonts.length}):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {uploadedFonts.map((f) => (
                <div
                  key={f.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.35rem 0.6rem',
                    background: '#ffffff',
                    borderRadius: '0.35rem',
                    border: '1px solid #e879f9',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontFamily: f.name, fontSize: '1.05rem', color: '#1e293b' }}>
                      {f.name}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#a21caf', background: '#fae8ff', padding: '1px 6px', borderRadius: '99px' }}>
                      {f.format || 'fuente'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <button
                      type="button"
                      title="Usar como fuente de Títulos"
                      onClick={() =>
                        setDesignConfig((prev) => ({
                          ...prev,
                          typography: { ...(prev.typography || {}), headingFont: f.name },
                        }))
                      }
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #d8b4fe',
                        background: '#faf5ff',
                        color: '#7e22ce',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      En Títulos
                    </button>
                    <button
                      type="button"
                      title="Usar como fuente de Texto"
                      onClick={() =>
                        setDesignConfig((prev) => ({
                          ...prev,
                          typography: { ...(prev.typography || {}), bodyFont: f.name },
                        }))
                      }
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #d8b4fe',
                        background: '#faf5ff',
                        color: '#7e22ce',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      En Texto
                    </button>
                    <button
                      type="button"
                      title="Quitar de fuentes subidas"
                      onClick={() => {
                        setDesignConfig((prev) => ({
                          ...prev,
                          typography: {
                            ...(prev.typography || {}),
                            uploadedFonts: (prev.typography?.uploadedFonts || []).filter((item) => item.name !== f.name),
                          },
                        }));
                      }}
                      style={{
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #fca5a5',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fuente de Títulos */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
            Fuente de Títulos (Headings)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <select
              value={designConfig.typography?.headingFont || baseTheme.typography.headingFont}
              onChange={(e) =>
                setDesignConfig((prev) => ({
                  ...prev,
                  typography: {
                    ...(prev.typography || {}),
                    headingFont: e.target.value,
                  },
                }))
              }
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d8b4fe', fontSize: '0.88rem', background: '#fff' }}
            >
              {renderFontSelectOptions(false)}
            </select>
            {/* Preview de la fuente seleccionada */}
            <div style={{
              padding: '0.6rem 0.85rem',
              background: '#ffffff',
              border: '1px solid #e9d5ff',
              borderRadius: '0.4rem',
              fontSize: '1.3rem',
              fontFamily: designConfig.typography?.headingFont || baseTheme.typography.headingFont,
              color: '#1e293b',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}>
              Bianca cumple 15 años ✨
            </div>
          </div>
        </div>

        {/* Fuente de Cuerpo */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
            Fuente del Cuerpo de Texto (Body)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <select
              value={designConfig.typography?.bodyFont || baseTheme.typography.bodyFont}
              onChange={(e) =>
                setDesignConfig((prev) => ({
                  ...prev,
                  typography: {
                    ...(prev.typography || {}),
                    bodyFont: e.target.value,
                  },
                }))
              }
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d8b4fe', fontSize: '0.88rem', background: '#fff' }}
            >
              {renderFontSelectOptions(false)}
            </select>
            <div style={{
              padding: '0.5rem 0.85rem',
              background: '#ffffff',
              border: '1px solid #e9d5ff',
              borderRadius: '0.4rem',
              fontSize: '0.9rem',
              fontFamily: designConfig.typography?.bodyFont || baseTheme.typography.bodyFont,
              color: '#475569',
              lineHeight: '1.5',
            }}>
              Nos alegra invitarte a celebrar este momento especial junto a nuestra familia.
            </div>
          </div>
        </div>

        {/* URL de Fuente Personalizada */}
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e9d5ff' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.3rem' }}>
            🌐 Fuente Personalizada via URL (opcional)
          </label>
          <p style={{ fontSize: '0.75rem', color: '#7e22ce', margin: '0 0 0.5rem 0' }}>
            Pegá una URL de Google Fonts u otro CSS de fuente. Luego escribí el nombre de la familia en el campo del selector de arriba.
          </p>
          <input
            type="url"
            placeholder="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
            value={designConfig.typography?.customFontUrl || ''}
            onChange={(e) =>
              setDesignConfig((prev) => ({
                ...prev,
                typography: {
                  ...(prev.typography || {}),
                  customFontUrl: e.target.value || undefined,
                },
              }))
            }
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              border: '1px solid #d8b4fe',
              borderRadius: '0.4rem',
              fontSize: '0.82rem',
              boxSizing: 'border-box',
              background: '#ffffff',
            }}
          />
          {designConfig.typography?.customFontUrl && (
            <div style={{ marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#7e22ce' }}>
                ✓ URL configurada. Cargará al abrir la invitación.
              </span>
              <button
                type="button"
                onClick={() =>
                  setDesignConfig((prev) => ({
                    ...prev,
                    typography: { ...(prev.typography || {}), customFontUrl: undefined },
                  }))
                }
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.35rem',
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✕ Quitar
              </button>
            </div>
          )}
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', marginBottom: 0 }}>
            Ejemplo: <code style={{ background: '#ede9fe', padding: '1px 4px', borderRadius: '3px', fontSize: '0.7rem' }}>https://fonts.googleapis.com/css2?family=Parisienne&display=swap</code>
          </p>
        </div>
      </div>
      )}

      {/* ─── PESTAÑA: ESTRUCTURA Y LAYOUT ─── */}
      {designSubTab === 'layout' && (
        <>
      {/* ─── PRIMERA OPCIÓN: BANDAS LATERALES EN MODO DESKTOP ─── */}
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
              🎛️ Bandas Laterales en Modo Desktop (Primera Opción)
            </label>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Al ver la invitación en computadora, genera bandas a los lados que delimitan el visor móvil para que solo se vea lo que se vería en un celular.
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', background: '#ffffff', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
            <input
              type="checkbox"
              checked={designConfig.layout?.desktopSidebars?.enabled ?? true}
              onChange={(e) =>
                setDesignConfig((prev) => ({
                  ...prev,
                  layout: {
                    ...(prev.layout || {}),
                    desktopSidebars: {
                      ...(prev.layout?.desktopSidebars || {}),
                      enabled: e.target.checked,
                    },
                  },
                }))
              }
              style={{ width: '16px', height: '16px', accentColor: '#9333ea', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: (designConfig.layout?.desktopSidebars?.enabled ?? true) ? '#166534' : '#64748b' }}>
              {(designConfig.layout?.desktopSidebars?.enabled ?? true) ? '✓ Bandas activas' : 'Desactivadas'}
            </span>
          </label>
        </div>

        {(designConfig.layout?.desktopSidebars?.enabled ?? true) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>

            {/* Selector de Estilo de Bandas */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Estilo de las bandas laterales:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                {[
                  { id: 'black', label: '⬛ Bandas Negras', desc: 'Color sólido oscuro' },
                  { id: 'blur', label: '🪟 Vidrio Esmerilado', desc: 'Desenfoque blur' },
                  { id: 'transparent', label: '🫧 100% Transparente', desc: 'Sin cubrir los lados' },
                  { id: 'image', label: '🖼️ Imagen de Fondo', desc: 'Fondo personalizado' },
                ].map((st) => {
                  const currentStyle = designConfig.layout?.desktopSidebars?.style || 'black';
                  const isSelected = currentStyle === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setDesignConfig((prev) => ({
                          ...prev,
                          layout: {
                            ...(prev.layout || {}),
                            desktopSidebars: {
                              ...(prev.layout?.desktopSidebars || {}),
                              style: st.id as any,
                            },
                          },
                        }))
                      }
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: isSelected ? '2px solid #9333ea' : '1px solid #cbd5e1',
                        background: isSelected ? '#f3e8ff' : '#ffffff',
                        color: isSelected ? '#7e22ce' : '#334155',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                      }}
                    >
                      <strong style={{ fontSize: '0.8rem' }}>{st.label}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{st.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Si es estilo NEGRO / COLOR SÓLIDO */}
            {(designConfig.layout?.desktopSidebars?.style || 'black') === 'black' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  Color de las bandas:
                </label>
                <input
                  type="color"
                  value={designConfig.layout?.desktopSidebars?.color || '#000000'}
                  onChange={(e) =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: {
                        ...(prev.layout || {}),
                        desktopSidebars: {
                          ...(prev.layout?.desktopSidebars || {}),
                          color: e.target.value,
                        },
                      },
                    }))
                  }
                  style={{ width: '36px', height: '32px', border: '1px solid #cbd5e1', borderRadius: '0.35rem', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={designConfig.layout?.desktopSidebars?.color || '#000000'}
                  onChange={(e) =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: {
                        ...(prev.layout || {}),
                        desktopSidebars: {
                          ...(prev.layout?.desktopSidebars || {}),
                          color: e.target.value,
                        },
                      },
                    }))
                  }
                  style={{ width: '90px', padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '0.35rem', fontSize: '0.8rem', fontFamily: 'monospace' }}
                />
              </div>
            )}

            {/* Si es estilo BLUR (Vidrio Esmerilado) */}
            {designConfig.layout?.desktopSidebars?.style === 'blur' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#ffffff', padding: '0.75rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      Intensidad del Desenfoque (Blur):
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7e22ce' }}>
                      {designConfig.layout?.desktopSidebars?.blurAmount ?? 16} px
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="range"
                      min="4"
                      max="40"
                      step="2"
                      value={designConfig.layout?.desktopSidebars?.blurAmount ?? 16}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setDesignConfig((prev) => ({
                          ...prev,
                          layout: {
                            ...(prev.layout || {}),
                            desktopSidebars: {
                              ...(prev.layout?.desktopSidebars || {}),
                              blurAmount: val,
                            },
                          },
                        }));
                      }}
                      style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      Opacidad del Tinte Esmerilado:
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7e22ce' }}>
                      {Math.round((designConfig.layout?.desktopSidebars?.opacity ?? 0.5) * 100)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="range"
                      min="0"
                      max="0.95"
                      step="0.05"
                      value={designConfig.layout?.desktopSidebars?.opacity ?? 0.5}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDesignConfig((prev) => ({
                          ...prev,
                          layout: {
                            ...(prev.layout || {}),
                            desktopSidebars: {
                              ...(prev.layout?.desktopSidebars || {}),
                              opacity: val,
                            },
                          },
                        }));
                      }}
                      style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Si es estilo IMAGEN DE FONDO */}
            {designConfig.layout?.desktopSidebars?.style === 'image' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#ffffff', padding: '0.75rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                    Imagen para las bandas:
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePicker({ type: 'sidebars' })}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '0.35rem',
                      border: '1px solid #9333ea',
                      background: '#f3e8ff',
                      color: '#7e22ce',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {designConfig.layout?.desktopSidebars?.backgroundImageUrl ? '🔄 Cambiar imagen' : '➕ Elegir de biblioteca'}
                  </button>
                </div>

                {designConfig.layout?.desktopSidebars?.backgroundImageUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '0.35rem', border: '1px solid #cbd5e1' }}>
                    <img
                      src={designConfig.layout.desktopSidebars.backgroundImageUrl}
                      alt="Fondo bandas"
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.3rem', border: '1px solid #94a3b8' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {designConfig.layout.desktopSidebars.backgroundImageUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDesignConfig((prev) => ({
                          ...prev,
                          layout: {
                            ...(prev.layout || {}),
                            desktopSidebars: {
                              ...(prev.layout?.desktopSidebars || {}),
                              backgroundImageUrl: undefined,
                            },
                          },
                        }))
                      }
                      style={{
                        padding: '0.2rem 0.45rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #fca5a5',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Quitar
                    </button>
                  </div>
                )}

                <input
                  type="url"
                  placeholder="https://ejemplo.com/textura-lateral.webp"
                  value={designConfig.layout?.desktopSidebars?.backgroundImageUrl || ''}
                  onChange={(e) =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: {
                        ...(prev.layout || {}),
                        desktopSidebars: {
                          ...(prev.layout?.desktopSidebars || {}),
                          backgroundImageUrl: e.target.value || undefined,
                        },
                      },
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.35rem',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Ajuste del ancho del visor móvil central */}
            <div style={{ background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  Ancho del visor central (área móvil visible):
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7e22ce' }}>
                  {designConfig.layout?.desktopSidebars?.centralWidth ?? 480} px
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="range"
                  min="380"
                  max="650"
                  step="10"
                  value={designConfig.layout?.desktopSidebars?.centralWidth ?? 480}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: {
                        ...(prev.layout || {}),
                        desktopSidebars: {
                          ...(prev.layout?.desktopSidebars || {}),
                          centralWidth: val,
                        },
                      },
                    }));
                  }}
                  style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { label: '390px (iPhone estándar)', val: 390 },
                  { label: '450px (Móvil cómodo)', val: 450 },
                  { label: '480px (Recomendado)', val: 480 },
                  { label: '540px (Más ancho)', val: 540 },
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() =>
                      setDesignConfig((prev) => ({
                        ...prev,
                        layout: {
                          ...(prev.layout || {}),
                          desktopSidebars: {
                            ...(prev.layout?.desktopSidebars || {}),
                            centralWidth: b.val,
                          },
                        },
                      }))
                    }
                    style={{
                      padding: '0.18rem 0.45rem',
                      borderRadius: '0.25rem',
                      border: '1px solid',
                      borderColor: (designConfig.layout?.desktopSidebars?.centralWidth ?? 480) === b.val ? '#9333ea' : '#cbd5e1',
                      background: (designConfig.layout?.desktopSidebars?.centralWidth ?? 480) === b.val ? '#f3e8ff' : '#ffffff',
                      color: (designConfig.layout?.desktopSidebars?.centralWidth ?? 480) === b.val ? '#7e22ce' : '#475569',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Estructura y Dimensiones de Secciones (Layout) */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            📐 Estructura y Dimensiones de Secciones
          </label>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
            Elegí si las secciones fluyen según su contenido o si tienen una altura fija bloqueada para coincidir con un fondo ilustrado.
          </p>
        </div>

        {/* Selector de Modo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() =>
              setDesignConfig((prev) => ({
                ...prev,
                layout: { ...(prev.layout || {}), mode: 'fluid' },
              }))
            }
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '2px solid',
              borderColor: (designConfig.layout?.mode || 'fluid') === 'fluid' ? '#9333ea' : '#e2e8f0',
              background: (designConfig.layout?.mode || 'fluid') === 'fluid' ? '#faf5ff' : '#ffffff',
              color: (designConfig.layout?.mode || 'fluid') === 'fluid' ? '#7e22ce' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'block', marginBottom: '0.25rem' }}>🌊 Modo Fluido</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b', display: 'block' }}>
              Alto automático según texto y contenido (estándar).
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setDesignConfig((prev) => ({
                ...prev,
                layout: {
                  ...(prev.layout || {}),
                  mode: 'fixed',
                  sectionHeight: prev.layout?.sectionHeight || 700,
                  sectionGap: prev.layout?.sectionGap !== undefined ? prev.layout.sectionGap : 0,
                  contentAlignment: prev.layout?.contentAlignment || 'center',
                },
              }))
            }
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: '2px solid',
              borderColor: designConfig.layout?.mode === 'fixed' ? '#9333ea' : '#e2e8f0',
              background: designConfig.layout?.mode === 'fixed' ? '#faf5ff' : '#ffffff',
              color: designConfig.layout?.mode === 'fixed' ? '#7e22ce' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'block', marginBottom: '0.25rem' }}>🔒 Alto Fijo (Fondo Continuo)</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b', display: 'block' }}>
              Secciones con alto bloqueado. Solo adapta el ancho.
            </span>
          </button>
        </div>

        {/* Configuración de Modo Fluido */}
        {(designConfig.layout?.mode || 'fluid') === 'fluid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  🖼️ Fondo para Modo Fluido (Independiente)
                </label>
                <button
                  type="button"
                  onClick={() => setActivePicker({ type: 'fluid' })}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #9333ea',
                    background: '#f3e8ff',
                    color: '#7e22ce',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {designConfig.layout?.fluidBackgroundUrl ? '🔄 Cambiar fondo' : '➕ Elegir de biblioteca'}
                </button>
              </div>

              {designConfig.layout?.fluidBackgroundUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}>
                  <img
                    src={designConfig.layout.fluidBackgroundUrl}
                    alt="Fondo fluido"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.35rem', border: '1px solid #94a3b8' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {designConfig.layout.fluidBackgroundUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDesignConfig((prev) => ({
                        ...prev,
                        layout: { ...(prev.layout || {}), fluidBackgroundUrl: undefined },
                      }))
                    }
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Quitar
                  </button>
                </div>
              )}

              <input
                type="url"
                placeholder="O ingresa una URL: https://ejemplo.com/fondo-fluido.webp"
                value={designConfig.layout?.fluidBackgroundUrl || ''}
                onChange={(e) =>
                  setDesignConfig((prev) => ({
                    ...prev,
                    layout: { ...(prev.layout || {}), fluidBackgroundUrl: e.target.value },
                  }))
                }
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.4rem',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Este fondo solo se visualiza cuando la invitación está en Modo Fluido (independiente del fondo general y de las tarjetas).
              </span>
            </div>
          </div>
        )}

        {/* Configuración detallada de Alto Fijo */}
        {designConfig.layout?.mode === 'fixed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            {/* Altura de Secciones */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Altura fija de cada sección:
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7e22ce' }}>
                  {designConfig.layout.sectionHeight || 700} px
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min={400}
                  max={1200}
                  step={10}
                  value={designConfig.layout.sectionHeight || 700}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: { ...(prev.layout || {}), sectionHeight: val },
                    }));
                  }}
                  style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer' }}
                />
                <input
                  type="number"
                  min={300}
                  max={2000}
                  value={designConfig.layout.sectionHeight || 700}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 700;
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: { ...(prev.layout || {}), sectionHeight: val },
                    }));
                  }}
                  style={{ width: '80px', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.35rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

        {/* Separación vertical global entre secciones (disponible en ambos modos) */}
        <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              ↕️ Separación vertical entre secciones (Global):
            </label>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7e22ce' }}>
              {designConfig.layout?.sectionGap !== undefined ? designConfig.layout.sectionGap : 0} px
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
            Define la distancia vertical entre todas las tarjetas (también podés ajustar distancias individuales dentro de cada tarjeta).
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="range"
              min={0}
              max={250}
              step={2}
              value={designConfig.layout?.sectionGap !== undefined ? designConfig.layout.sectionGap : 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDesignConfig((prev) => ({
                  ...prev,
                  layout: { ...(prev.layout || {}), sectionGap: val },
                }));
              }}
              style={{ flex: 1, minWidth: '160px', accentColor: '#9333ea', cursor: 'pointer' }}
            />
            <input
              type="number"
              min={0}
              max={400}
              value={designConfig.layout?.sectionGap !== undefined ? designConfig.layout.sectionGap : 0}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 0;
                setDesignConfig((prev) => ({
                  ...prev,
                  layout: { ...(prev.layout || {}), sectionGap: val },
                }));
              }}
              style={{ width: '70px', padding: '0.35rem', border: '1px solid #cbd5e1', borderRadius: '0.35rem', fontSize: '0.85rem', textAlign: 'right' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>px</span>
            <div style={{ display: 'flex', gap: '0.25rem', width: '100%', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              {[
                { label: '0px (Pegadas)', val: 0 },
                { label: '12px', val: 12 },
                { label: '24px', val: 24 },
                { label: '40px', val: 40 },
                { label: '64px', val: 64 },
                { label: '100px', val: 100 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: { ...(prev.layout || {}), sectionGap: p.val },
                    }))
                  }
                  style={{
                    padding: '0.15rem 0.45rem',
                    borderRadius: '0.25rem',
                    border: '1px solid',
                    borderColor: (designConfig.layout?.sectionGap ?? 0) === p.val ? '#9333ea' : '#cbd5e1',
                    background: (designConfig.layout?.sectionGap ?? 0) === p.val ? '#9333ea' : '#f8fafc',
                    color: (designConfig.layout?.sectionGap ?? 0) === p.val ? '#ffffff' : '#334155',
                    fontSize: '0.68rem',
                    fontWeight: (designConfig.layout?.sectionGap ?? 0) === p.val ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

            {/* URL del Fondo Continuo */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  🖼️ Imagen de Fondo Continuo (Modo Fijo)
                </label>
                <button
                  type="button"
                  onClick={() => setActivePicker({ type: 'continuous' })}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '0.35rem',
                    border: '1px solid #9333ea',
                    background: '#f3e8ff',
                    color: '#7e22ce',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {designConfig.layout?.continuousBackgroundUrl ? '🔄 Cambiar fondo' : '➕ Elegir de biblioteca'}
                </button>
              </div>

              {designConfig.layout?.continuousBackgroundUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }}>
                  <img
                    src={designConfig.layout.continuousBackgroundUrl}
                    alt="Fondo continuo"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '0.35rem', border: '1px solid #94a3b8' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {designConfig.layout.continuousBackgroundUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setDesignConfig((prev) => ({
                        ...prev,
                        layout: { ...(prev.layout || {}), continuousBackgroundUrl: undefined },
                      }))
                    }
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✕ Quitar
                  </button>
                </div>
              )}

              <input
                type="url"
                placeholder="https://ejemplo.com/fondo-continuo-invitacion.webp"
                value={designConfig.layout.continuousBackgroundUrl || ''}
                onChange={(e) =>
                  setDesignConfig((prev) => ({
                    ...prev,
                    layout: { ...(prev.layout || {}), continuousBackgroundUrl: e.target.value },
                  }))
                }
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.4rem',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Esta imagen se colocará de fondo en todo el scroll alineada con la altura fija de cada sección.
              </span>

              {/* Fijación del fondo en Modo Fijo */}
              <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block' }}>
                    Fondo fijo en altura (Wallpaper)
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {(designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed'
                      ? 'El fondo cubre la pantalla de punta a punta y queda fijo'
                      : 'El fondo se desplaza junto con las secciones'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: {
                        ...(prev.layout || {}),
                        backgroundAttachment: (prev.layout?.backgroundAttachment ?? 'fixed') === 'fixed' ? 'scroll' : 'fixed',
                      },
                    }))
                  }
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '0.35rem',
                    border: (designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed'
                      ? '1px solid #9333ea'
                      : '1px solid #cbd5e1',
                    background: (designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed'
                      ? '#f3e8ff'
                      : '#ffffff',
                    color: (designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed'
                      ? '#7e22ce'
                      : '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {(designConfig.layout?.backgroundAttachment ?? 'fixed') === 'fixed' ? '✓ Activo (Fijo)' : 'Desplazable'}
                </button>
              </div>
            </div>

            {/* Opciones adicionales: Alineación y Transparencia */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Alineación vertical interna
                </label>
                <select
                  value={designConfig.layout.contentAlignment || 'center'}
                  onChange={(e) =>
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: {
                        ...(prev.layout || {}),
                        contentAlignment: e.target.value as 'center' | 'top',
                      },
                    }))
                  }
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff' }}
                >
                  <option value="center">Centrado vertical</option>
                  <option value="top">Alineado arriba</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginTop: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={designConfig.layout.transparentSections === true}
                    onChange={(e) =>
                      setDesignConfig((prev) => ({
                        ...prev,
                        layout: {
                          ...(prev.layout || {}),
                          transparentSections: e.target.checked,
                        },
                      }))
                    }
                    style={{ width: '16px', height: '16px', accentColor: '#9333ea' }}
                  />
                  <span>Tarjetas translúcidas (fondo visible)</span>
                </label>
              </div>
            </div>

            {/* Exportar Plantilla */}
            {sectionConfig && (
              <ExportTemplateButton
                designConfig={designConfig}
                sectionConfig={sectionConfig}
                eventName={eventName}
              />
            )}

            {/* Alturas individuales por sección */}
            <div style={{ marginTop: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                📏 Alturas individuales por sección
              </label>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                Las alturas de <strong>Desktop</strong> y <strong>Móvil</strong> son independientes. Ajustá ambas para que cada vista se vea perfecta.
              </p>

              {/* Altura global de móvil */}
              <div style={{ marginBottom: '0.85rem', padding: '0.6rem 0.75rem', background: '#faf5ff', borderRadius: '0.4rem', border: '1px solid #d8b4fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8', display: 'block' }}>
                    📱 Alto global en Móvil (Fallback)
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#7e22ce' }}>
                    Si no definís el alto móvil de cada sección, se usa este valor. Por defecto hereda el alto Desktop.
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    type="number"
                    min={200}
                    max={1400}
                    placeholder={(designConfig.layout?.sectionHeight || 700).toString()}
                    value={designConfig.layout?.sectionHeightMobile ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      setDesignConfig((prev) => ({
                        ...prev,
                        layout: { ...(prev.layout || {}), sectionHeightMobile: val },
                      }));
                    }}
                    style={{ width: '72px', padding: '0.35rem 0.5rem', border: '1px solid #d8b4fe', borderRadius: '0.3rem', fontSize: '0.82rem', textAlign: 'right', background: designConfig.layout?.sectionHeightMobile ? '#faf5ff' : '#fff' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#7e22ce', fontWeight: 600 }}>px</span>
                  {designConfig.layout?.sectionHeightMobile && (
                    <button
                      type="button"
                      onClick={() => setDesignConfig((prev) => ({ ...prev, layout: { ...(prev.layout || {}), sectionHeightMobile: undefined } }))}
                      style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.68rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      (auto)
                    </button>
                  )}
                </div>
              </div>

              {/* Contenedor scrolleable para evitar desbordes en móviles */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.25rem' }}>
                <div style={{ minWidth: '340px' }}>
                  {/* Cabecera de columnas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: '0.35rem', alignItems: 'center', padding: '0.25rem 0.6rem', background: '#f1f5f9', borderRadius: '0.3rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Sección</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textAlign: 'center' }}>🖥️ Desktop</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7e22ce', textAlign: 'center' }}>📱 Móvil</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {[
                      { id: 'hero', label: '👑 Hero / Portada' },
                      { id: 'welcome', label: '✨ Bienvenida' },
                      { id: 'countdown', label: '⏳ Cuenta Regresiva' },
                      { id: 'date', label: '📅 Fecha y Hora' },
                      { id: 'location', label: '📍 Ubicación' },
                      { id: 'schedule', label: '⏰ Cronograma' },
                      { id: 'dress_code', label: '👔 Dress Code' },
                      { id: 'gifts', label: '🎁 Regalos' },
                      { id: 'photos', label: '📸 Fotos' },
                      { id: 'confirmation', label: '✅ Confirmación' },
                      { id: 'share', label: '🔗 Compartir' },
                      { id: 'footer', label: '💌 Cierre' },
                    ].map((sec) => {
                      const customH = designConfig.layout?.sectionHeights?.[sec.id];
                      const displayH = customH || designConfig.layout?.sectionHeight || 700;
                      const customHMobile = designConfig.layout?.sectionHeightsMobile?.[sec.id];
                      const hasCustomMobile = customHMobile !== undefined;
                      return (
                        <div
                          key={sec.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 100px 100px',
                            gap: '0.35rem',
                            alignItems: 'center',
                            padding: '0.35rem 0.5rem',
                            background: (customH || hasCustomMobile) ? '#faf5ff' : '#f8fafc',
                            border: '1px solid',
                            borderColor: (customH || hasCustomMobile) ? '#d8b4fe' : '#e2e8f0',
                            borderRadius: '0.35rem',
                          }}
                        >
                          <span style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sec.label}
                          </span>

                          {/* Control Desktop */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
                            <input
                              type="number"
                              min={250}
                              max={2500}
                              value={displayH}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  layout: {
                                    ...(prev.layout || {}),
                                    sectionHeights: {
                                      ...(prev.layout?.sectionHeights || {}),
                                      [sec.id]: val,
                                    },
                                  },
                                }));
                              }}
                              style={{
                                width: '56px',
                                padding: '0.2rem 0.3rem',
                                border: `1px solid ${customH ? '#2563eb' : '#cbd5e1'}`,
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                textAlign: 'right',
                                background: customH ? '#eff6ff' : '#fff',
                                color: customH ? '#1d4ed8' : '#334155',
                                fontWeight: customH ? 700 : 400,
                              }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>px</span>
                          </div>

                          {/* Control Móvil */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
                            <input
                              type="number"
                              min={200}
                              max={1400}
                              placeholder={displayH.toString()}
                              value={customHMobile ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                                setDesignConfig((prev) => ({
                                  ...prev,
                                  layout: {
                                    ...(prev.layout || {}),
                                    sectionHeightsMobile: {
                                      ...(prev.layout?.sectionHeightsMobile || {}),
                                      [sec.id]: val as number,
                                    },
                                  },
                                }));
                              }}
                              onBlur={(e) => {
                                // Si se borró el campo, eliminar la key para no guardar undefined
                                if (e.target.value === '') {
                                  setDesignConfig((prev) => {
                                    const updated = { ...(prev.layout?.sectionHeightsMobile || {}) };
                                    delete updated[sec.id];
                                    return { ...prev, layout: { ...(prev.layout || {}), sectionHeightsMobile: updated } };
                                  });
                                }
                              }}
                              style={{
                                width: '56px',
                                padding: '0.2rem 0.3rem',
                                border: `1px solid ${hasCustomMobile ? '#9333ea' : '#d8b4fe'}`,
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                textAlign: 'right',
                                background: hasCustomMobile ? '#faf5ff' : '#fff',
                                color: hasCustomMobile ? '#7e22ce' : '#94a3b8',
                                fontWeight: hasCustomMobile ? 700 : 400,
                              }}
                            />
                            <span style={{ fontSize: '0.65rem', color: '#7e22ce' }}>px</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.5rem 0 0 0' }}>
                💡 Los campos de Móvil vacíos heredan el fallback global o el alto Desktop de cada sección.
              </p>
            </div>

          </div>
        )}
      </div>
      </>
      )}

      {/* ─── PESTAÑA: ESTILOS INDIVIDUALES POR SECCIÓN (TARJETAS) ─── */}
      {designSubTab === 'cards' && (
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#14532d', marginBottom: '0.15rem' }}>
              🖼️ Fondos, Fuentes y Estilos Individuales por Sección
            </label>
            <p style={{ fontSize: '0.8rem', color: '#166534', margin: 0 }}>
              Personalizá cada tarjeta de forma independiente. Podés minimizar las opciones para trabajar más cómodo.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={collapseAllCards}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '0.35rem',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ▲ Minimizar todas
            </button>
            <button
              type="button"
              onClick={expandAllCards}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '0.35rem',
                border: '1px solid #86efac',
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ▼ Desplegar todas
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {(() => {
            // Respetar el orden configurado en el panel de secciones
            const orderList = sectionConfig?.order || [];
            const sorted = [...SECTIONS_LIST].sort((a, b) => {
              const idxA = orderList.indexOf(a.id);
              const idxB = orderList.indexOf(b.id);
              if (idxA !== -1 && idxB !== -1) return idxA - idxB;
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
              return 0;
            });
            return sorted;
          })().map((sec) => {
            const style = getSectionStyle(sec.id);
            const hasBg = !!style.backgroundImage;
            const isCardExpanded = Boolean(expandedCards[sec.id]);
            const hasFont = !!(
              style.sectionFont ||
              style.sectionBodyFont ||
              style.sectionFontUrl ||
              style.sectionBodyFontUrl ||
              style.titleFontSize !== undefined ||
              style.bodyFontSize !== undefined ||
              style.verticalGap !== undefined ||
              style.wordSpacing !== undefined ||
              style.horizontalPadding !== undefined ||
              style.countdownNoBoxes ||
              style.countdownNumberSize !== undefined ||
              style.countdownNumberColor ||
              style.titleColor ||
              style.textColor ||
              style.nameFontSize !== undefined ||
              style.nameColor ||
              style.titleOffsetY !== undefined ||
              style.contentOffsetX !== undefined ||
              style.contentOffsetY !== undefined ||
              style.hideText ||
              style.buttonBackgroundImage ||
              style.mapsButtonBackgroundImage ||
              style.wazeButtonBackgroundImage ||
              style.confirmButtonBackgroundImage ||
              style.declineButtonBackgroundImage ||
              style.showMapsButton !== undefined ||
              style.showWazeButton !== undefined ||
              style.mapsButtonBg ||
              style.wazeButtonBg
            );
            const hasAnyStyle = hasBg || style.noBackground || style.noBorder || hasFont || style.hideText || style.buttonBackgroundImage;
            return (
              <div
                key={sec.id}
                id={`design-card-${sec.id}`}
                style={{
                  background: hasAnyStyle ? '#ffffff' : '#f8fafc',
                  border: `1px solid ${hasAnyStyle ? '#86efac' : '#e2e8f0'}`,
                  borderRadius: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  scrollMarginTop: '80px',
                }}
              >
                {/* Fila superior: label + badges */}
                <div
                  onClick={() => toggleCard(sec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    flexWrap: 'wrap',
                    marginBottom: '0.5rem',
                    width: '100%',
                  }}
                  title={isCardExpanded ? 'Clic para minimizar' : 'Clic para desplegar opciones'}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                    {sec.label}
                  </span>
                  {hasBg && (
                    <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      🖼️ Con fondo
                    </span>
                  )}
                  {style.noBackground && (
                    <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Sin fondo
                    </span>
                  )}
                  {style.noBorder && (
                    <span style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Sin borde
                    </span>
                  )}
                  {style.hideText && (
                    <span style={{ fontSize: '0.65rem', background: '#ffe4e6', color: '#9f1239', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      Sin texto
                    </span>
                  )}
                  {hasFont && (
                    <span style={{ fontSize: '0.65rem', background: '#f3e8ff', color: '#7e22ce', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                      🔤 Personalizada
                    </span>
                  )}
                </div>

                {/* Fila inferior de acciones: botones de desplegar, fondo y reset */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.4rem', flexWrap: 'wrap', width: '100%' }}>
                  {/* Botón desplegar / minimizar opciones */}
                  <button
                    type="button"
                    onClick={() => toggleCard(sec.id)}
                    title={isCardExpanded ? 'Minimizar opciones de esta tarjeta' : 'Desplegar opciones de esta tarjeta'}
                    style={{
                      padding: '0.28rem 0.65rem',
                      borderRadius: '0.35rem',
                      border: '1px solid',
                      borderColor: isCardExpanded ? '#bbf7d0' : '#cbd5e1',
                      background: isCardExpanded ? '#f0fdf4' : '#ffffff',
                      color: isCardExpanded ? '#15803d' : '#334155',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    {isCardExpanded ? '▲ Minimizar' : '▼ Opciones'}
                  </button>

                  {/* Botón imagen de fondo */}
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedCards((prev) => ({ ...prev, [sec.id]: true }));
                      setActivePicker({ type: 'section', sectionId: sec.id });
                    }}
                    title="Seleccionar imagen de fondo para esta tarjeta"
                    style={{
                      padding: '0.28rem 0.6rem',
                      borderRadius: '0.35rem',
                      border: '1px solid',
                      borderColor: hasBg ? '#16a34a' : '#cbd5e1',
                      background: hasBg ? '#dcfce7' : '#ffffff',
                      color: hasBg ? '#14532d' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {hasBg ? '🖼️ Fondo' : '🖼️ + Fondo'}
                  </button>

                  {/* Botón limpiar todo */}
                  {hasAnyStyle && (
                    <button
                      type="button"
                      onClick={() => clearSectionStyle(sec.id)}
                      title="Quitar todos los estilos de esta sección"
                      style={{
                        padding: '0.28rem 0.5rem',
                        borderRadius: '0.35rem',
                        border: '1px solid #fca5a5',
                        background: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {isCardExpanded && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {/* Toggles rápidos de tarjeta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', padding: '0.4rem 0.6rem', background: '#f8fafc', borderRadius: '0.35rem', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Ajustes rápidos:</span>
                      
                      {/* Preset Inteligente Modo Tarjeta Ilustrada */}
                      <button
                        type="button"
                        onClick={() => {
                          updateSectionStyle(sec.id, {
                            noBackground: true,
                            noBorder: true,
                            hideTitle: true,
                            hideSubtitle: true,
                          });
                        }}
                        title="Configura en 1 clic: Sin fondo, sin borde y oculta título y subtítulo (ideal si tu imagen ya tiene diseño)"
                        style={{
                          padding: '0.18rem 0.45rem',
                          borderRadius: '0.3rem',
                          border: '1px solid #c084fc',
                          background: '#faf5ff',
                          color: '#7e22ce',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        🪄 Modo Ilustrado (1 Clic)
                      </button>

                      <label
                        title="Desactivar/ocultar solo el título principal de esta tarjeta"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: style.hideTitle ? '#be123c' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <input
                          type="checkbox"
                          checked={style.hideTitle === true}
                          onChange={(e) => updateSectionStyle(sec.id, { hideTitle: e.target.checked || undefined })}
                          style={{ width: '14px', height: '14px', accentColor: '#e11d48', cursor: 'pointer' }}
                        />
                        🚫 Ocultar título
                      </label>
                      <label
                        title="Desactivar/ocultar solo el subtítulo o texto secundario de esta tarjeta"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: style.hideSubtitle ? '#be123c' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <input
                          type="checkbox"
                          checked={style.hideSubtitle === true}
                          onChange={(e) => updateSectionStyle(sec.id, { hideSubtitle: e.target.checked || undefined })}
                          style={{ width: '14px', height: '14px', accentColor: '#e11d48', cursor: 'pointer' }}
                        />
                        🚫 Ocultar subtítulo
                      </label>
                      <label
                        title="Quitar el color de fondo y la sombra de esta tarjeta"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: style.noBackground ? '#15803d' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <input
                          type="checkbox"
                          checked={style.noBackground === true}
                          onChange={(e) => updateSectionStyle(sec.id, { noBackground: e.target.checked || undefined })}
                          style={{ width: '14px', height: '14px', accentColor: '#16a34a', cursor: 'pointer' }}
                        />
                        Sin fondo ni sombra
                      </label>
                      <label
                        title="Quitar el borde de esta tarjeta"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: style.noBorder ? '#15803d' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <input
                          type="checkbox"
                          checked={style.noBorder === true}
                          onChange={(e) => updateSectionStyle(sec.id, { noBorder: e.target.checked || undefined })}
                          style={{ width: '14px', height: '14px', accentColor: '#16a34a', cursor: 'pointer' }}
                        />
                        Sin borde
                      </label>
                      <label
                        title="Oculta todo el contenido textual para usar una tarjeta puramente visual"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: style.hideText ? '#be123c' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <input
                          type="checkbox"
                          checked={style.hideText === true}
                          onChange={(e) => updateSectionStyle(sec.id, { hideText: e.target.checked || undefined })}
                          style={{ width: '14px', height: '14px', accentColor: '#e11d48', cursor: 'pointer' }}
                        />
                        Ocultar todo el texto
                      </label>
                      {sec.id === 'countdown' && (
                        <label
                          title="Ocultar los cuadros de fondo de los números en la cuenta regresiva"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: style.countdownNoBoxes ? '#7e22ce' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                        >
                          <input
                            type="checkbox"
                            checked={style.countdownNoBoxes === true}
                            onChange={(e) => updateSectionStyle('countdown', { countdownNoBoxes: e.target.checked || undefined })}
                            style={{ width: '14px', height: '14px', accentColor: '#9333ea', cursor: 'pointer' }}
                          />
                          ⏳ Quitar cuadros de números
                        </label>
                      )}
                    </div>

                    {/* Separación inferior (cardGap) individual para esta tarjeta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0.5rem 0.65rem', background: '#f8fafc', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          ↕️ Separación inferior con la siguiente tarjeta:
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: style.cardGap !== undefined ? '#7e22ce' : '#64748b' }}>
                            {style.cardGap !== undefined ? `${style.cardGap}px` : 'Global'}
                          </span>
                          {style.cardGap !== undefined && (
                            <button
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { cardGap: undefined })}
                              style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                            >
                              (auto)
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {[
                          { label: '0px', val: 0 },
                          { label: '10px', val: 10 },
                          { label: '25px', val: 25 },
                          { label: '50px', val: 50 },
                          { label: '80px', val: 80 },
                          { label: '120px', val: 120 },
                        ].map((b) => (
                          <button
                            key={b.val}
                            type="button"
                            onClick={() => updateSectionStyle(sec.id, { cardGap: b.val })}
                            style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '0.25rem',
                              border: '1px solid',
                              borderColor: style.cardGap === b.val ? '#9333ea' : '#cbd5e1',
                              background: style.cardGap === b.val ? '#9333ea' : '#ffffff',
                              color: style.cardGap === b.val ? '#ffffff' : '#334155',
                              fontSize: '0.65rem',
                              fontWeight: style.cardGap === b.val ? 700 : 500,
                              cursor: 'pointer',
                            }}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          step="4"
                          value={style.cardGap ?? (designConfig.layout?.sectionGap || 0)}
                          onChange={(e) => updateSectionStyle(sec.id, { cardGap: parseInt(e.target.value, 10) })}
                          style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer', height: '4px' }}
                        />
                        <input
                          type="number"
                          min="0"
                          max="400"
                          value={style.cardGap ?? (designConfig.layout?.sectionGap || 0)}
                          onChange={(e) => updateSectionStyle(sec.id, { cardGap: parseInt(e.target.value, 10) || 0 })}
                          style={{
                            width: '50px',
                            padding: '0.15rem 0.3rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.25rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#334155',
                            textAlign: 'right',
                          }}
                        />
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>px</span>
                      </div>
                    </div>

                    {/* Miniatura y controles de adaptación del div y tamaño de fondo */}
                    {hasBg && (
                      <div
                        style={{
                          padding: '0.6rem',
                          borderRadius: '0.5rem',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '56px',
                              height: '36px',
                              borderRadius: '0.35rem',
                              backgroundImage: `url("${style.backgroundImage}")`,
                              backgroundSize: style.backgroundSize || 'contain',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              backgroundColor: '#e2e8f0',
                              border: '1px solid #86efac',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                            <span style={{ fontSize: '0.72rem', color: '#1e293b', fontWeight: 600, wordBreak: 'break-all' }}>
                              {style.backgroundImage?.split('/').pop()}
                            </span>
                            {style.imageWidth && style.imageHeight && (
                              <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                                Original: {style.imageWidth} × {style.imageHeight} px
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSectionStyle(sec.id, {
                              backgroundImage: undefined,
                              backgroundSize: undefined,
                              backgroundSizeMobile: undefined,
                              cardWidth: undefined,
                              imageWidth: undefined,
                              imageHeight: undefined,
                            })}
                            title="Quitar imagen de fondo"
                            style={{
                              padding: '0.2rem 0.45rem',
                              borderRadius: '0.25rem',
                              border: '1px solid #fca5a5',
                              background: '#fef2f2',
                              color: '#b91c1c',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            ✕ Quitar
                          </button>
                        </div>

                        {/* Controles de escala independientes: Móvil (prioridad) y Desktop */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>

                          {/* 1. CONTROL PARA MODO MÓVIL (PRIORIDAD) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: '#faf5ff', padding: '0.6rem 0.75rem', borderRadius: '0.45rem', border: '1px solid #d8b4fe' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  📱 Escala Móvil (Prioridad - Vista Principal)
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#9333ea', background: '#f3e8ff', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                  Recomendado
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7e22ce', background: '#f3e8ff', padding: '0.1rem 0.45rem', borderRadius: '0.25rem', border: '1px solid #d8b4fe' }}>
                                {style.backgroundSizeMobile || '100% auto'}
                              </span>
                            </div>

                            {/* Botones rápidos Móvil */}
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              {[
                                { label: '100% Ancho', value: '100% auto' },
                                { label: '110%', value: '110% auto' },
                                { label: '120%', value: '120% auto' },
                                { label: '140%', value: '140% auto' },
                                { label: 'Cubrir', value: 'cover' },
                                { label: 'Contener', value: 'contain' },
                              ].map((preset) => {
                                const effectiveMobile = style.backgroundSizeMobile || '100% auto';
                                const isActive = effectiveMobile === preset.value;
                                return (
                                  <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => updateSectionStyle(sec.id, { backgroundSizeMobile: preset.value })}
                                    style={{
                                      padding: '0.18rem 0.45rem',
                                      borderRadius: '0.25rem',
                                      border: '1px solid',
                                      borderColor: isActive ? '#9333ea' : '#d8b4fe',
                                      background: isActive ? '#9333ea' : '#ffffff',
                                      color: isActive ? '#ffffff' : '#6b21a8',
                                      fontSize: '0.68rem',
                                      fontWeight: isActive ? 700 : 500,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Slider Móvil */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '0.68rem', color: '#7e22ce', whiteSpace: 'nowrap' }}>Slider:</span>
                              <input
                                type="range"
                                min="50"
                                max="300"
                                step="5"
                                value={
                                  style.backgroundSizeMobile && /^\d+/.test(style.backgroundSizeMobile)
                                    ? parseInt(style.backgroundSizeMobile, 10)
                                    : 100
                                }
                                onChange={(e) => {
                                  updateSectionStyle(sec.id, { backgroundSizeMobile: `${e.target.value}% auto` });
                                }}
                                style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer', height: '5px' }}
                              />
                              <span style={{ fontSize: '0.68rem', color: '#6b21a8', minWidth: '40px', textAlign: 'right', fontWeight: 700 }}>
                                {style.backgroundSizeMobile && /^\d+/.test(style.backgroundSizeMobile)
                                  ? `${parseInt(style.backgroundSizeMobile, 10)}%`
                                  : '100%'}
                              </span>
                            </div>
                          </div>

                          {/* 2. CONTROL PARA MODO DESKTOP (INDEPENDIENTE) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: '#f8fafc', padding: '0.55rem 0.75rem', borderRadius: '0.45rem', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                🖥️ Escala Desktop (Pantallas Grandes)
                              </span>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '0.1rem 0.45rem', borderRadius: '0.25rem', border: '1px solid #bfdbfe' }}>
                                {style.backgroundSize || 'cover'}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                              Solo afecta la pantalla de escritorio (+768px). No modifica la versión móvil.
                            </span>

                            {/* Botones rápidos Desktop */}
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              {[
                                { label: 'Cubrir', value: 'cover' },
                                { label: '100% Ancho', value: '100% auto' },
                                { label: '120%', value: '120% auto' },
                                { label: '150%', value: '150% auto' },
                                { label: 'Contener', value: 'contain' },
                              ].map((preset) => {
                                const isActive = (style.backgroundSize || 'cover') === preset.value;
                                return (
                                  <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => {
                                      const patch: Record<string, unknown> = {
                                        backgroundSize: preset.value,
                                        cardWidth: undefined,
                                      };
                                      if (!style.backgroundSizeMobile) {
                                        patch.backgroundSizeMobile = '100% auto';
                                      }
                                      updateSectionStyle(sec.id, patch);
                                    }}
                                    style={{
                                      padding: '0.18rem 0.45rem',
                                      borderRadius: '0.25rem',
                                      border: '1px solid',
                                      borderColor: isActive ? '#3b82f6' : '#cbd5e1',
                                      background: isActive ? '#3b82f6' : '#ffffff',
                                      color: isActive ? '#ffffff' : '#334155',
                                      fontSize: '0.68rem',
                                      fontWeight: isActive ? 700 : 500,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {preset.label}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Slider Desktop */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                              <span style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap' }}>Slider:</span>
                              <input
                                type="range"
                                min="50"
                                max="300"
                                step="5"
                                value={
                                  style.backgroundSize && /^\d+/.test(style.backgroundSize)
                                    ? parseInt(style.backgroundSize, 10)
                                    : 100
                                }
                                onChange={(e) => {
                                  const patch: Record<string, unknown> = {
                                    backgroundSize: `${e.target.value}% auto`,
                                    cardWidth: undefined,
                                  };
                                  if (!style.backgroundSizeMobile) {
                                    patch.backgroundSizeMobile = '100% auto';
                                  }
                                  updateSectionStyle(sec.id, patch);
                                }}
                                style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer', height: '5px' }}
                              />
                              <span style={{ fontSize: '0.68rem', color: '#475569', minWidth: '40px', textAlign: 'right', fontWeight: 700 }}>
                                {style.backgroundSize && /^\d+/.test(style.backgroundSize) ? `${parseInt(style.backgroundSize, 10)}%` : '100%'}
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    )}

                {/* Selector de Fuentes por Sección (Títulos y Cuerpo) */}
                <div
                  style={{
                    marginTop: '0.6rem',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '0.5rem',
                    background: hasFont ? '#faf5ff' : '#f8fafc',
                    border: `1px solid ${hasFont ? '#d8b4fe' : '#e2e8f0'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: hasFont ? '#7e22ce' : '#334155' }}>
                        🔤 Tipografías de esta tarjeta
                      </span>
                      {hasFont && (
                        <span style={{ fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                          Personalizada
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => fontFileInputRef.current?.click()}
                        title="Subir un archivo de fuente (.ttf, .otf, .woff)"
                        style={{
                          padding: '0.15rem 0.45rem',
                          borderRadius: '0.25rem',
                          border: '1px solid #c084fc',
                          background: '#ffffff',
                          color: '#7e22ce',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📤 Subir fuente
                      </button>

                      {hasFont && (
                        <button
                          type="button"
                          onClick={() => updateSectionStyle(sec.id, {
                            sectionFont: undefined,
                            sectionFontUrl: undefined,
                            sectionBodyFont: undefined,
                            sectionBodyFontUrl: undefined,
                            titleFontSize: undefined,
                            bodyFontSize: undefined,
                            verticalGap: undefined,
                            wordSpacing: undefined,
                            horizontalPadding: undefined,
                            countdownNoBoxes: undefined,
                            countdownNumberSize: undefined,
                            countdownNumberColor: undefined,
                            titleColor: undefined,
                            textColor: undefined,
                            nameFontSize: undefined,
                            nameColor: undefined,
                            titleOffsetY: undefined,
                            textAlign: undefined,
                          })}
                          title="Restablecer para heredar las fuentes y tamaños globales"
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #fca5a5',
                            background: '#fef2f2',
                            color: '#b91c1c',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          ✕ Heredar global
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1. Familia Tipográfica: Títulos y Cuerpo */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                    {/* Fuente Títulos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
                        Fuente de Títulos:
                      </label>
                      <select
                        value={style.sectionFont || ''}
                        onChange={(e) => updateSectionStyle(sec.id, { sectionFont: e.target.value || undefined })}
                        style={{
                          width: '100%',
                          padding: '0.38rem 0.5rem',
                          borderRadius: '0.35rem',
                          border: `1px solid ${style.sectionFont ? '#a855f7' : '#cbd5e1'}`,
                          fontSize: '0.78rem',
                          background: '#ffffff',
                        }}
                      >
                        {renderFontSelectOptions(true)}
                      </select>
                    </div>

                    {/* Fuente Cuerpo */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569' }}>
                        Fuente de Textos / Detalles:
                      </label>
                      <select
                        value={style.sectionBodyFont || ''}
                        onChange={(e) => updateSectionStyle(sec.id, { sectionBodyFont: e.target.value || undefined })}
                        style={{
                          width: '100%',
                          padding: '0.38rem 0.5rem',
                          borderRadius: '0.35rem',
                          border: `1px solid ${style.sectionBodyFont ? '#a855f7' : '#cbd5e1'}`,
                          fontSize: '0.78rem',
                          background: '#ffffff',
                        }}
                      >
                        {renderFontSelectOptions(true)}
                      </select>
                    </div>
                  </div>

                  {/* Selector de Colores y Tamaños (Diferenciado para Portada/Hero vs otras tarjetas) */}
                  {sec.id === 'hero' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {/* 1. Nombre Interno del Evento (ej: Bianca) */}
                      <div style={{ background: '#fdf4ff', padding: '0.6rem', borderRadius: '0.45rem', border: '1px solid #f0abfc', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#86198f' }}>
                            👑 Nombre Interno del Evento (ej: Bianca)
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a21caf' }}>
                              {style.nameFontSize ? `${style.nameFontSize}px` : 'Auto'}
                            </span>
                            {style.nameFontSize !== undefined && (
                              <button
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { nameFontSize: undefined })}
                                style={{ background: 'none', border: 'none', color: '#a21caf', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              >
                                (auto)
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Color del Nombre */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#701a75', minWidth: '45px' }}>Color:</span>
                          <input
                            type="color"
                            value={style.nameColor || '#ffffff'}
                            onChange={(e) => updateSectionStyle(sec.id, { nameColor: e.target.value })}
                            style={{ width: '28px', height: '24px', padding: 0, border: '1px solid #c084fc', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                            title="Color del nombre del evento"
                          />
                          <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                            {[
                              { color: '#ffffff', title: 'Blanco' },
                              { color: '#c5a028', title: 'Dorado' },
                              { color: '#f43f5e', title: 'Rosa' },
                              { color: '#a855f7', title: 'Púrpura' },
                              { color: '#38bdf8', title: 'Celeste' },
                              { color: '#0f172a', title: 'Oscuro' },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { nameColor: c.color })}
                                title={c.title}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  background: c.color,
                                  border: style.nameColor === c.color ? '2px solid #86198f' : '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                }}
                              />
                            ))}
                          </div>
                          {style.nameColor && (
                            <button
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { nameColor: undefined })}
                              style={{ background: 'none', border: 'none', color: '#a21caf', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                            >
                              (auto)
                            </button>
                          )}
                        </div>

                        {/* Presets Tamaño del Nombre */}
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                          {[
                            { label: 'Chico (24px)', val: 24 },
                            { label: 'Normal (48px)', val: 48 },
                            { label: 'Grande (80px)', val: 80 },
                            { label: 'Extra (130px)', val: 130 },
                            { label: '200px', val: 200 },
                            { label: '260px', val: 260 },
                            { label: '320px', val: 320 },
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { nameFontSize: b.val })}
                              style={{
                                padding: '0.15rem 0.4rem',
                                borderRadius: '0.25rem',
                                border: '1px solid',
                                borderColor: style.nameFontSize === b.val ? '#86198f' : '#f0abfc',
                                background: style.nameFontSize === b.val ? '#86198f' : '#ffffff',
                                color: style.nameFontSize === b.val ? '#ffffff' : '#701a75',
                                fontSize: '0.65rem',
                                fontWeight: style.nameFontSize === b.val ? 700 : 500,
                                cursor: 'pointer',
                              }}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>

                        {/* Slider e Input numérico para Tamaño del Nombre sin tope restrictivo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <input
                            type="range"
                            min="12"
                            max="350"
                            step="1"
                            value={typeof style.nameFontSize === 'number' ? style.nameFontSize : 48}
                            onChange={(e) => updateSectionStyle(sec.id, { nameFontSize: parseInt(e.target.value, 10) })}
                            style={{ flex: 1, accentColor: '#a21caf', cursor: 'pointer', height: '4px' }}
                          />
                          <input
                            type="number"
                            min="10"
                            max="500"
                            value={typeof style.nameFontSize === 'number' ? style.nameFontSize : 48}
                            onChange={(e) => updateSectionStyle(sec.id, { nameFontSize: parseInt(e.target.value, 10) || 48 })}
                            style={{
                              width: '54px',
                              padding: '0.15rem 0.3rem',
                              border: '1px solid #f0abfc',
                              borderRadius: '0.25rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: '#86198f',
                              textAlign: 'right',
                            }}
                          />
                          <span style={{ fontSize: '0.68rem', color: '#86198f', fontWeight: 600 }}>px</span>
                        </div>
                      </div>

                      {/* 2. Título Público (ej: Mis 15 años) */}
                      <div style={{ background: '#faf5ff', padding: '0.6rem', borderRadius: '0.45rem', border: '1px solid #d8b4fe', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b21a8' }}>
                            🏷️ Título Público (ej: Mis 15 años)
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7e22ce' }}>
                              {style.titleFontSize ? `${style.titleFontSize}px` : 'Auto'}
                            </span>
                            {style.titleFontSize !== undefined && (
                              <button
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { titleFontSize: undefined })}
                                style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              >
                                (auto)
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Color del Título Público */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#581c87', minWidth: '45px' }}>Color:</span>
                          <input
                            type="color"
                            value={style.titleColor || '#c5a028'}
                            onChange={(e) => updateSectionStyle(sec.id, { titleColor: e.target.value })}
                            style={{ width: '28px', height: '24px', padding: 0, border: '1px solid #c084fc', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                            title="Color del título público"
                          />
                          <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                            {[
                              { color: '#c5a028', title: 'Dorado' },
                              { color: '#ffffff', title: 'Blanco' },
                              { color: '#f43f5e', title: 'Rosa' },
                              { color: '#a855f7', title: 'Púrpura' },
                              { color: '#38bdf8', title: 'Celeste' },
                              { color: '#0f172a', title: 'Oscuro' },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { titleColor: c.color })}
                                title={c.title}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  background: c.color,
                                  border: style.titleColor === c.color ? '2px solid #7e22ce' : '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                }}
                              />
                            ))}
                          </div>
                          {style.titleColor && (
                            <button
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { titleColor: undefined })}
                              style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                            >
                              (auto)
                            </button>
                          )}
                        </div>

                        {/* Presets Tamaño del Título Público */}
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                          {[
                            { label: 'Chico (16px)', val: 16 },
                            { label: 'Normal (22px)', val: 22 },
                            { label: 'Grande (32px)', val: 32 },
                            { label: 'Extra (48px)', val: 48 },
                            { label: 'Gigante (70px)', val: 70 },
                            { label: 'Máx (200px)', val: 200 },
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { titleFontSize: b.val })}
                              style={{
                                padding: '0.15rem 0.4rem',
                                borderRadius: '0.25rem',
                                border: '1px solid',
                                borderColor: style.titleFontSize === b.val ? '#7e22ce' : '#d8b4fe',
                                background: style.titleFontSize === b.val ? '#7e22ce' : '#ffffff',
                                color: style.titleFontSize === b.val ? '#ffffff' : '#6b21a8',
                                fontSize: '0.65rem',
                                fontWeight: style.titleFontSize === b.val ? 700 : 500,
                                cursor: 'pointer',
                              }}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>

                        {/* Slider Tamaño del Título Público */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <input
                            type="range"
                            min="12"
                            max="200"
                            step="1"
                            value={typeof style.titleFontSize === 'number' ? style.titleFontSize : 22}
                            onChange={(e) => updateSectionStyle(sec.id, { titleFontSize: parseInt(e.target.value, 10) })}
                            style={{ flex: 1, accentColor: '#7e22ce', cursor: 'pointer', height: '4px' }}
                          />
                          <span style={{ fontSize: '0.7rem', color: '#7e22ce', minWidth: '42px', textAlign: 'right', fontWeight: 600 }}>
                            {style.titleFontSize ? `${style.titleFontSize}px` : '22px'}
                          </span>
                        </div>
                      </div>

                      {/* 3. Subtítulo / Texto de Portada */}
                      <div style={{ background: '#f8fafc', padding: '0.6rem', borderRadius: '0.45rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                            📝 Subtítulo / Texto de Portada
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                              {style.bodyFontSize ? `${style.bodyFontSize}px` : 'Auto'}
                            </span>
                            {style.bodyFontSize !== undefined && (
                              <button
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { bodyFontSize: undefined })}
                                style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              >
                                (auto)
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Color del Subtítulo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#475569', minWidth: '45px' }}>Color:</span>
                          <input
                            type="color"
                            value={style.textColor || '#cbd5e1'}
                            onChange={(e) => updateSectionStyle(sec.id, { textColor: e.target.value })}
                            style={{ width: '28px', height: '24px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                            title="Color del subtítulo"
                          />
                          <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                            {[
                              { color: '#ffffff', title: 'Blanco' },
                              { color: '#cbd5e1', title: 'Gris Claro' },
                              { color: '#c5a028', title: 'Dorado' },
                              { color: '#fef08a', title: 'Crema' },
                              { color: '#0f172a', title: 'Oscuro' },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { textColor: c.color })}
                                title={c.title}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  background: c.color,
                                  border: style.textColor === c.color ? '2px solid #334155' : '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                }}
                              />
                            ))}
                          </div>
                          {style.textColor && (
                            <button
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { textColor: undefined })}
                              style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                            >
                              (auto)
                            </button>
                          )}
                        </div>

                        {/* Presets Tamaño del Subtítulo */}
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                          {[
                            { label: 'Chico (14px)', val: 14 },
                            { label: 'Normal (18px)', val: 18 },
                            { label: 'Grande (26px)', val: 26 },
                            { label: 'Extra (42px)', val: 42 },
                            { label: 'Gigante (70px)', val: 70 },
                            { label: 'Máx (200px)', val: 200 },
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { bodyFontSize: b.val })}
                              style={{
                                padding: '0.15rem 0.4rem',
                                borderRadius: '0.25rem',
                                border: '1px solid',
                                borderColor: style.bodyFontSize === b.val ? '#334155' : '#cbd5e1',
                                background: style.bodyFontSize === b.val ? '#334155' : '#ffffff',
                                color: style.bodyFontSize === b.val ? '#ffffff' : '#334155',
                                fontSize: '0.65rem',
                                fontWeight: style.bodyFontSize === b.val ? 700 : 500,
                                cursor: 'pointer',
                              }}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>

                        {/* Slider Tamaño del Subtítulo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <input
                            type="range"
                            min="10"
                            max="200"
                            step="1"
                            value={typeof style.bodyFontSize === 'number' ? style.bodyFontSize : 17}
                            onChange={(e) => updateSectionStyle(sec.id, { bodyFontSize: parseInt(e.target.value, 10) })}
                            style={{ flex: 1, accentColor: '#475569', cursor: 'pointer', height: '4px' }}
                          />
                          <span style={{ fontSize: '0.7rem', color: '#334155', minWidth: '42px', textAlign: 'right', fontWeight: 600 }}>
                            {style.bodyFontSize ? `${style.bodyFontSize}px` : '17px'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Selector de Colores de Textos Internos de esta Tarjeta */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', background: '#faf5ff', padding: '0.55rem', borderRadius: '0.4rem', border: '1px solid #d8b4fe' }}>
                        {/* Color de Títulos */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b21a8' }}>
                              🎨 Color de Títulos
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: style.titleColor || '#6b21a8' }}>
                                {style.titleColor || 'Auto'}
                              </span>
                              {style.titleColor && (
                                <button
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { titleColor: undefined })}
                                  style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                >
                                  (auto)
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input
                              type="color"
                              value={style.titleColor || '#ffffff'}
                              onChange={(e) => updateSectionStyle(sec.id, { titleColor: e.target.value })}
                              style={{ width: '28px', height: '24px', padding: 0, border: '1px solid #c084fc', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                              title="Elegir color personalizado de títulos"
                            />
                            <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                              {[
                                { color: '#ffffff', title: 'Blanco' },
                                { color: '#c5a028', title: 'Dorado' },
                                { color: '#f43f5e', title: 'Rosa' },
                                { color: '#a855f7', title: 'Púrpura' },
                                { color: '#38bdf8', title: 'Celeste' },
                                { color: '#0f172a', title: 'Oscuro' },
                              ].map((c) => (
                                <button
                                  key={c.color}
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { titleColor: c.color })}
                                  title={c.title}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '3px',
                                    background: c.color,
                                    border: style.titleColor === c.color ? '2px solid #9333ea' : '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Color de Textos / Cuerpo */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b21a8' }}>
                              🎨 Color de Textos / Cuerpo
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: style.textColor || '#6b21a8' }}>
                                {style.textColor || 'Auto'}
                              </span>
                              {style.textColor && (
                                <button
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { textColor: undefined })}
                                  style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                >
                                  (auto)
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input
                              type="color"
                              value={style.textColor || '#ffffff'}
                              onChange={(e) => updateSectionStyle(sec.id, { textColor: e.target.value })}
                              style={{ width: '28px', height: '24px', padding: 0, border: '1px solid #c084fc', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                              title="Elegir color personalizado de textos"
                            />
                            <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                              {[
                                { color: '#ffffff', title: 'Blanco' },
                                { color: '#c5a028', title: 'Dorado' },
                                { color: '#fef08a', title: 'Crema' },
                                { color: '#cbd5e1', title: 'Gris Claro' },
                                { color: '#f472b6', title: 'Rosa Pastel' },
                                { color: '#0f172a', title: 'Oscuro' },
                              ].map((c) => (
                                <button
                                  key={c.color}
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { textColor: c.color })}
                                  title={c.title}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '3px',
                                    background: c.color,
                                    border: style.textColor === c.color ? '2px solid #9333ea' : '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Tamaños de Tipografía (Títulos y Cuerpo) */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', background: '#ffffff', padding: '0.55rem', borderRadius: '0.4rem', border: '1px solid #e9d5ff' }}>
                        {/* Control Tamaño de Títulos - Máximo 200px */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b21a8' }}>
                              🔠 Tamaño de Títulos (hasta 200px)
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7e22ce' }}>
                                {style.titleFontSize ? `${style.titleFontSize}px` : 'Por defecto'}
                              </span>
                              {style.titleFontSize !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { titleFontSize: undefined })}
                                  style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                >
                                  (auto)
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {[
                              { label: 'Chico (22px)', val: 22 },
                              { label: 'Normal (32px)', val: 32 },
                              { label: 'Grande (50px)', val: 50 },
                              { label: 'Gigante (80px)', val: 80 },
                              { label: 'Extra (130px)', val: 130 },
                              { label: 'Máx (200px)', val: 200 },
                            ].map((b) => (
                              <button
                                key={b.val}
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { titleFontSize: b.val })}
                                style={{
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '0.25rem',
                                  border: '1px solid',
                                  borderColor: style.titleFontSize === b.val ? '#9333ea' : '#d8b4fe',
                                  background: style.titleFontSize === b.val ? '#9333ea' : '#faf5ff',
                                  color: style.titleFontSize === b.val ? '#ffffff' : '#7e22ce',
                                  fontSize: '0.65rem',
                                  fontWeight: style.titleFontSize === b.val ? 700 : 500,
                                  cursor: 'pointer',
                                }}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                            <input
                              type="range"
                              min="12"
                              max="200"
                              step="1"
                              value={typeof style.titleFontSize === 'number' ? style.titleFontSize : 32}
                              onChange={(e) => updateSectionStyle(sec.id, { titleFontSize: parseInt(e.target.value, 10) })}
                              style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer', height: '4px' }}
                            />
                            <span style={{ fontSize: '0.7rem', color: '#7e22ce', minWidth: '42px', textAlign: 'right', fontWeight: 600 }}>
                              {style.titleFontSize ? `${style.titleFontSize}px` : '32px'}
                            </span>
                          </div>
                        </div>

                        {/* Control Tamaño de Textos / Cuerpo - Máximo 200px */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6b21a8' }}>
                              📝 Tamaño de Texto / Cuerpo (hasta 200px)
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7e22ce' }}>
                                {style.bodyFontSize ? `${style.bodyFontSize}px` : 'Por defecto'}
                              </span>
                              {style.bodyFontSize !== undefined && (
                                <button
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { bodyFontSize: undefined })}
                                  style={{ background: 'none', border: 'none', color: '#9333ea', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                                >
                                  (auto)
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {[
                              { label: 'Chico (14px)', val: 14 },
                              { label: 'Normal (18px)', val: 18 },
                              { label: 'Grande (28px)', val: 28 },
                              { label: 'Extra (48px)', val: 48 },
                              { label: 'Gigante (90px)', val: 90 },
                              { label: 'Máx (200px)', val: 200 },
                            ].map((b) => (
                              <button
                                key={b.val}
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { bodyFontSize: b.val })}
                                style={{
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '0.25rem',
                                  border: '1px solid',
                                  borderColor: style.bodyFontSize === b.val ? '#9333ea' : '#d8b4fe',
                                  background: style.bodyFontSize === b.val ? '#9333ea' : '#faf5ff',
                                  color: style.bodyFontSize === b.val ? '#ffffff' : '#7e22ce',
                                  fontSize: '0.65rem',
                                  fontWeight: style.bodyFontSize === b.val ? 700 : 500,
                                  cursor: 'pointer',
                                }}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                            <input
                              type="range"
                              min="10"
                              max="200"
                              step="1"
                              value={typeof style.bodyFontSize === 'number' ? style.bodyFontSize : 15}
                              onChange={(e) => updateSectionStyle(sec.id, { bodyFontSize: parseInt(e.target.value, 10) })}
                              style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer', height: '4px' }}
                            />
                            <span style={{ fontSize: '0.7rem', color: '#7e22ce', minWidth: '42px', textAlign: 'right', fontWeight: 600 }}>
                              {style.bodyFontSize ? `${style.bodyFontSize}px` : '15px'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 3. Separación Vertical y Lateral entre Textos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem', background: '#f8fafc', padding: '0.55rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0' }}>
                    {/* Control Separación Vertical */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                          ↕️ Separación Vertical entre Textos
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb' }}>
                          {style.verticalGap !== undefined ? `${style.verticalGap}px` : 'Normal'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Junto (4px)', val: 4 },
                          { label: 'Normal (12px)', val: 12 },
                          { label: 'Holgado (22px)', val: 22 },
                          { label: 'Amplio (32px)', val: 32 },
                        ].map((b) => (
                          <button
                            key={b.val}
                            type="button"
                            onClick={() => updateSectionStyle(sec.id, { verticalGap: b.val })}
                            style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '0.25rem',
                              border: '1px solid',
                              borderColor: style.verticalGap === b.val ? '#2563eb' : '#cbd5e1',
                              background: style.verticalGap === b.val ? '#2563eb' : '#ffffff',
                              color: style.verticalGap === b.val ? '#ffffff' : '#334155',
                              fontSize: '0.65rem',
                              fontWeight: style.verticalGap === b.val ? 700 : 500,
                              cursor: 'pointer',
                            }}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="2"
                          value={style.verticalGap ?? 12}
                          onChange={(e) => updateSectionStyle(sec.id, { verticalGap: parseInt(e.target.value, 10) })}
                          style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer', height: '4px' }}
                        />
                      </div>
                    </div>

                    {/* Control Separación entre Palabras (word-spacing) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                          ↔️ Separación entre Palabras
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a' }}>
                            {style.wordSpacing !== undefined ? `${style.wordSpacing}px` : '0px'}
                          </span>
                          {style.wordSpacing !== undefined && (
                            <button
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { wordSpacing: undefined })}
                              style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                            >
                              (auto)
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Normal (0px)', val: 0 },
                          { label: 'Fino (4px)', val: 4 },
                          { label: 'Medio (8px)', val: 8 },
                          { label: 'Amplio (16px)', val: 16 },
                        ].map((b) => (
                          <button
                            key={b.val}
                            type="button"
                            onClick={() => updateSectionStyle(sec.id, { wordSpacing: b.val })}
                            style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '0.25rem',
                              border: '1px solid',
                              borderColor: style.wordSpacing === b.val ? '#16a34a' : '#cbd5e1',
                              background: style.wordSpacing === b.val ? '#16a34a' : '#ffffff',
                              color: style.wordSpacing === b.val ? '#ffffff' : '#334155',
                              fontSize: '0.65rem',
                              fontWeight: style.wordSpacing === b.val ? 700 : 500,
                              cursor: 'pointer',
                            }}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                        <input
                          type="range"
                          min="-2"
                          max="40"
                          step="1"
                          value={style.wordSpacing ?? 0}
                          onChange={(e) => updateSectionStyle(sec.id, { wordSpacing: parseInt(e.target.value, 10) })}
                          style={{ flex: 1, accentColor: '#16a34a', cursor: 'pointer', height: '4px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Altura / Separación del Título respecto al Cuerpo */}
                  <div style={{ background: '#f8fafc', padding: '0.55rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                        ↕️ Altura / Separación del Título respecto al Cuerpo
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: style.titleOffsetY ? '#2563eb' : '#64748b' }}>
                          {style.titleOffsetY !== undefined ? (style.titleOffsetY === 0 ? 'Normal (0px)' : `${style.titleOffsetY > 0 ? `+${style.titleOffsetY}` : style.titleOffsetY}px`) : 'Normal (0px)'}
                        </span>
                        {style.titleOffsetY !== undefined && (
                          <button
                            type="button"
                            onClick={() => updateSectionStyle(sec.id, { titleOffsetY: undefined })}
                            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                          >
                            (restablecer)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Presets intuitivos de separación */}
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Pegado (-40px)', val: -40 },
                        { label: 'Cercano (-20px)', val: -20 },
                        { label: 'Normal (0px)', val: 0 },
                        { label: 'Separado (+20px)', val: 20 },
                        { label: 'Más abajo (+40px)', val: 40 },
                        { label: 'Amplio (+70px)', val: 70 },
                      ].map((b) => (
                        <button
                          key={b.val}
                          type="button"
                          onClick={() => updateSectionStyle(sec.id, { titleOffsetY: b.val })}
                          style={{
                            padding: '0.15rem 0.4rem',
                            borderRadius: '0.25rem',
                            border: '1px solid',
                            borderColor: style.titleOffsetY === b.val ? '#2563eb' : '#cbd5e1',
                            background: style.titleOffsetY === b.val ? '#2563eb' : '#ffffff',
                            color: style.titleOffsetY === b.val ? '#ffffff' : '#334155',
                            fontSize: '0.65rem',
                            fontWeight: style.titleOffsetY === b.val ? 700 : 500,
                            cursor: 'pointer',
                          }}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>

                    {/* Slider continuo de altura */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>-100px</span>
                      <input
                        type="range"
                        min="-100"
                        max="150"
                        step="2"
                        value={style.titleOffsetY ?? 0}
                        onChange={(e) => updateSectionStyle(sec.id, { titleOffsetY: parseInt(e.target.value, 10) })}
                        style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer', height: '4px' }}
                      />
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>+150px</span>
                    </div>
                  </div>

                  {/* 5. Control de Alineación de Texto */}
                  <div style={{ background: '#f8fafc', padding: '0.45rem 0.55rem', borderRadius: '0.4rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                      ↔️ Alineación de Texto
                    </span>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      {[
                        { label: 'Izquierda', value: 'left' as const },
                        { label: 'Centro (default)', value: 'center' as const },
                        { label: 'Derecha', value: 'right' as const },
                      ].map((align) => {
                        const isCurrent = (style.textAlign || 'center') === align.value;
                        return (
                          <button
                            key={align.value}
                            type="button"
                            onClick={() => updateSectionStyle(sec.id, { textAlign: align.value === 'center' ? undefined : align.value })}
                            style={{
                              padding: '0.18rem 0.45rem',
                              borderRadius: '0.25rem',
                              border: '1px solid',
                              borderColor: isCurrent ? '#2563eb' : '#cbd5e1',
                              background: isCurrent ? '#eff6ff' : '#ffffff',
                              color: isCurrent ? '#1d4ed8' : '#475569',
                              fontSize: '0.68rem',
                              fontWeight: isCurrent ? 700 : 500,
                              cursor: 'pointer',
                            }}
                          >
                            {align.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Posición libre del texto en la tarjeta */}
                  <div style={{ background: '#eff6ff', padding: '0.55rem', borderRadius: '0.4rem', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e3a8a' }}>
                        🎯 Posición del texto en la tarjeta
                      </span>
                      {(style.contentOffsetX !== undefined || style.contentOffsetY !== undefined) && (
                        <button
                          type="button"
                          onClick={() => updateSectionStyle(sec.id, { contentOffsetX: undefined, contentOffsetY: undefined })}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                        >
                          (centrar)
                        </button>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#1d4ed8' }}>
                      Mové el bloque de texto a cualquier parte de la sección. 0 / 0 es el centro.
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af', minWidth: '72px' }}>
                        Horizontal
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>-200</span>
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        step="2"
                        value={style.contentOffsetX ?? 0}
                        onChange={(e) => updateSectionStyle(sec.id, { contentOffsetX: parseInt(e.target.value, 10) })}
                        style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer', height: '4px' }}
                      />
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>+200</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8', minWidth: '48px', textAlign: 'right' }}>
                        {style.contentOffsetX ?? 0}px
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e40af', minWidth: '72px' }}>
                        Vertical
                      </span>
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>-200</span>
                      <input
                        type="range"
                        min="-200"
                        max="200"
                        step="2"
                        value={style.contentOffsetY ?? 0}
                        onChange={(e) => updateSectionStyle(sec.id, { contentOffsetY: parseInt(e.target.value, 10) })}
                        style={{ flex: 1, accentColor: '#1d4ed8', cursor: 'pointer', height: '4px' }}
                      />
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>+200</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8', minWidth: '48px', textAlign: 'right' }}>
                        {style.contentOffsetY ?? 0}px
                      </span>
                    </div>
                  </div>

                  {/* Fondo PNG de botones */}
                  <div style={{ background: '#fff7ed', padding: '0.55rem', borderRadius: '0.4rem', border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9a3412' }}>
                      🖼️ Fondo PNG de botones
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#c2410c' }}>
                      Reemplazá el color de fondo del botón por una imagen (PNG o WebP).
                    </span>
                    <ButtonImageRow
                      label={sec.id === 'location' ? 'Botones de esta tarjeta (ambos)' : 'Botón de esta tarjeta'}
                      url={style.buttonBackgroundImage}
                      onPick={() => setActivePicker({ type: 'button', sectionId: sec.id })}
                      onClear={() => updateSectionStyle(sec.id, { buttonBackgroundImage: undefined })}
                    />
                    {sec.id === 'location' && (
                      <>
                        <ButtonImageRow
                          label="Fondo PNG Botón «Google Maps»"
                          url={style.mapsButtonBackgroundImage}
                          onPick={() => setActivePicker({ type: 'mapsButton', sectionId: sec.id })}
                          onClear={() => updateSectionStyle(sec.id, { mapsButtonBackgroundImage: undefined })}
                        />
                        <ButtonImageRow
                          label="Fondo PNG Botón «Waze»"
                          url={style.wazeButtonBackgroundImage}
                          onPick={() => setActivePicker({ type: 'wazeButton', sectionId: sec.id })}
                          onClear={() => updateSectionStyle(sec.id, { wazeButtonBackgroundImage: undefined })}
                        />
                      </>
                    )}
                    {sec.id === 'confirmation' && (
                      <>
                        <ButtonImageRow
                          label="Botón «Sí, asistiré»"
                          url={style.confirmButtonBackgroundImage}
                          onPick={() => setActivePicker({ type: 'confirmButton', sectionId: sec.id })}
                          onClear={() => updateSectionStyle(sec.id, { confirmButtonBackgroundImage: undefined })}
                        />
                        <ButtonImageRow
                          label="Botón «No podré asistir»"
                          url={style.declineButtonBackgroundImage}
                          onPick={() => setActivePicker({ type: 'declineButton', sectionId: sec.id })}
                          onClear={() => updateSectionStyle(sec.id, { declineButtonBackgroundImage: undefined })}
                        />
                      </>
                    )}
                    {(style.buttonBackgroundImage || style.mapsButtonBackgroundImage || style.wazeButtonBackgroundImage || style.confirmButtonBackgroundImage || style.declineButtonBackgroundImage) && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 600, color: '#9a3412', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={style.hideButtonLabel === true}
                          onChange={(e) => updateSectionStyle(sec.id, { hideButtonLabel: e.target.checked || undefined })}
                          style={{ accentColor: '#ea580c', cursor: 'pointer' }}
                        />
                        Ocultar texto del botón (el PNG ya lo incluye)
                      </label>
                    )}
                  </div>

                  {/* Opciones especiales para Cuenta Regresiva */}
                  {sec.id === 'countdown' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fdf4ff', padding: '0.6rem', borderRadius: '0.4rem', border: '1px solid #f0abfc' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#86198f' }}>
                        ⏳ Ajustes de Cuenta Regresiva
                      </span>

                      {/* Quitar recuadros de fondo */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontWeight: 600, color: '#701a75', cursor: 'pointer', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(style.countdownNoBoxes)}
                          onChange={(e) => updateSectionStyle(sec.id, { countdownNoBoxes: e.target.checked })}
                          style={{ accentColor: '#a21caf', cursor: 'pointer' }}
                        />
                        Quitar cuadros de fondo de los números (sin recuadros)
                      </label>

                      {/* Color de los números de la cuenta regresiva */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#701a75' }}>
                            🎨 Color de Números
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: style.countdownNumberColor || '#701a75' }}>
                              {style.countdownNumberColor || 'Auto'}
                            </span>
                            {style.countdownNumberColor && (
                              <button
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { countdownNumberColor: undefined })}
                                style={{ background: 'none', border: 'none', color: '#a21caf', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              >
                                (auto)
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <input
                            type="color"
                            value={style.countdownNumberColor || '#ffffff'}
                            onChange={(e) => updateSectionStyle(sec.id, { countdownNumberColor: e.target.value })}
                            style={{ width: '28px', height: '24px', padding: 0, border: '1px solid #f0abfc', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                            title="Color personalizado de los números de la cuenta regresiva"
                          />
                          <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                            {[
                              { color: '#ffffff', title: 'Blanco' },
                              { color: '#c5a028', title: 'Dorado' },
                              { color: '#f43f5e', title: 'Rosa' },
                              { color: '#a855f7', title: 'Púrpura' },
                              { color: '#38bdf8', title: 'Celeste' },
                              { color: '#0f172a', title: 'Oscuro' },
                            ].map((c) => (
                              <button
                                key={c.color}
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { countdownNumberColor: c.color })}
                                title={c.title}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  background: c.color,
                                  border: style.countdownNumberColor === c.color ? '2px solid #86198f' : '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Tamaño de los números de la cuenta regresiva */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#701a75' }}>
                            🔢 Tamaño de Números
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a21caf' }}>
                            {style.countdownNumberSize ? `${style.countdownNumberSize}px` : 'Normal (32px)'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {[
                            { label: 'Normal (36px)', val: 36 },
                            { label: 'Grande (54px)', val: 54 },
                            { label: 'Muy Grande (84px)', val: 84 },
                            { label: 'Gigante (130px)', val: 130 },
                            { label: 'Máx (200px)', val: 200 },
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => updateSectionStyle(sec.id, { countdownNumberSize: b.val })}
                              style={{
                                padding: '0.15rem 0.4rem',
                                borderRadius: '0.25rem',
                                border: '1px solid',
                                borderColor: style.countdownNumberSize === b.val ? '#a21caf' : '#f0abfc',
                                background: style.countdownNumberSize === b.val ? '#a21caf' : '#ffffff',
                                color: style.countdownNumberSize === b.val ? '#ffffff' : '#701a75',
                                fontSize: '0.65rem',
                                fontWeight: style.countdownNumberSize === b.val ? 700 : 500,
                                cursor: 'pointer',
                              }}
                            >
                              {b.label}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                          <input
                            type="range"
                            min="20"
                            max="200"
                            step="2"
                            value={style.countdownNumberSize ?? 32}
                            onChange={(e) => updateSectionStyle(sec.id, { countdownNumberSize: parseInt(e.target.value, 10) })}
                            style={{ flex: 1, accentColor: '#a21caf', cursor: 'pointer', height: '4px' }}
                          />
                          <span style={{ fontSize: '0.7rem', color: '#a21caf', minWidth: '42px', textAlign: 'right', fontWeight: 600 }}>
                            {style.countdownNumberSize ? `${style.countdownNumberSize}px` : '32px'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Opciones especiales para Ubicación (Botones Maps y Waze) */}
                  {sec.id === 'location' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#f0fdf4', padding: '0.65rem', borderRadius: '0.4rem', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>
                        📍 Botones de Navegación (Google Maps & Waze)
                      </span>

                      {/* Botón Google Maps */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.45rem', background: '#ffffff', borderRadius: '0.35rem', border: '1px solid #dcfce7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 600, color: '#14532d', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={style.showMapsButton !== false}
                              onChange={(e) => updateSectionStyle(sec.id, { showMapsButton: e.target.checked })}
                              style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                            />
                            Mostrar botón de Google Maps
                          </label>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: style.showMapsButton !== false ? '#16a34a' : '#94a3b8' }}>
                            {style.showMapsButton !== false ? 'Activo' : 'Oculto'}
                          </span>
                        </div>

                        {style.showMapsButton !== false && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>Color de fondo:</span>
                            <input
                              type="color"
                              value={style.mapsButtonBg || '#16a34a'}
                              onChange={(e) => updateSectionStyle(sec.id, { mapsButtonBg: e.target.value })}
                              style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #86efac', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                              title="Color de fondo del botón Maps"
                            />
                            <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                              {[
                                { color: '#16a34a', title: 'Verde Maps' },
                                { color: '#2563eb', title: 'Azul' },
                                { color: '#0f172a', title: 'Negro Elegante' },
                                { color: '#c5a028', title: 'Dorado' },
                                { color: '#7c3aed', title: 'Violeta' },
                              ].map((c) => (
                                <button
                                  key={c.color}
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { mapsButtonBg: c.color })}
                                  title={c.title}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '3px',
                                    background: c.color,
                                    border: style.mapsButtonBg === c.color ? '2px solid #14532d' : '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                />
                              ))}
                            </div>
                            {style.mapsButtonBg && (
                              <button
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { mapsButtonBg: undefined })}
                                style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              >
                                (predeterminado)
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botón Waze */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.45rem', background: '#ffffff', borderRadius: '0.35rem', border: '1px solid #dcfce7' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 600, color: '#14532d', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={style.showWazeButton !== false}
                              onChange={(e) => updateSectionStyle(sec.id, { showWazeButton: e.target.checked })}
                              style={{ accentColor: '#0284c7', cursor: 'pointer' }}
                            />
                            Mostrar botón de Waze
                          </label>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: style.showWazeButton !== false ? '#0284c7' : '#94a3b8' }}>
                            {style.showWazeButton !== false ? 'Activo' : 'Oculto'}
                          </span>
                        </div>

                        {style.showWazeButton !== false && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>Color de fondo:</span>
                            <input
                              type="color"
                              value={style.wazeButtonBg || '#0284c7'}
                              onChange={(e) => updateSectionStyle(sec.id, { wazeButtonBg: e.target.value })}
                              style={{ width: '28px', height: '22px', padding: 0, border: '1px solid #7dd3fc', borderRadius: '0.25rem', cursor: 'pointer', background: 'none' }}
                              title="Color de fondo del botón Waze"
                            />
                            <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap' }}>
                              {[
                                { color: '#0284c7', title: 'Azul Waze' },
                                { color: '#0ea5e9', title: 'Celeste' },
                                { color: '#0f172a', title: 'Negro Elegante' },
                                { color: '#c5a028', title: 'Dorado' },
                                { color: '#16a34a', title: 'Verde' },
                              ].map((c) => (
                                <button
                                  key={c.color}
                                  type="button"
                                  onClick={() => updateSectionStyle(sec.id, { wazeButtonBg: c.color })}
                                  title={c.title}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '3px',
                                    background: c.color,
                                    border: style.wazeButtonBg === c.color ? '2px solid #0369a1' : '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                />
                              ))}
                            </div>
                            {style.wazeButtonBg && (
                              <button
                                type="button"
                                onClick={() => updateSectionStyle(sec.id, { wazeButtonBg: undefined })}
                                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                              >
                                (predeterminado)
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  {/* 5. URLs externas personalizadas para esta sección */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingTop: '0.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', color: '#6b21a8', fontWeight: 600, marginBottom: '0.15rem' }}>
                        URL externa de fuente para títulos (opcional):
                      </label>
                      <input
                        type="url"
                        placeholder="https://fonts.googleapis.com/css2?family=...&display=swap"
                        value={style.sectionFontUrl || ''}
                        onChange={(e) => updateSectionStyle(sec.id, { sectionFontUrl: e.target.value || undefined })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          border: `1px solid ${style.sectionFontUrl ? '#d8b4fe' : '#cbd5e1'}`,
                          borderRadius: '0.3rem',
                          fontSize: '0.72rem',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.68rem', color: '#6b21a8', fontWeight: 600, marginBottom: '0.15rem' }}>
                        URL externa de fuente para texto (opcional):
                      </label>
                      <input
                        type="url"
                        placeholder="https://fonts.googleapis.com/css2?family=...&display=swap"
                        value={style.sectionBodyFontUrl || ''}
                        onChange={(e) => updateSectionStyle(sec.id, { sectionBodyFontUrl: e.target.value || undefined })}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          border: `1px solid ${style.sectionBodyFontUrl ? '#d8b4fe' : '#cbd5e1'}`,
                          borderRadius: '0.3rem',
                          fontSize: '0.72rem',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
        </div>
      </div>
      )}

      {/* MediaPicker unificado para fondos de sección, fluido, continuo y general */}
      {activePicker && (
        <MediaPicker
          isOpen={true}
          onClose={() => setActivePicker(null)}
          onSelect={(url) => {
            if (activePicker.type === 'section' && activePicker.sectionId) {
              const secId = activePicker.sectionId;
              if (!url) {
                updateSectionStyle(secId, {
                  backgroundImage: undefined,
                  imageWidth: undefined,
                  imageHeight: undefined,
                  cardWidth: undefined,
                  backgroundSize: undefined,
                  backgroundSizeMobile: undefined,
                });
              } else {
                updateSectionStyle(secId, {
                  backgroundImage: url,
                  cardWidth: undefined,
                  backgroundSize: '120% auto',
                });
              }
            } else if (activePicker.type === 'fluid') {
              setDesignConfig((prev) => ({
                ...prev,
                layout: { ...(prev.layout || {}), fluidBackgroundUrl: url || undefined },
              }));
            } else if (activePicker.type === 'continuous') {
              setDesignConfig((prev) => ({
                ...prev,
                layout: { ...(prev.layout || {}), continuousBackgroundUrl: url || undefined },
              }));
            } else if (activePicker.type === 'general') {
              setDesignConfig((prev) => ({
                ...prev,
                layout: { ...(prev.layout || {}), generalBackgroundUrl: url || undefined },
              }));
            } else if (activePicker.type === 'sidebars') {
              setDesignConfig((prev) => ({
                ...prev,
                layout: {
                  ...(prev.layout || {}),
                  desktopSidebars: {
                    ...(prev.layout?.desktopSidebars || {}),
                    backgroundImageUrl: url || undefined,
                    style: 'image',
                  },
                },
              }));
            } else if (activePicker.type === 'button' && activePicker.sectionId) {
              updateSectionStyle(activePicker.sectionId, {
                buttonBackgroundImage: url || undefined,
              });
            } else if (activePicker.type === 'mapsButton' && activePicker.sectionId) {
              updateSectionStyle(activePicker.sectionId, {
                mapsButtonBackgroundImage: url || undefined,
              });
            } else if (activePicker.type === 'wazeButton' && activePicker.sectionId) {
              updateSectionStyle(activePicker.sectionId, {
                wazeButtonBackgroundImage: url || undefined,
              });
            } else if (activePicker.type === 'confirmButton' && activePicker.sectionId) {
              updateSectionStyle(activePicker.sectionId, {
                confirmButtonBackgroundImage: url || undefined,
              });
            } else if (activePicker.type === 'declineButton' && activePicker.sectionId) {
              updateSectionStyle(activePicker.sectionId, {
                declineButtonBackgroundImage: url || undefined,
              });
            }
            setActivePicker(null);
          }}
          eventId={eventId}
          currentUrl={
            activePicker.type === 'section' && activePicker.sectionId
              ? getSectionStyle(activePicker.sectionId).backgroundImage || ''
              : activePicker.type === 'button' && activePicker.sectionId
                ? getSectionStyle(activePicker.sectionId).buttonBackgroundImage || ''
                : activePicker.type === 'mapsButton' && activePicker.sectionId
                  ? getSectionStyle(activePicker.sectionId).mapsButtonBackgroundImage || ''
                  : activePicker.type === 'wazeButton' && activePicker.sectionId
                    ? getSectionStyle(activePicker.sectionId).wazeButtonBackgroundImage || ''
                    : activePicker.type === 'confirmButton' && activePicker.sectionId
                      ? getSectionStyle(activePicker.sectionId).confirmButtonBackgroundImage || ''
                      : activePicker.type === 'declineButton' && activePicker.sectionId
                        ? getSectionStyle(activePicker.sectionId).declineButtonBackgroundImage || ''
                        : activePicker.type === 'fluid'
                          ? designConfig.layout?.fluidBackgroundUrl || ''
                          : activePicker.type === 'continuous'
                            ? designConfig.layout?.continuousBackgroundUrl || ''
                            : activePicker.type === 'sidebars'
                              ? designConfig.layout?.desktopSidebars?.backgroundImageUrl || ''
                              : designConfig.layout?.generalBackgroundUrl || ''
          }
          title={
            activePicker.type === 'section' && activePicker.sectionId
              ? `Fondo de sección: ${SECTIONS_LIST.find((s) => s.id === activePicker.sectionId)?.label || activePicker.sectionId}`
              : activePicker.type === 'button'
                ? 'Fondo PNG de botón'
                : activePicker.type === 'mapsButton'
                  ? 'Fondo PNG de botón Google Maps'
                  : activePicker.type === 'wazeButton'
                    ? 'Fondo PNG de botón Waze'
                    : activePicker.type === 'confirmButton'
                      ? 'Fondo PNG de botón «Sí, asistiré»'
                      : activePicker.type === 'declineButton'
                        ? 'Fondo PNG de botón «No podré asistir»'
                        : activePicker.type === 'fluid'
                          ? 'Fondo para Modo Fluido'
                          : activePicker.type === 'continuous'
                            ? 'Fondo Continuo (Modo Fijo)'
                            : activePicker.type === 'sidebars'
                              ? 'Imagen para Bandas Laterales en Desktop'
                              : 'Fondo General del Evento'
          }
          purpose="background"
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="button"
          onClick={resetToDefault}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#64748b',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ↺ Restablecer valores de fábrica de la plantilla
        </button>
      </div>
    </div>
  );
}
