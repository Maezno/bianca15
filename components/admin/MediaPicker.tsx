'use client';

/**
 * components/admin/MediaPicker.tsx
 * Selector modal de imágenes reutilizable para cualquier sección del editor.
 * Permite seleccionar una imagen existente de la biblioteca del evento o subir una nueva.
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { AdminEventMedia } from '@/lib/admin/types';
import { getEventMedia, uploadEventMedia } from '@/lib/admin/media';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaUrl: string, mediaItem?: AdminEventMedia) => void;
  eventId: string;
  currentUrl?: string;
  title?: string;
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  eventId,
  currentUrl,
  title = 'Seleccionar Imagen',
}: MediaPickerProps) {
  const [mediaList, setMediaList] = useState<AdminEventMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentUrl || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedUrl(currentUrl || '');
    setErrorMessage(null);
    loadMedia();
  }, [isOpen, eventId, currentUrl]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const items = await getEventMedia(eventId);
      setMediaList(items);
    } catch (err) {
      console.error('Error cargando biblioteca:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const processUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress('Subiendo imagen...');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('eventId', eventId);
    formData.append('file', file);

    const result = await uploadEventMedia(formData);

    if (!result.success || !result.media) {
      setErrorMessage(result.error || 'Error al subir la imagen.');
      setUploading(false);
      setUploadProgress(null);
      return;
    }

    setUploadProgress('¡Subida completada!');
    setMediaList((prev) => [result.media!, ...prev]);
    setSelectedUrl(result.media.publicUrl);

    setTimeout(() => {
      setUploading(false);
      setUploadProgress(null);
    }, 1000);
  };

  const handleConfirm = () => {
    if (!selectedUrl) return;
    const selectedItem = mediaList.find((m) => m.publicUrl === selectedUrl);
    onSelect(selectedUrl, selectedItem);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '780px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              🖼️ {title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Elegí un recurso de la biblioteca del evento o subí un archivo nuevo.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Upload bar */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#475569' }}>
            Formatos admitidos: <strong>JPG, PNG, WebP</strong> (Máx. 5MB)
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: '#9333ea',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {uploading ? '⏳ Subiendo...' : '📤 Subir nueva imagen'}
            </button>
          </div>
        </div>

        {uploadProgress && (
          <div
            style={{
              padding: '0.5rem 1.5rem',
              background: '#f0fdf4',
              color: '#166534',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            ✓ {uploadProgress}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '0.5rem 1.5rem',
              background: '#fef2f2',
              color: '#991b1b',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Media Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              Cargando biblioteca multimedia...
            </div>
          ) : mediaList.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                border: '2px dashed #cbd5e1',
                borderRadius: '0.75rem',
                color: '#64748b',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>No hay imágenes en este evento</p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
                Subí una foto para comenzar a personalizar tu invitación.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  background: '#9333ea',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Subir primera imagen
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1rem',
              }}
            >
              {mediaList.map((item) => {
                const isSelected = selectedUrl === item.publicUrl;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.publicUrl)}
                    style={{
                      border: isSelected ? '3px solid #9333ea' : '1px solid #e2e8f0',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#f8fafc',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      boxShadow: isSelected ? '0 0 0 2px #d8b4fe' : 'none',
                    }}
                  >
                    <div style={{ width: '100%', height: '110px', background: '#0f172a', position: 'relative' }}>
                      <img
                        src={item.publicUrl}
                        alt={item.fileName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: '#9333ea',
                            color: '#ffffff',
                            borderRadius: '99px',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={item.fileName}
                      >
                        {item.fileName}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '2px' }}>
                        {(item.fileSize / 1024).toFixed(0)} KB
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div>
            {selectedUrl && (
              <button
                onClick={() => {
                  setSelectedUrl('');
                  onSelect('');
                  onClose();
                }}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Quitar imagen
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedUrl}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                background: selectedUrl ? '#9333ea' : '#cbd5e1',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: selectedUrl ? 'pointer' : 'not-allowed',
              }}
            >
              Seleccionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
