'use client';

import React from 'react';
import type { EventDesignConfig, EventSectionConfig } from '@/types/event';
import type { ColorPreset, TemplateTheme } from '@/templates/types';
import { ExportTemplateButton } from '../ExportTemplateButton';

interface DesignTabProps {
  designConfig: EventDesignConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<EventDesignConfig>>;
  baseTheme: TemplateTheme;
  presets: ColorPreset[];
  sectionConfig?: EventSectionConfig;
  eventName?: string;
}

export function DesignTab({
  designConfig,
  setDesignConfig,
  baseTheme,
  presets,
  sectionConfig,
  eventName,
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
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                🖼️ Imagen de Fondo Continuo (URL)
              </label>
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
