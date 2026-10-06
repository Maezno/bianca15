import React from 'react';
import type { SectionBaseProps } from './types';
import { ActionButton } from '../ActionButton';

export function GiftsSection({ event, theme }: SectionBaseProps) {
  const [copied, setCopied] = React.useState(false);
  if (!event.giftsText) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['gifts'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  const handleCopy = () => {
    if (!event.giftsText) return;
    const aliasMatch = event.giftsText.match(/(?:cuenta|alias)[:\s]+([A-Z0-9_.-]+)/i);
    const textToCopy = aliasMatch ? aliasMatch[1].trim() : event.giftsText;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const hasBgImage = Boolean(sectionStyle?.buttonBackgroundImage);
  const hideLabel = Boolean(sectionStyle?.hideButtonLabel && hasBgImage);

  return (
    <section
      aria-label="Mesa de regalos"
      style={{
        background: theme.colors.surface,
        borderRadius: '1.25rem',
        border: `1px solid ${theme.colors.border}`,
        padding: '1.75rem',
        textAlign: 'center',
        boxShadow: (theme.colors.surface === 'transparent' || theme.styles?.cardShadow === 'none')
          ? 'none'
          : '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      {!sectionStyle?.hideTitle && !sectionStyle?.hideText && (
        <div
          data-heading-container="true"
          style={{
            marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 8 + titleOffsetY)}px` : '0.5rem',
            transition: 'margin-bottom 0.15s ease',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <span
            data-badge="true"
            style={{
              display: 'block',
              fontSize: '0.8rem',
              color: sectionStyle?.titleColor || theme.colors.primary,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '0.35rem',
              textAlign: 'center',
            }}
          >
            MESA DE REGALOS
          </span>
          <h2
            data-heading="true"
            style={{
              fontFamily: theme.typography.headingFont,
              fontSize: '1.35rem',
              color: sectionStyle?.titleColor || theme.colors.text,
              margin: '0.25rem 0 0.5rem 0',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Regalos
          </h2>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
        {!sectionStyle?.hideSubtitle && !sectionStyle?.hideText && (
          <p
            data-body="true"
            style={{
              fontFamily: theme.typography.secondaryFont || theme.typography.bodyFont,
              fontSize: '1rem',
              color: sectionStyle?.textColor || theme.colors.text,
              lineHeight: 1.6,
              margin: 0,
              textAlign: 'center',
              letterSpacing: '0.02em',
              fontWeight: 600,
            }}
          >
            {event.giftsText}
          </p>
        )}

        {/* Botón Copiar Alias con soporte completo de diseño */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: sectionStyle?.buttonsAlign === 'left' ? 'flex-start' : sectionStyle?.buttonsAlign === 'right' ? 'flex-end' : 'center',
            justifyContent: sectionStyle?.buttonsAlign === 'left' ? 'flex-start' : sectionStyle?.buttonsAlign === 'right' ? 'flex-end' : 'center',
            width: '100%',
            transform: (sectionStyle?.buttonsOffsetX || sectionStyle?.buttonsOffsetY)
              ? `translate(${sectionStyle?.buttonsOffsetX ?? 0}px, ${sectionStyle?.buttonsOffsetY ?? 0}px)`
              : undefined,
            transition: 'transform 0.15s ease',
          }}
        >
          <ActionButton
            label={copied ? '¡Copiado al portapapeles!' : 'Copiar Datos / Alias'}
            icon={copied ? '✓' : '📋'}
            onClick={handleCopy}
            variant="secondary"
            primaryColor={theme.colors.primary}
            customBg={!hasBgImage && copied ? '#dcfce7' : undefined}
            customColor={!hasBgImage && copied ? '#15803d' : undefined}
            backgroundImage={sectionStyle?.buttonBackgroundImage}
            backgroundScale={sectionStyle?.buttonBackgroundScale}
            hideLabel={hideLabel}
          />
          {copied && hideLabel && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#16a34a',
                marginTop: '0.35rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: '#dcfce7',
                padding: '0.2rem 0.6rem',
                borderRadius: '99px',
                border: '1px solid #86efac',
              }}
            >
              ✓ ¡Datos copiados al portapapeles!
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
