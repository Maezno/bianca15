'use client';

import React, { useState } from 'react';
import type { EventDesignConfig, EventSectionConfig } from '@/types/event';
import type { ColorPreset, TemplateTheme } from '@/templates/types';
import { ExportTemplateButton } from '../ExportTemplateButton';
import { MediaPicker } from '@/components/admin/MediaPicker';

interface DesignTabProps {
  designConfig: EventDesignConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<EventDesignConfig>>;
  baseTheme: TemplateTheme;
  presets: ColorPreset[];
  sectionConfig?: EventSectionConfig;
  eventName?: string;
  eventId: string;
}

export function DesignTab({
  designConfig,
  setDesignConfig,
  baseTheme,
  presets,
  sectionConfig,
  eventName,
  eventId,
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

  // Estado para el MediaPicker (sección, fluido, continuo o general)
  const [activePicker, setActivePicker] = useState<{
    type: 'section' | 'fluid' | 'continuous' | 'general';
    sectionId?: string;
  } | null>(null);

  const SECTIONS_LIST = [
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
        </div>
      </div>

      {/* Tipografía */}
      <div>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Tipografía de Títulos
        </label>
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
          style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}
        >
          <option value="Playfair Display, Georgia, serif">Playfair Display (Elegante Clásica)</option>
          <option value="Cormorant Garamond, Georgia, serif">Cormorant Garamond (Editorial / Bodas)</option>
          <option value="Montserrat, system-ui, sans-serif">Montserrat (Moderna Geométrica)</option>
          <option value="Cinzel, serif">Cinzel (Teatral / Majestuosa)</option>
          <option value="Lato, sans-serif">Lato (Limpia y Minimalista)</option>
        </select>
      </div>

      {/* Tipografía Personalizada */}
      <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#6b21a8', marginBottom: '0.25rem' }}>
          🔤 Tipografía Personalizada
        </label>
        <p style={{ fontSize: '0.8rem', color: '#7e22ce', margin: '0 0 0.75rem 0' }}>
          Pegá una URL de Google Fonts o cualquier CSS de fuente externa. Se aplicará a toda la invitación.
        </p>
        <input
          type="url"
          placeholder="https://fonts.googleapis.com/css2?family=MiFuente:ital,wght@400;700&display=swap"
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
            padding: '0.6rem 0.75rem',
            border: '1px solid #d8b4fe',
            borderRadius: '0.4rem',
            fontSize: '0.82rem',
            boxSizing: 'border-box',
            background: '#ffffff',
          }}
        />
        {designConfig.typography?.customFontUrl && (
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#7e22ce' }}>
              ✓ URL de fuente personalizada configurada. Se cargará al abrir la invitación.
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
                padding: '0.3rem 0.6rem',
                borderRadius: '0.35rem',
                border: '1px solid #fca5a5',
                background: '#fef2f2',
                color: '#b91c1c',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              ✕ Quitar fuente
            </button>
          </div>
        )}
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem', marginBottom: 0 }}>
          Ejemplo de URL: <code style={{ background: '#ede9fe', padding: '1px 4px', borderRadius: '3px' }}>https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap</code>
        </p>
        {designConfig.typography?.customFontUrl && (
          <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', background: '#ffffff', border: '1px solid #d8b4fe', borderRadius: '0.4rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b21a8', margin: '0 0 0.3rem 0', fontWeight: 600 }}>Después de guardar, usá el nombre de la familia en el selector de arriba:</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Ingresalo como fuente personalizada en el campo de texto del selector de tipografía (ej. <em>Great Vibes, cursive</em>).</p>
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

            {/* Separación entre secciones */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Separación vertical entre secciones:
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7e22ce' }}>
                  {designConfig.layout.sectionGap !== undefined ? designConfig.layout.sectionGap : 0} px
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={4}
                  value={designConfig.layout.sectionGap !== undefined ? designConfig.layout.sectionGap : 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: { ...(prev.layout || {}), sectionGap: val },
                    }));
                  }}
                  style={{ flex: 1, accentColor: '#9333ea', cursor: 'pointer' }}
                />
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={designConfig.layout.sectionGap !== undefined ? designConfig.layout.sectionGap : 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setDesignConfig((prev) => ({
                      ...prev,
                      layout: { ...(prev.layout || {}), sectionGap: val },
                    }));
                  }}
                  style={{ width: '80px', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '0.35rem', fontSize: '0.85rem' }}
                />
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
                Ajustá la altura de cada sección acá o interactivamente arrastrando desde el previsualizador.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.6rem' }}>
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
                  return (
                    <div
                      key={sec.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem',
                        background: customH ? '#faf5ff' : '#f8fafc',
                        border: '1px solid',
                        borderColor: customH ? '#d8b4fe' : '#e2e8f0',
                        borderRadius: '0.35rem',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 500 }}>
                        {sec.label}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
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
                            width: '65px',
                            padding: '0.25rem 0.4rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            textAlign: 'right',
                          }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>px</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── ESTILOS INDIVIDUALES POR SECCIÓN ─── */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '1.25rem' }}>
        <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#14532d', marginBottom: '0.25rem' }}>
          🖼️ Fondos y Estilos Individuales por Sección
        </label>
        <p style={{ fontSize: '0.8rem', color: '#166534', margin: '0 0 1rem 0' }}>
          Cada tarjeta puede tener su propia imagen de fondo que se mueve junto con ella. También podés quitarle el fondo de color o el borde de forma independiente.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {SECTIONS_LIST.map((sec) => {
            const style = getSectionStyle(sec.id);
            const hasBg = !!style.backgroundImage;
            const hasAnyStyle = hasBg || style.noBackground || style.noBorder;
            return (
              <div
                key={sec.id}
                style={{
                  background: hasAnyStyle ? '#ffffff' : '#f8fafc',
                  border: `1px solid ${hasAnyStyle ? '#86efac' : '#e2e8f0'}`,
                  borderRadius: '0.5rem',
                  padding: '0.65rem 0.85rem',
                }}
              >
                {/* Fila superior: label + botones */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', flexShrink: 0 }}>
                    {sec.label}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {/* Toggle sin fondo */}
                    <label
                      title="Quitar el color de fondo de esta tarjeta"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: style.noBackground ? '#15803d' : '#64748b', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <input
                        type="checkbox"
                        checked={style.noBackground === true}
                        onChange={(e) => updateSectionStyle(sec.id, { noBackground: e.target.checked || undefined })}
                        style={{ width: '14px', height: '14px', accentColor: '#16a34a', cursor: 'pointer' }}
                      />
                      Sin fondo
                    </label>

                    {/* Toggle sin borde */}
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

                    {/* Botón imagen de fondo */}
                    <button
                      type="button"
                      onClick={() => setActivePicker({ type: 'section', sectionId: sec.id })}
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
                      {hasBg ? '🖼️ Cambiar fondo' : '🖼️ + Fondo'}
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
                </div>

                {/* Miniatura del fondo si hay imagen */}
                {hasBg && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '36px',
                        borderRadius: '0.3rem',
                        backgroundImage: `url("${style.backgroundImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid #86efac',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b', wordBreak: 'break-all' }}>
                      {style.backgroundImage?.split('/').pop()}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateSectionStyle(sec.id, { backgroundImage: undefined })}
                      title="Quitar imagen de fondo"
                      style={{
                        marginLeft: 'auto',
                        padding: '0.2rem 0.4rem',
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MediaPicker unificado para fondos de sección, fluido, continuo y general */}
      {activePicker && (
        <MediaPicker
          isOpen={true}
          onClose={() => setActivePicker(null)}
          onSelect={(url) => {
            if (activePicker.type === 'section' && activePicker.sectionId) {
              updateSectionStyle(activePicker.sectionId, { backgroundImage: url || undefined });
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
            }
            setActivePicker(null);
          }}
          eventId={eventId}
          currentUrl={
            activePicker.type === 'section' && activePicker.sectionId
              ? getSectionStyle(activePicker.sectionId).backgroundImage || ''
              : activePicker.type === 'fluid'
              ? designConfig.layout?.fluidBackgroundUrl || ''
              : activePicker.type === 'continuous'
              ? designConfig.layout?.continuousBackgroundUrl || ''
              : designConfig.layout?.generalBackgroundUrl || ''
          }
          title={
            activePicker.type === 'section' && activePicker.sectionId
              ? `Fondo de sección: ${SECTIONS_LIST.find((s) => s.id === activePicker.sectionId)?.label || activePicker.sectionId}`
              : activePicker.type === 'fluid'
              ? 'Fondo para Modo Fluido'
              : activePicker.type === 'continuous'
              ? 'Fondo Continuo (Modo Fijo)'
              : 'Fondo General del Evento'
          }
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
