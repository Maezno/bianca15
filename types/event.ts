/**
 * Tipo de configuración del evento.
 * Todos los datos del evento deben gestionarse a través de config/event.ts
 * para mantener la separación entre configuración y código visual.
 */
export interface EventConfig {
  /** Nombre de la festejada */
  name: string;
  /** Título del evento */
  title: string;

  /** Fecha del evento (formato ISO 8601, ej: "2025-11-15") */
  date: string;
  /** Hora de inicio (formato HH:mm, ej: "20:00") */
  startTime: string;

  /** Nombre del lugar */
  location: string;
  /** Dirección completa */
  address: string;

  /** URL de Google Maps */
  mapsUrl: string;
  /** URL de Waze */
  wazeUrl: string;

  /** Descripción del dress code */
  dressCode: string;

  /** Texto o instrucciones sobre regalos */
  giftsText: string;

  /** URL de Memoroo (integración futura) */
  memorooUrl: string;

  /** URL base para generar invitaciones personalizadas */
  invitationBaseUrl: string;
}
