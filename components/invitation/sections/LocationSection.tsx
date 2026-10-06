import React from 'react';
import type { SectionBaseProps } from './types';
import { ActionButton } from '@/components/invitation/ActionButton';

export function LocationSection({ event, theme }: SectionBaseProps) {
  if (!event.location) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['location'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <section
      aria-label="Ubicación del evento"
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
      {(!sectionStyle?.hideTitle || !sectionStyle?.hideText) && (
        <div
          data-heading-container="true"
          style={{
            marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 8 + titleOffsetY)}px` : '0.5rem',
            transition: 'margin-bottom 0.15s ease',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {!sectionStyle?.hideTitle && !sectionStyle?.hideText && (
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
              LUGAR DE CELEBRACIÓN
            </span>
          )}
          {!sectionStyle?.hideText && (
            <h2
              data-heading="true"
              style={{
                fontFamily: theme.typography.headingFont,
                fontSize: '1.25rem',
                color: sectionStyle?.titleColor || theme.colors.text,
                fontWeight: 500,
                margin: '0.2rem 0',
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              {sectionStyle?.customTitle || event.location}
            </h2>
          )}
        </div>
      )}

      {event.address && !sectionStyle?.hideSubtitle && !sectionStyle?.hideText && (
        <p
          data-body="true"
          style={{
            fontSize: '0.95rem',
            color: theme.colors.textMuted,
            margin: '0.35rem 0 0 0',
            lineHeight: 1.4,
            textAlign: 'center',
          }}
        >
          {sectionStyle?.customSubtitle || event.address}
        </p>
      )}

      {((sectionStyle?.showMapsButton !== false && event.mapsUrl) ||
        (sectionStyle?.showWazeButton !== false && event.wazeUrl)) && (() => {
        const hasBgImage = Boolean(
          sectionStyle?.mapsButtonBackgroundImage ||
          sectionStyle?.wazeButtonBackgroundImage ||
          sectionStyle?.buttonBackgroundImage
        );
        const bgScale = sectionStyle?.buttonBackgroundScale;
        const rawGap = sectionStyle?.buttonsGap;
        const effectiveGap = rawGap !== undefined ? Math.max(0, rawGap) : 10;
        const negativeMargin = (rawGap !== undefined && rawGap < 0) ? rawGap : 0;

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: sectionStyle?.buttonsLayout === 'column' ? 'column' : 'row',
              gap: `${effectiveGap}px`,
              marginTop: '1.25rem',
              width: '100%',
              maxWidth: sectionStyle?.buttonsLayout === 'column' ? '360px' : (hasBgImage ? `${Math.max(260, Math.round(360 * ((bgScale ?? 100) / 100)))}px` : '420px'),
              margin: '1.25rem auto 0 auto',
              justifyContent: sectionStyle?.buttonsAlign === 'left' ? 'flex-start' : sectionStyle?.buttonsAlign === 'right' ? 'flex-end' : 'center',
              alignItems: 'center',
              flexWrap: sectionStyle?.buttonsLayout === 'column' ? 'wrap' : 'nowrap',
              transform: (sectionStyle?.buttonsOffsetX || sectionStyle?.buttonsOffsetY)
                ? `translate(${sectionStyle?.buttonsOffsetX ?? 0}px, ${sectionStyle?.buttonsOffsetY ?? 0}px)`
                : undefined,
              transition: 'transform 0.15s ease',
            }}
          >
            {sectionStyle?.showMapsButton !== false && event.mapsUrl && (
              <ActionButton
                label="Google Maps"
                href={event.mapsUrl}
                variant="primary"
                primaryColor={theme.colors.primary}
                textColor="#ffffff"
                customBg={sectionStyle?.mapsButtonBg}
                customColor={sectionStyle?.mapsButtonTextColor}
                backgroundImage={sectionStyle?.mapsButtonBackgroundImage || sectionStyle?.buttonBackgroundImage}
                backgroundScale={bgScale}
                hideLabel={Boolean(sectionStyle?.hideButtonLabel && (sectionStyle?.mapsButtonBackgroundImage || sectionStyle?.buttonBackgroundImage))}
                fullWidth={sectionStyle?.buttonsLayout === 'column'}
                style={
                  sectionStyle?.buttonsLayout !== 'column'
                    ? { flex: '1 1 0', minWidth: 0, width: '100%' }
                    : undefined
                }
              />
            )}
            {sectionStyle?.showWazeButton !== false && event.wazeUrl && (
              <ActionButton
                label="Waze"
                href={event.wazeUrl}
                variant="outline"
                primaryColor={theme.colors.primary}
                customBg={sectionStyle?.wazeButtonBg}
                customColor={sectionStyle?.wazeButtonTextColor}
                backgroundImage={sectionStyle?.wazeButtonBackgroundImage || sectionStyle?.buttonBackgroundImage}
                backgroundScale={bgScale}
                hideLabel={Boolean(sectionStyle?.hideButtonLabel && (sectionStyle?.wazeButtonBackgroundImage || sectionStyle?.buttonBackgroundImage))}
                fullWidth={sectionStyle?.buttonsLayout === 'column'}
                style={
                  sectionStyle?.buttonsLayout !== 'column'
                    ? {
                        flex: '1 1 0',
                        minWidth: 0,
                        width: '100%',
                        marginLeft: negativeMargin ? `${negativeMargin}px` : undefined,
                      }
                    : undefined
                }
              />
            )}
          </div>
        );
      })()}
    </section>
  );
}
