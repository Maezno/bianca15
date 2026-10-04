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
  hideLabel?: boolean;
  fullWidth?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
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
  hideLabel = false,
  fullWidth = false,
  target,
  rel,
  ariaLabel,
}: ActionButtonProps) {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: hideLabel ? 0 : '0.5rem',
      padding: backgroundImage ? (hideLabel ? '0.85rem 1.75rem' : '0.7rem 1.4rem') : '0.65rem 1.25rem',
      borderRadius: backgroundImage ? '0.75rem' : '99px',
      fontSize: '0.875rem',
      fontWeight: 700,
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      boxSizing: 'border-box',
      width: fullWidth ? '100%' : 'auto',
      minWidth: backgroundImage ? '140px' : undefined,
      minHeight: '44px',
      maxWidth: '100%',
      textAlign: 'center',
    };

    if (backgroundImage) {
      return {
        ...base,
        backgroundColor: 'transparent',
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        color: customColor || textColor,
        boxShadow: 'none',
      };
    }

    if (customBg) {
      return {
        ...base,
        background: customBg,
        color: customColor || textColor,
        border: 'none',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          ...base,
          background: primaryColor,
          color: textColor,
          boxShadow: `0 4px 14px ${primaryColor}40`,
        };
      case 'secondary':
        return {
          ...base,
          background: `${primaryColor}15`,
          color: primaryColor,
          border: `1px solid ${primaryColor}40`,
        };
      case 'outline':
        return {
          ...base,
          background: 'transparent',
          color: primaryColor,
          border: `1.5px solid ${primaryColor}`,
        };
      case 'ghost':
        return {
          ...base,
          background: 'transparent',
          color: primaryColor,
        };
    }
  };

  if (href) {
    return (
      <a
        href={href}
        target={target || (href.startsWith('http') ? '_blank' : undefined)}
        rel={rel || (href.startsWith('http') ? 'noreferrer noopener' : undefined)}
        style={getStyles()}
        aria-label={ariaLabel || label}
      >
        {!hideLabel && icon && <span aria-hidden="true">{icon}</span>}
        {!hideLabel && <span>{label}</span>}
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
      {!hideLabel && icon && <span aria-hidden="true">{icon}</span>}
      {!hideLabel && <span>{label}</span>}
    </button>
  );
}
