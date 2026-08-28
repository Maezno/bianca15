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
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: textColor }}>
        Compartir Invitación
      </h3>
      <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: '0 0 1.25rem 0', color: textColor }}>
        Guardá o compartí este enlace con tu grupo familiar.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button
          onClick={handleShare}
          style={{
            flex: 1,
            padding: '0.65rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: btnBg,
            color: btnColor,
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span>📲</span> Compartir
        </button>

        <button
          onClick={handleCopy}
          style={{
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
          {copied ? '✓ ¡Copiado!' : '📋 Copiar Link'}
        </button>
      </div>
    </div>
  );
}
