'use client';

import React, { useState } from 'react';
import { getQrDataUrl } from '@/lib/admin/qr';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  invitationUrl: string;
}

export function QrModal({ isOpen, onClose, groupName, invitationUrl }: QrModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${invitationUrl}` : invitationUrl;
  const qrUrl = getQrDataUrl(fullUrl, 280);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitación para ${groupName}`,
          text: `¡Hola ${groupName}! Te compartimos tu invitación digital:`,
          url: fullUrl,
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
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '420px',
          width: '100%',
          padding: '1.75rem',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          Código QR de Invitación
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          {groupName}
        </p>

        {/* QR Image */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            padding: '1rem',
            display: 'inline-block',
            marginBottom: '1.25rem',
          }}
        >
          <img
            src={qrUrl}
            alt={`QR para ${groupName}`}
            width={240}
            height={240}
            style={{ display: 'block', margin: '0 auto', borderRadius: '0.25rem' }}
          />
        </div>

        {/* URL Box */}
        <div
          style={{
            background: '#f1f5f9',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.75rem',
            color: '#475569',
            wordBreak: 'break-all',
            marginBottom: '1.25rem',
            textAlign: 'left',
          }}
        >
          {fullUrl}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                background: copied ? '#dcfce7' : '#ffffff',
                color: copied ? '#166534' : '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ ¡Copiado!' : '📋 Copiar Link'}
            </button>
            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '0.5rem',
                background: '#9333ea',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              🔗 Abrir
            </a>
          </div>

          <button
            onClick={handleShare}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📲 Compartir Invitación
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginTop: '0.25rem',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
