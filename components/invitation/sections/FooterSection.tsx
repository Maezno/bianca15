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
    </footer>
  );
}
