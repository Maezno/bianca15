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
      gap: '0.5rem',
      padding: '0.65rem 1.25rem',
      borderRadius: '99px',
      fontSize: '0.875rem',
      fontWeight: 700,
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      boxSizing: 'border-box',
      width: fullWidth ? '100%' : 'auto',
      textAlign: 'center',
    };

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
        {icon && <span aria-hidden="true">{icon}</span>}
        <span>{label}</span>
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
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
