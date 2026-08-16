import { createClient } from "@/lib/supabase/server";
import type { CreateGuestInput, CreateGuestResult } from "@/lib/guests/types";

/**
 * Asocia una persona a un grupo de invitados existente.
 *
 * Flujo:
 *   1. Valida los datos de entrada
 *   2. Verifica que el grupo exista
 *   3. Inserta el invitado en guests
 *   4. Devuelve el invitado creado
 *
 * Solo debe llamarse desde Server Actions o Route Handlers.
 * Nunca desde componentes cliente.
 *
 * @throws {Error} Si la validación falla, el grupo no existe, o Supabase reporta un error.
 */
export async function createGuest(
  input: CreateGuestInput
): Promise<CreateGuestResult> {
  // ── 1. Validación ──────────────────────────────────────────────────────────
  const name = input.name?.trim();
  if (!name) throw new Error("El nombre del invitado es obligatorio.");

  if (!input.groupId?.trim()) {
    throw new Error("El ID del grupo es obligatorio.");
  }

  const supabase = await createClient();

  // ── 2. Verificar que el grupo exista ───────────────────────────────────────
  const { data: group, error: groupError } = await supabase
    .from("guest_groups")
    .select("id")
    .eq("id", input.groupId)
    .maybeSingle();

  if (groupError) throw new Error(`Error al verificar el grupo: ${groupError.message}`);
  if (!group) throw new Error(`El grupo con ID "${input.groupId}" no existe.`);

  // ── 3. Insertar invitado ───────────────────────────────────────────────────
  const { data, error } = await supabase
    .from("guests")
    .insert({
      group_id: input.groupId,
      name,
    })
    .select("id, group_id, name, created_at")
    .single();

  if (error) throw new Error(`Error al crear el invitado: ${error.message}`);
  if (!data) throw new Error("No se recibió respuesta al crear el invitado.");

  return {
    id: data.id,
    groupId: data.group_id,
    name: data.name,
    createdAt: data.created_at,
  };
}
