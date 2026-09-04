'use client';

/**
 * components/admin/QrModal.tsx
 * Modal de visualización y descarga de Códigos QR en alta resolución (Hito 9).
 * Genera PNG nítido mediante 'qrcode' con opción de descarga directa en pantalla e impresión.
 */

import React, { useState, useEffect } from 'react';
import { generateQrDataUrl, getQrFallbackUrl } from '@/lib/admin/qr';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
  invitationUrl: string;
  title?: string;
  subtitle?: string;
}

export function QrModal({
  isOpen,
  onClose,
  groupName,
  invitationUrl,
  title = 'Código QR',
  subtitle,
}: QrModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const displaySubtitle = subtitle || groupName || 'Invitación Digital';

  const fullUrl =
    typeof window !== 'undefined' && invitationUrl.startsWith('/')
      ? `${window.location.origin}${invitationUrl}`
      : invitationUrl;

  useEffect(() => {
    if (!isOpen || !fullUrl) return;

    let isMounted = true;
    // Fallback inmediato
    setQrDataUrl(getQrFallbackUrl(fullUrl, 280));

    // Generar con biblioteca qrcode nativa de alta resolución
    generateQrDataUrl(fullUrl, { size: 600, margin: 2, errorCorrectionLevel: 'M' })
      .then((dataUrl) => {
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        console.error('Error generando QR de alta resolución:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, fullUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    setDownloading(true);

    const safeName = (groupName || title || 'qr')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-${safeName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloading(false), 800);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - ${displaySubtitle}`,
          text: `¡Hola! Te compartimos el enlace:`,
          url: fullUrl,
        });
      } catch {
        // Cancelled or unsupported
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '430px',
          width: '100%',
          padding: '1.75rem',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
          {displaySubtitle}
        </p>

        {/* QR Image Frame */}
        <div
          style={{
            background: '#ffffff',
            border: '2px solid #f1f5f9',
            borderRadius: '1rem',
            padding: '1.25rem',
            display: 'inline-block',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}
        >
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR para ${displaySubtitle}`}
              width={240}
              height={240}
              style={{ display: 'block', margin: '0 auto', borderRadius: '0.25rem' }}
            />
          ) : (
            <div
              style={{
                width: '240px',
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '0.85rem',
              }}
            >
              Generando código QR...
            </div>
          )}
        </div>

        {/* URL Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
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
          {/* Main Download Button */}
          <button
            onClick={handleDownload}
            disabled={!qrDataUrl || downloading}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: '#9333ea',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              border: 'none',
              cursor: qrDataUrl ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
            }}
          >
            {downloading ? 'Descargando...' : '⬇️ Descargar Código QR (PNG)'}
          </button>

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
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              🔗 Abrir Link
            </a>
          </div>

          <button
            onClick={handleShare}
            style={{
              width: '100%',
              padding: '0.55rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📲 Compartir
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
