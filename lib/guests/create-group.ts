import { createClient } from "@/lib/supabase/server";
import { generateToken } from "@/lib/utils/token";
import type { CreateGroupInput, CreateGroupResult } from "@/lib/guests/types";

/**
 * Crea un nuevo grupo de invitados asociado a un evento en Supabase.
 *
 * Flujo:
 *   1. Valida los datos de entrada y el eventId
 *   2. Verifica que el evento exista
 *   3. Genera un token URL-safe único
 *   4. Inserta el grupo en guest_groups con su event_id
 *   5. Devuelve el grupo creado
 */
export async function createGroup(
  input: CreateGroupInput
): Promise<CreateGroupResult> {
  // ── 1. Validación ──────────────────────────────────────────────────────────
  if (!input.eventId?.trim()) {
    throw new Error("El ID del evento es obligatorio para crear un grupo.");
  }

  const name = input.name?.trim();
  if (!name) throw new Error("El nombre del grupo es obligatorio.");

  if (input.maxGuests < 1 || !Number.isInteger(input.maxGuests)) {
    throw new Error("El cupo máximo debe ser un número entero mayor a 0.");
  }

  const supabase = await createClient();

  // ── 2. Verificar que el evento exista ───────────────────────────────────────
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", input.eventId)
    .maybeSingle();

  if (eventError) {
    throw new Error(`Error al verificar el evento: ${eventError.message}`);
  }
  if (!event) {
    throw new Error(`El evento con ID "${input.eventId}" no existe.`);
  }

  // ── 3. Generar token único ─────────────────────────────────────────────────
  let token: string;
  let attempts = 0;
  const MAX_ATTEMPTS = 5;

  do {
    token = generateToken();
    const { data: existing } = await supabase
      .from("guest_groups")
      .select("id")
      .eq("token", token)
      .maybeSingle();

    if (!existing) break;
    attempts++;
  } while (attempts < MAX_ATTEMPTS);

  if (attempts >= MAX_ATTEMPTS) {
    throw new Error("No se pudo generar un token único. Intentá de nuevo.");
  }

  // ── 4. Insertar grupo ──────────────────────────────────────────────────────
  const { data, error } = await supabase
    .from("guest_groups")
    .insert({
      event_id: input.eventId,
      name,
      token: token!,
      max_guests: input.maxGuests,
      phone: input.phone?.trim() ?? null,
      notes: input.notes?.trim() ?? null,
    })
    .select("id, event_id, name, token, max_guests, created_at")
    .single();

  if (error) throw new Error(`Error al crear el grupo: ${error.message}`);
  if (!data) throw new Error("No se recibió respuesta al crear el grupo.");

  return {
    id: data.id,
    eventId: data.event_id,
    name: data.name,
    token: data.token,
    maxGuests: data.max_guests,
    createdAt: data.created_at,
  };
}
