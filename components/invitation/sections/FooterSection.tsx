import React from 'react';
import type { SectionBaseProps } from './types';

export function FooterSection({ event, theme }: SectionBaseProps) {
  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['footer'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  if (sectionStyle?.hideText) return null;

  const title = sectionStyle?.customTitle ?? event.footerTitle ?? event.name;
  const subtitle = sectionStyle?.customSubtitle !== undefined
    ? sectionStyle.customSubtitle
    : (event.footerText ?? 'Plataforma de Invitaciones Digitales');

  const showTitle = Boolean(title && !sectionStyle?.hideTitle);
  const showSubtitle = Boolean(subtitle && subtitle.trim() !== '' && !sectionStyle?.hideSubtitle);

  if (!showTitle && !showSubtitle && !sectionStyle?.backgroundImage) return null;

  return (
    <footer
      aria-label="Pie de invitación"
      style={{
        textAlign: sectionStyle?.textAlign || 'center',
        padding: '2rem 1rem 1.5rem 1rem',
        color: sectionStyle?.textColor || theme.colors.textMuted,
        fontSize: '0.85rem',
        width: '100%',
        transform: (sectionStyle?.contentOffsetX || sectionStyle?.contentOffsetY)
          ? `translate(${sectionStyle?.contentOffsetX ?? 0}px, ${sectionStyle?.contentOffsetY ?? 0}px)`
          : undefined,
        transition: 'transform 0.15s ease',
      }}
    >
      {showTitle && (
        <div
          data-heading-container="true"
          style={{
            marginBottom: showSubtitle
              ? (titleOffsetY !== undefined ? `${Math.max(0, 8 + titleOffsetY)}px` : '0.5rem')
              : 0,
            transition: 'margin-bottom 0.15s ease',
            textAlign: sectionStyle?.textAlign || 'center',
            width: '100%',
          }}
        >
          <h4
            data-heading="true"
            style={{
              fontFamily: sectionStyle?.sectionFont || theme.typography.headingFont,
              color: sectionStyle?.titleColor || theme.colors.primary,
              fontSize: typeof sectionStyle?.titleFontSize === 'number'
                ? `${sectionStyle.titleFontSize}px`
                : (sectionStyle?.titleFontSize || '1rem'),
              letterSpacing: sectionStyle?.letterSpacing !== undefined ? `${sectionStyle.letterSpacing}px` : '0.2em',
              wordSpacing: sectionStyle?.wordSpacing !== undefined ? `${sectionStyle.wordSpacing}px` : undefined,
              fontWeight: 700,
              margin: 0,
              textTransform: 'uppercase',
              textAlign: sectionStyle?.textAlign || 'center',
            }}
          >
            {title}
          </h4>
        </div>
      )}

      {showSubtitle && (
        <p
          data-body="true"
          style={{
            margin: 0,
            opacity: 0.85,
            textAlign: sectionStyle?.textAlign || 'center',
            color: sectionStyle?.textColor || theme.colors.textMuted,
            fontSize: typeof sectionStyle?.bodyFontSize === 'number'
              ? `${sectionStyle.bodyFontSize}px`
              : (sectionStyle?.bodyFontSize || '0.85rem'),
            fontFamily: sectionStyle?.sectionBodyFont || undefined,
            letterSpacing: sectionStyle?.letterSpacing !== undefined ? `${sectionStyle.letterSpacing}px` : undefined,
            wordSpacing: sectionStyle?.wordSpacing !== undefined ? `${sectionStyle.wordSpacing}px` : undefined,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Información y consultas de contacto */}
      {(() => {
        const contactPhone = sectionStyle?.contactPhone || (event.slug === 'bianca-15' ? '+542945638000' : null);
        if (!contactPhone) return null;

        const cleanPhone = contactPhone.replace(/[^\d+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}`;

        return (
          <div
            style={{
              marginTop: (showTitle || showSubtitle) ? '1.25rem' : '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                opacity: 0.95,
                textTransform: 'uppercase',
              }}
            >
              Información y consultas
            </span>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Contactar por WhatsApp al ${contactPhone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                padding: '0.55rem 1.15rem',
                borderRadius: '999px',
                textDecoration: 'none',
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.22)';
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Logo SVG oficial de WhatsApp */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.887 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                  fill="#25D366"
                />
              </svg>
              <span>{contactPhone}</span>
            </a>
          </div>
        );
      })()}
    </footer>
  );
}
