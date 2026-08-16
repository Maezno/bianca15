/**
 * Módulo de lógica de invitados (Plataforma Multi-Evento).
 */

export { createGroup } from "./create-group";
export { createGuest } from "./create-guest";
export { getGroupByToken } from "./get-group-by-token";
export type {
  CreateGroupInput,
  CreateGuestInput,
  PublicGuestGroup,
  PublicGuest,
  PublicConfirmation,
  CreateGroupResult,
  CreateGuestResult,
} from "./types";
