'use server';

/**
 * lib/admin/media.ts
 * Gestión y almacenamiento de recursos multimedia por evento (Hito 9).
 * Soporta Supabase Storage con bucket 'event-assets' y aislamiento estricto por event_id.
 * Incluye almacenamiento local en memoria como fallback de desarrollo / testing.
 */

import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminUser } from './auth';
import type { AdminEventMedia } from './types';
import type { EventMediaRow, EventRow } from '@/types/database';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Store local en memoria para desarrollo/demo y testing sin conexión
const LOCAL_MEDIA_STORE: Map<string, AdminEventMedia[]> = new Map([
  [
    '11111111-1111-1111-1111-111111111111',
    [
      {
        id: 'med-0001',
        eventId: '11111111-1111-1111-1111-111111111111',
        storagePath: '11111111-1111-1111-1111-111111111111/cover-wonderland.webp',
        publicUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop',
        fileName: 'portada-wonderland.webp',
        mimeType: 'image/webp',
        fileSize: 245100,
        width: 1200,
        height: 800,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isCover: true,
        isUsed: true,
        usedIn: ['Portada (Hero)'],
      },
      {
        id: 'med-0002',
        eventId: '11111111-1111-1111-1111-111111111111',
        storagePath: '11111111-1111-1111-1111-111111111111/salon-las-camelias.webp',
        publicUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80&auto=format&fit=crop',
        fileName: 'salon-camelias.webp',
        mimeType: 'image/webp',
        fileSize: 184500,
        width: 800,
        height: 600,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        isCover: false,
        isUsed: false,
        usedIn: [],
      },
    ],
  ],
  [
    '22222222-2222-2222-2222-222222222222',
    [
      {
        id: 'med-0003',
        eventId: '22222222-2222-2222-2222-222222222222',
        storagePath: '22222222-2222-2222-2222-222222222222/boda-juan-maria.webp',
        publicUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80&auto=format&fit=crop',
        fileName: 'boda-portada.webp',
        mimeType: 'image/webp',
        fileSize: 312000,
        width: 1200,
        height: 800,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        isCover: true,
        isUsed: true,
        usedIn: ['Portada (Hero)'],
      },
    ],
  ],
]);

/**
 * Obtiene la biblioteca de medios del evento especificado.
 */
export async function getEventMedia(eventId: string): Promise<AdminEventMedia[]> {
  const user = await getCurrentAdminUser();
  if (!user) return [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return LOCAL_MEDIA_STORE.get(eventId) || [];
  }

  try {
    const supabase = await createClient();

    // Obtener evento para verificar si alguna imagen es cover_image
    const { data: eventData } = await supabase
      .from('events')
      .select('cover_image')
      .eq('id', eventId)
      .single();

    const currentCover = (eventData as Partial<EventRow> | null)?.cover_image;

    const { data: mediaList, error } = await supabase
      .from('event_media')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error || !mediaList) {
      console.warn('Fallback a store local al consultar event_media:', error?.message);
      return LOCAL_MEDIA_STORE.get(eventId) || [];
    }

    return mediaList.map((row: EventMediaRow) => {
      const isCover = Boolean(currentCover && (currentCover === row.public_url || currentCover.includes(row.storage_path)));
      const usedIn: string[] = [];
      if (isCover) usedIn.push('Portada (Hero)');

      return {
        id: row.id,
        eventId: row.event_id,
        storagePath: row.storage_path,
        publicUrl: row.public_url,
        fileName: row.file_name,
        mimeType: row.mime_type,
        fileSize: row.file_size,
        width: row.width,
        height: row.height,
        createdAt: row.created_at,
        isCover,
        isUsed: usedIn.length > 0,
        usedIn,
      };
    });
  } catch (err) {
    console.error('Error al obtener medios del evento:', err);
    return LOCAL_MEDIA_STORE.get(eventId) || [];
  }
}

/**
 * Sube una nueva imagen asociada a un evento con aislamiento estricto en Storage.
 */
export async function uploadEventMedia(
  formData: FormData
): Promise<{ success: boolean; media?: AdminEventMedia; error?: string }> {
  const user = await getCurrentAdminUser();
  if (!user) {
    return { success: false, error: 'No autorizado. Se requiere inicio de sesión.' };
  }

  const eventId = formData.get('eventId') as string | null;
  const file = formData.get('file') as File | null;

  if (!eventId || !file) {
    return { success: false, error: 'Parámetros insuficientes (eventId o archivo ausente).' };
  }

  // Validaciones
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Formato '${file.type}' no soportado. Se permiten únicamente JPG, PNG y WebP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `El archivo supera el límite permitido de 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB).`,
    };
  }

  // Generar nombre de archivo seguro
  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
  const ext = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'webp';
  const fileUuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `med-${Date.now()}`;
  const storagePath = `${eventId}/${fileUuid}.${ext}`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Fallback local: crear objeto representativo
    const localMedia: AdminEventMedia = {
      id: fileUuid,
      eventId,
      storagePath,
      publicUrl: URL.createObjectURL ? URL.createObjectURL(file) : `https://placeholder.storage/event-assets/${storagePath}`,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
      width: 1200,
      height: 800,
      createdAt: new Date().toISOString(),
      isCover: false,
      isUsed: false,
      usedIn: [],
    };

    const currentList = LOCAL_MEDIA_STORE.get(eventId) || [];
    LOCAL_MEDIA_STORE.set(eventId, [localMedia, ...currentList]);

    return { success: true, media: localMedia };
  }

  try {
    const supabase = await createClient();

    // 1. Subir a Supabase Storage bucket 'event-assets'
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('event-assets')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir a Supabase Storage:', uploadError);
      return { success: false, error: `Error al subir el archivo: ${uploadError.message}` };
    }

    // 2. Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('event-assets')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Registrar metadatos en tabla event_media
    const { data: insertedMedia, error: dbError } = await supabase
      .from('event_media')
      .insert({
        event_id: eventId,
        storage_path: storagePath,
        public_url: publicUrl,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
      })
      .select()
      .single();

    if (dbError || !insertedMedia) {
      console.error('Error al registrar metadatos en event_media:', dbError);
      // Retornar de todos modos el recurso con id temporal
      const fallbackMedia: AdminEventMedia = {
        id: fileUuid,
        eventId,
        storagePath,
        publicUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        width: null,
        height: null,
        createdAt: new Date().toISOString(),
      };
      return { success: true, media: fallbackMedia };
    }

    const created: AdminEventMedia = {
      id: insertedMedia.id,
      eventId: insertedMedia.event_id,
      storagePath: insertedMedia.storage_path,
      publicUrl: insertedMedia.public_url,
      fileName: insertedMedia.file_name,
      mimeType: insertedMedia.mime_type,
      fileSize: insertedMedia.file_size,
      width: insertedMedia.width,
      height: insertedMedia.height,
      createdAt: insertedMedia.created_at,
      isCover: false,
      isUsed: false,
      usedIn: [],
    };

    return { success: true, media: created };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado durante la subida.';
    console.error('Excepción en uploadEventMedia:', err);
    return { success: false, error: message };
  }
}

/**
 * Elimina una imagen de la biblioteca y del almacenamiento.
 */
export async function deleteEventMedia(
  mediaId: string,
  eventId: string,
  force = false
): Promise<{ success: boolean; error?: string; inUseWarning?: boolean }> {
  const user = await getCurrentAdminUser();
  if (!user) {
    return { success: false, error: 'No autorizado.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const list = LOCAL_MEDIA_STORE.get(eventId) || [];
    const target = list.find((m) => m.id === mediaId);

    if (target?.isCover && !force) {
      return {
        success: false,
        inUseWarning: true,
        error: 'Esta imagen está siendo utilizada como portada de la invitación.',
      };
    }

    LOCAL_MEDIA_STORE.set(
      eventId,
      list.filter((m) => m.id !== mediaId)
    );
    return { success: true };
  }

  try {
    const supabase = await createClient();

    // Obtener la imagen
    const { data: media, error: findError } = await supabase
      .from('event_media')
      .select('*')
      .eq('id', mediaId)
      .eq('event_id', eventId)
      .single();

    if (findError || !media) {
      return { success: false, error: 'Imagen no encontrada o no pertenece al evento.' };
    }

    // Verificar si está en uso en el evento
    const { data: eventData } = await supabase
      .from('events')
      .select('cover_image')
      .eq('id', eventId)
      .single();

    const currentCover = (eventData as Partial<EventRow> | null)?.cover_image;
    const isInUse = Boolean(currentCover && (currentCover === media.public_url || currentCover.includes(media.storage_path)));

    if (isInUse && !force) {
      return {
        success: false,
        inUseWarning: true,
        error: 'Esta imagen está siendo utilizada como portada de la invitación.',
      };
    }

    // Si era portada y se fuerza el borrado, desvincularla de events
    if (isInUse && force) {
      await supabase
        .from('events')
        .update({ cover_image: null })
        .eq('id', eventId);
    }

    // Borrar de storage
    await supabase.storage.from('event-assets').remove([media.storage_path]);

    // Borrar registro de event_media
    const { error: deleteError } = await supabase
      .from('event_media')
      .delete()
      .eq('id', mediaId)
      .eq('event_id', eventId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al eliminar imagen.';
    return { success: false, error: message };
  }
}
