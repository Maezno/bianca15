'use client';

import React from 'react';

export type ActionButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ActionButtonProps {
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  variant?: ActionButtonVariant;
  primaryColor?: string;
  textColor?: string;
  customBg?: string;
  customColor?: string;
  backgroundImage?: string;
  backgroundScale?: number;
  hideLabel?: boolean;
  fullWidth?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export function ActionButton({
  label,
  icon,
  href,
  onClick,
  variant = 'primary',
  primaryColor = '#9333ea',
  textColor = '#ffffff',
  customBg,
  customColor,
  backgroundImage,
  backgroundScale,
  hideLabel = false,
  fullWidth = false,
  target,
  rel,
  ariaLabel,
  style,
}: ActionButtonProps) {
  const scale = (backgroundScale && backgroundScale > 0) ? backgroundScale / 100 : 1;
  const baseHeight = hideLabel ? 52 : 48;
  const computedHeight = backgroundImage ? Math.round(baseHeight * scale) : 44;
  const computedMinWidth = hideLabel && !style?.flex && !fullWidth ? Math.round(140 * scale) : 0;

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: hideLabel ? 0 : '0.5rem',
      padding: backgroundImage ? (hideLabel ? '0' : '0.6rem 1.2rem') : 'calc(0.65rem * var(--desktop-btn-visual-scale, min(var(--desktop-btn-scale, 1), 1.15))) calc(1.25rem * var(--desktop-btn-visual-scale, min(var(--desktop-btn-scale, 1), 1.15)))',
      borderRadius: backgroundImage ? '0.75rem' : '99px',
      fontSize: 'calc(0.875rem * var(--desktop-btn-visual-scale, min(var(--desktop-btn-scale, 1), 1.15)))',
      fontWeight: 700,
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      boxSizing: 'border-box',
      width: fullWidth ? '100%' : 'auto',
      minWidth: computedMinWidth ? `calc(${computedMinWidth}px * var(--desktop-btn-scale, 1))` : 0,
      minHeight: backgroundImage
        ? `calc(${computedHeight}px * var(--desktop-btn-scale, 1))`
        : `calc(44px * var(--desktop-btn-visual-scale, min(var(--desktop-btn-scale, 1), 1.15)))`,
      maxWidth: 'min(100%, calc(100vw - 32px))',
      textAlign: 'center',
      position: 'relative',
    };

    if (backgroundImage) {
      return {
        ...base,
        backgroundColor: 'transparent',
        color: hideLabel ? 'transparent' : (customColor || textColor),
        boxShadow: 'none',
        ...style,
      };
    }

    if (customBg) {
      return {
        ...base,
        background: customBg,
        color: customColor || textColor,
        border: 'none',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        ...style,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...base,
          background: primaryColor,
          color: textColor,
          boxShadow: `0 4px 14px ${primaryColor}40`,
          ...style,
        };
      case 'secondary':
        return {
          ...base,
          background: `${primaryColor}15`,
          color: primaryColor,
          border: `1px solid ${primaryColor}40`,
          ...style,
        };
      case 'outline':
        return {
          ...base,
          background: 'transparent',
          color: primaryColor,
          border: `1.5px solid ${primaryColor}`,
          ...style,
        };
      case 'ghost':
        return {
          ...base,
          background: 'transparent',
          color: primaryColor,
          ...style,
        };
    }
  };

  const innerContent = (
    <>
      {backgroundImage && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            transform: `scale(calc(${scale} * var(--desktop-btn-visual-scale, var(--desktop-btn-scale, 1))))`,
            transformOrigin: 'center',
            pointerEvents: 'none',
          }}
        />
      )}
      {!hideLabel && (
        <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          {icon && <span aria-hidden="true">{icon}</span>}
          <span>{label}</span>
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target || (href.startsWith('http') ? '_blank' : undefined)}
        rel={rel || (href.startsWith('http') ? 'noreferrer noopener' : undefined)}
        style={getStyles()}
        aria-label={ariaLabel || label}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={getStyles()}
      aria-label={ariaLabel || label}
    >
      {innerContent}
    </button>
  );
}



