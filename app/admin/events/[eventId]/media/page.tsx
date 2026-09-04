'use client';

/**
 * app/admin/events/[eventId]/media/page.tsx
 * Sección administrativa: Biblioteca Multimedia por Evento (Hito 9).
 * Soporta almacenamiento aislado en Supabase Storage, drag & drop, selección de portada y eliminación segura.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getAdminEventById, updateEvent } from '@/lib/admin/events';
import { getEventMedia, uploadEventMedia, deleteEventMedia } from '@/lib/admin/media';
import type { AdminEventMedia } from '@/lib/admin/types';
import type { EventRow } from '@/types/database';

export default function EventMediaPage() {
  const params = useParams();
  const eventId = params?.eventId as string;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [mediaList, setMediaList] = useState<AdminEventMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Modal para confirmación de eliminación con advertencia si está en uso
  const [deleteTarget, setDeleteTarget] = useState<AdminEventMedia | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const { event: ev } = await getAdminEventById(eventId);
      if (ev) setEvent(ev);

      const items = await getEventMedia(eventId);
      setMediaList(items);
    } catch (err) {
      console.error('Error al cargar datos de multimedia:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStatus(`Subiendo archivo ${i + 1} de ${files.length}: ${file.name}...`);

      const formData = new FormData();
      formData.append('eventId', eventId);
      formData.append('file', file);

      const result = await uploadEventMedia(formData);

      if (result.success && result.media) {
        successCount++;
        setMediaList((prev) => [result.media!, ...prev]);
      } else {
        errors.push(`${file.name}: ${result.error || 'Error desconocido'}`);
      }
    }

    setUploading(false);
    setUploadStatus(null);

    if (successCount > 0) {
      setSuccessMessage(`✓ Se subieron ${successCount} imagen(es) con éxito.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }

    if (errors.length > 0) {
      setErrorMessage(`Hubo errores al subir:\n${errors.join('\n')}`);
    }
  };

  const handleSetCover = async (media: AdminEventMedia) => {
    if (!event) return;
    try {
      const isAlreadyCover = event.cover_image === media.publicUrl;
      const newCover = isAlreadyCover ? null : media.publicUrl;

      await updateEvent({
        id: event.id,
        coverImage: newCover || undefined,
      });

      setEvent((prev) => (prev ? { ...prev, cover_image: newCover } : null));

      setMediaList((prev) =>
        prev.map((m) => ({
          ...m,
          isCover: m.id === media.id ? !isAlreadyCover : false,
          isUsed: m.id === media.id ? !isAlreadyCover : m.isUsed,
        }))
      );

      setSuccessMessage(
        isAlreadyCover
          ? 'Imagen de portada desvinculada.'
          : '¡Imagen configurada como portada principal del evento!'
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setErrorMessage('No se pudo actualizar la imagen de portada.');
    }
  };

  const handleCopyUrl = async (media: AdminEventMedia) => {
    try {
      await navigator.clipboard.writeText(media.publicUrl);
      setCopiedId(media.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setErrorMessage('No se pudo copiar la URL al portapapeles.');
    }
  };

  const confirmDelete = async (force = false) => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const result = await deleteEventMedia(deleteTarget.id, eventId, force);

    setIsDeleting(false);

    if (result.success) {
      setMediaList((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      if (deleteTarget.isCover && event) {
        setEvent((prev) => (prev ? { ...prev, cover_image: null } : null));
      }
      setDeleteTarget(null);
      setSuccessMessage('Imagen eliminada correctamente.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      if (result.inUseWarning && !force) {
        // La advertencia ya se muestra en el modal activo
      } else {
        setErrorMessage(result.error || 'No se pudo eliminar la imagen.');
        setDeleteTarget(null);
      }
    }
  };

  // Cálculo de estadísticas de almacenamiento
  const totalBytes = mediaList.reduce((acc, m) => acc + (m.fileSize || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <AdminLayout
      user={{ id: '1', email: 'admin@bianca15.com', name: 'Administrador', role: 'super_admin' }}
      eventId={eventId}
      eventName={event?.name || 'Multimedia'}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            🖼️ Biblioteca Multimedia
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
            Administrá imágenes, portada y recursos visuales para <strong>{event?.name}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div
            style={{
              padding: '0.5rem 0.85rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              color: '#475569',
              fontWeight: 600,
            }}
          >
            📸 {mediaList.length} archivo(s) · {totalMB} MB
          </div>

          <Link
            href={`/admin/events/${eventId}/editor`}
            style={{
              padding: '0.5rem 0.9rem',
              background: '#f3e8ff',
              color: '#7e22ce',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            ✏️ Volver al Editor
          </Link>
        </div>
      </div>

      {/* Upload Zone / Drag & Drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: isDragOver ? '2px dashed #9333ea' : '2px dashed #cbd5e1',
          background: isDragOver ? '#faf5ff' : '#ffffff',
          borderRadius: '1rem',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />

        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📤</div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
          Arrastrá tus imágenes aquí o hacé clic para explorar
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 1.25rem auto' }}>
          Formatos compatibles: <strong>JPG, PNG, WebP</strong>. Límite máximo de <strong>5 MB</strong> por archivo.
          Las imágenes quedan aisladas y asociadas exclusivamente a este evento.
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: '0.5rem',
            background: '#9333ea',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.25)',
          }}
        >
          {uploading ? '⏳ Subiendo...' : 'Seleccionar imágenes del equipo'}
        </button>

        {uploadStatus && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#f3e8ff',
              color: '#7e22ce',
              borderRadius: '0.5rem',
              display: 'inline-block',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            whiteSpace: 'pre-line',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Cargando biblioteca multimedia...
        </div>
      ) : mediaList.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            padding: '4rem 1.5rem',
            textAlign: 'center',
            color: '#64748b',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            No hay imágenes subidas
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
            Subí fotos para utilizarlas como portada de la invitación o en las secciones de tu diseño.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {mediaList.map((media) => {
            const isCover = Boolean(
              media.isCover || (event?.cover_image && event.cover_image === media.publicUrl)
            );

            return (
              <div
                key={media.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  border: isCover ? '2px solid #9333ea' : '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '160px',
                    background: '#0f172a',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={media.publicUrl}
                    alt={media.fileName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />

                  {/* Badges */}
                  {isCover && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: '#9333ea',
                        color: '#ffffff',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      }}
                    >
                      👑 Portada
                    </div>
                  )}

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#ffffff',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '0.35rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {(media.fileSize / 1024).toFixed(0)} KB
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={media.fileName}
                  >
                    {media.fileName}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    {new Date(media.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <button
                      onClick={() => handleSetCover(media)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '0.4rem',
                        border: '1px solid #e2e8f0',
                        background: isCover ? '#f3e8ff' : '#ffffff',
                        color: isCover ? '#7e22ce' : '#334155',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isCover ? '✓ Quitar de portada' : '👑 Usar como portada'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleCopyUrl(media)}
                        style={{
                          flex: 1,
                          padding: '0.4rem',
                          borderRadius: '0.4rem',
                          border: '1px solid #e2e8f0',
                          background: copiedId === media.id ? '#dcfce7' : '#f8fafc',
                          color: copiedId === media.id ? '#166534' : '#475569',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedId === media.id ? '✓ ¡Copiado!' : '📋 Copiar URL'}
                      </button>

                      <a
                        href={media.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={media.fileName}
                        style={{
                          padding: '0.4rem 0.6rem',
                          borderRadius: '0.4rem',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          color: '#475569',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Ver o descargar"
                      >
                        👁️
                      </a>

                      <button
                        onClick={() => setDeleteTarget(media)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          borderRadius: '0.4rem',
                          border: '1px solid #fee2e2',
                          background: '#fff1f2',
                          color: '#e11d48',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        title="Eliminar imagen"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 70,
            padding: '1rem',
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1rem',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
              ¿Eliminar esta imagen?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
              Se eliminará de forma permanente el archivo <strong>{deleteTarget.fileName}</strong> del almacenamiento de este evento.
            </p>

            {deleteTarget.isCover && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  padding: '0.85rem',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  textAlign: 'left',
                  marginBottom: '1.25rem',
                  lineHeight: 1.4,
                }}
              >
                ⚠️ <strong>Esta imagen está configurada como portada de la invitación.</strong> Si la eliminás, la invitación quedará sin imagen principal hasta que elijas un reemplazo.
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(true)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '0.65rem',
                  borderRadius: '0.5rem',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
