import type { EventConfig } from "@/types/event";

/**
 * Configuración del evento.
 *
 * Todos los datos del evento se centralizan aquí para que puedan modificarse
 * sin tocar los componentes visuales.
 *
 * IMPORTANTE: Completar con los datos reales del evento antes del lanzamiento.
 */
export const eventConfig: EventConfig = {
  name: "Bianca",
  title: "Mis 15 años",

  // TODO: Completar con la fecha real del evento (formato ISO 8601)
  date: "",
  // TODO: Completar con la hora de inicio (formato HH:mm)
  startTime: "",

  // TODO: Completar con el nombre del salón/lugar
  location: "",
  // TODO: Completar con la dirección completa
  address: "",

  // TODO: Completar con la URL real de Google Maps
  mapsUrl: "",
  // TODO: Completar con la URL real de Waze
  wazeUrl: "",

  // TODO: Completar con el dress code del evento
  dressCode: "",

  // TODO: Completar con el texto sobre regalos
  giftsText: "",

  // TODO: Completar cuando se integre Memoroo (Hito futuro)
  memorooUrl: "",

  // TODO: Completar con la URL base de producción (ej: "https://bianca15.vercel.app/i/")
  invitationBaseUrl: "",
};
