'use client';

import React, { useState } from 'react';

interface ShareSectionProps {
  title: string;
  eventName: string;
  groupName?: string;
  btnBg?: string;
  btnColor?: string;
  cardBg?: string;
  borderColor?: string;
  textColor?: string;
  titleColor?: string;
  titleOffsetY?: number;
  buttonsLayout?: 'row' | 'column';
  buttonsAlign?: 'center' | 'left' | 'right';
  buttonsOffsetX?: number;
  buttonsOffsetY?: number;
  buttonsGap?: number;
  buttonBackgroundImage?: string;
  hideButtonLabel?: boolean;
  buttonBackgroundScale?: number;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideText?: boolean;
  contentOffsetX?: number;
  contentOffsetY?: number;
}

export function ShareSection({
  title,
  eventName,
  groupName,
  btnBg = '#9333ea',
  btnColor = '#ffffff',
  cardBg = 'rgba(255, 255, 255, 0.05)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  textColor = '#334155',
  titleColor,
  titleOffsetY,
  buttonsLayout,
  buttonsAlign,
  buttonsOffsetX,
  buttonsOffsetY,
  buttonsGap,
  buttonBackgroundImage,
  hideButtonLabel,
  buttonBackgroundScale,
  hideTitle,
  hideSubtitle,
  hideText,
  contentOffsetX,
  contentOffsetY,
}: ShareSectionProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const url = getShareUrl();
    const shareText = groupName
      ? `¡Hola ${groupName}! Te compartimos la invitación para ${eventName}:`
      : `¡Te invito a ${eventName}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} — ${eventName}`,
          text: shareText,
          url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '1rem',
        padding: '1.5rem',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {(() => {
        const hasTextOffset = (contentOffsetX ?? 0) !== 0 || (contentOffsetY ?? 0) !== 0;
        return (
          <div
            style={{
              width: '100%',
              transform: hasTextOffset ? `translate(${contentOffsetX ?? 0}px, ${contentOffsetY ?? 0}px)` : undefined,
              transition: 'transform 0.15s ease',
            }}
          >
            {!hideTitle && !hideText && (
              <div
                data-heading-container="true"
                style={{
                  marginBottom: titleOffsetY !== undefined ? `${Math.max(0, 8 + titleOffsetY)}px` : '0.5rem',
                  transition: 'margin-bottom 0.15s ease',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <h3
                  data-heading="true"
                  style={{ fontSize: '1.15rem', fontWeight: 500, margin: 0, color: titleColor || textColor, textAlign: 'center' }}
                >
                  Compartir Invitación
                </h3>
              </div>
            )}
            {!hideSubtitle && !hideText && (
              <p
                data-body="true"
                style={{ fontSize: '0.875rem', opacity: 0.8, margin: '0 0 1.25rem 0', color: textColor, textAlign: 'center' }}
              >
                Guardá o compartí este enlace con tu grupo familiar.
              </p>
            )}
          </div>
        );
      })()}

      {(() => {
        const scale = (buttonBackgroundScale && buttonBackgroundScale > 0) ? buttonBackgroundScale / 100 : 1;
        const effectiveGap = buttonsGap !== undefined ? Math.max(0, buttonsGap) : 8;
        const negativeMargin = (buttonsGap !== undefined && buttonsGap < 0) ? buttonsGap : 0;
        const computedHeight = Math.round((hideButtonLabel ? 52 : 48) * scale);

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: buttonsLayout === 'column' ? 'column' : 'row',
              gap: `calc(${effectiveGap}px * var(--desktop-btn-scale, 1))`,
              justifyContent: buttonsAlign === 'left' ? 'flex-start' : buttonsAlign === 'right' ? 'flex-end' : 'center',
              alignItems: 'center',
              flexWrap: buttonsLayout === 'column' ? 'wrap' : 'nowrap',
              maxWidth: buttonsLayout === 'column' ? `calc(360px * var(--desktop-btn-scale, 1))` : (buttonBackgroundImage ? `calc(${Math.max(260, Math.round(360 * scale))}px * var(--desktop-btn-scale, 1))` : `calc(420px * var(--desktop-btn-scale, 1))`),
              margin: '0 auto',
              width: '100%',
              transform: (buttonsOffsetX || buttonsOffsetY)
                ? `translate(calc(${buttonsOffsetX ?? 0}px * var(--desktop-btn-scale, 1)), calc(${buttonsOffsetY ?? 0}px * var(--desktop-btn-scale, 1)))`
                : undefined,
              transition: 'transform 0.15s ease',
            }}
          >
            <button
              type="button"
              onClick={handleShare}
              style={{
                flex: buttonsLayout === 'column' ? undefined : '1 1 0',
                width: buttonsLayout === 'column' ? '100%' : 'auto',
                minHeight: buttonBackgroundImage ? `calc(${computedHeight}px * var(--desktop-btn-scale, 1))` : `calc(44px * min(var(--desktop-btn-scale, 1), 1.15))`,
                minWidth: 0,
                position: 'relative',
                padding: buttonBackgroundImage ? (hideButtonLabel ? '0' : '0.6rem 1.2rem') : '0.65rem 1rem',
                borderRadius: buttonBackgroundImage ? '0.75rem' : '0.5rem',
                border: 'none',
                background: buttonBackgroundImage ? 'transparent' : btnBg,
                backgroundImage: buttonBackgroundImage ? `url("${buttonBackgroundImage}")` : undefined,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                transform: `scale(calc(${scale} * var(--desktop-btn-scale, 1)))`,
                color: hideButtonLabel && buttonBackgroundImage ? 'transparent' : btnColor,
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: buttonBackgroundImage ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              {!(hideButtonLabel && buttonBackgroundImage) && 'Compartir'}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              aria-live="polite"
              style={{
                flex: buttonsLayout === 'column' ? undefined : '1 1 0',
                width: buttonsLayout === 'column' ? '100%' : 'auto',
                minHeight: '44px',
                minWidth: 0,
                marginLeft: (buttonsLayout !== 'column' && negativeMargin) ? `${negativeMargin}px` : undefined,
                padding: '0.65rem 1rem',
                borderRadius: '0.5rem',
                border: `1px solid ${borderColor}`,
                background: copied ? '#dcfce7' : 'transparent',
                color: copied ? '#166534' : textColor,
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              {copied ? '¡Copiado!' : 'Copiar Link'}
            </button>
          </div>
        );
      })()}
    </div>
  );
}
