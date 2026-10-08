/**
 * Tipos de eventos para la plataforma multi-evento.
 * Cada evento es independiente y almacena su propia configuración,
 * plantilla y datos públicos.
 */

export type EventType = "15_years" | "wedding" | "birthday" | "corporate" | "other";
export type EventStatus = "draft" | "published" | "archived";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

/**
 * Estilo visual individual por sección/tarjeta.
 * Permite sobreescribir el fondo, borde y añadir imagen de fondo
 * que se ancla dentro del contenedor de la sección.
 */
export interface SectionStyle {
  /** URL de imagen de fondo (PNG, WebP, etc.) que vive dentro de la tarjeta */
  backgroundImage?: string;
  /** Si true, elimina el color de superficie (surface) → tarjeta transparente */
  noBackground?: boolean;
  /** Si true, elimina el borde de la tarjeta */
  noBorder?: boolean;
  /**
   * Tamaño del fondo de la tarjeta en modo Desktop.
   * Acepta valores CSS: 'contain', '100% auto', 'cover', o porcentaje como '120% auto'.
   * Por defecto: 'cover'.
   */
  backgroundSize?: string;
  /**
   * Tamaño del fondo de la tarjeta en modo Móvil.
   * Si no se define, toma el valor de backgroundSize.
   */
  backgroundSizeMobile?: string;
  /**
   * Posición del fondo dentro de la tarjeta (e.g. 'center', 'top center', 'bottom center').
   */
  backgroundPosition?: string;
  /**
   * Ancho personalizado de la tarjeta en px o '100%' / 'auto'.
   * Si no se define o es 'auto', el div se adapta al ancho de la imagen seleccionada.
   */
  cardWidth?: number | string;
  /** Ancho natural detectado de la imagen (px) */
  imageWidth?: number;
  /** Alto natural detectado de la imagen (px) */
  imageHeight?: number;
  /**
   * Fuente personalizada para los títulos de esta sección (CSS font-family stack).
   * Si no se define, hereda la fuente global headingFont del tema.
   */
  sectionFont?: string;
  /**
   * URL de CSS de fuente externa (Google Fonts, @font-face) solo para esta sección.
   * Si no se define, se usa la fuente global customFontUrl (si existe).
   */
  sectionFontUrl?: string;
  /**
   * Fuente personalizada para los textos y párrafos de esta sección (CSS font-family stack).
   * Si no se define, hereda la fuente global bodyFont del tema.
   */
  sectionBodyFont?: string;
  /**
   * URL de CSS de fuente externa para textos de esta sección.
   */
  sectionBodyFontUrl?: string;
  /**
   * Tamaño de fuente para los títulos de la tarjeta (e.g. '2.5rem', 32, o presets).
   */
  titleFontSize?: string | number;
  /**
   * Tamaño de fuente para los textos y párrafos de la tarjeta (e.g. '1rem', 16, etc.).
   */
  bodyFontSize?: string | number;
  /**
   * Separación vertical entre bloques de texto dentro de la tarjeta (px).
   */
  verticalGap?: number;
  /**
   * Separación lateral entre palabras (word-spacing en px).
   */
  wordSpacing?: number;
  /**
   * Separación lateral entre letras (letter-spacing en px).
   */
  letterSpacing?: number;
  /**
   * Separación lateral / margen horizontal del texto respecto a los costados de la tarjeta (px).
   */
  horizontalPadding?: number;
  /**
   * Si es true y la sección es la cuenta regresiva, oculta los recuadros de fondo de los números.
   */
  countdownNoBoxes?: boolean;
  /**
   * Tamaño de los dígitos numéricos en la cuenta regresiva (px).
   */
  countdownNumberSize?: number;
  /**
   * Color personalizado para los títulos de esta tarjeta (hex, rgb, etc.).
   */
  titleColor?: string;
  /**
   * Color personalizado para los textos y párrafos de esta tarjeta (hex, rgb, etc.).
   */
  textColor?: string;
  /**
   * Tamaño de fuente específico para el Nombre del Evento (en la tarjeta hero / portada).
   */
  nameFontSize?: string | number;
  /**
   * Color específico para el Nombre del Evento (en la tarjeta hero / portada).
   */
  nameColor?: string;
  /**
   * Desplazamiento vertical del título/contenido principal de la tarjeta (px).
   * Positivo = hacia abajo, negativo = hacia arriba.
   */
  titleOffsetY?: number;
  /**
   * Color específico para los dígitos numéricos de la cuenta regresiva.
   */
  countdownNumberColor?: string;
  /**
   * Alineación de textos en la tarjeta ('left' | 'center' | 'right'). Por defecto 'center'.
   */
  textAlign?: 'left' | 'center' | 'right';
  /**
   * Si es false, oculta el botón de Google Maps en la tarjeta de ubicación.
   */
  showMapsButton?: boolean;
  /**
   * Si es false, oculta el botón de Waze en la tarjeta de ubicación.
   */
  showWazeButton?: boolean;
  /**
   * Color de fondo personalizado para el botón de Google Maps.
   */
  mapsButtonBg?: string;
  /**
   * Color de texto personalizado para el botón de Google Maps.
   */
  mapsButtonTextColor?: string;
  /**
   * Color de fondo personalizado para el botón de Waze.
   */
  wazeButtonBg?: string;
  /**
   * Color de texto personalizado para el botón de Waze.
   */
  wazeButtonTextColor?: string;
  /**
   * Si es true, oculta el título de la tarjeta dejando solo el cuerpo/contenido.
   */
  hideTitle?: boolean;
  /**
   * Si es true, oculta el subtítulo de la tarjeta dejando solo el título y/o cuerpo.
   */
  hideSubtitle?: boolean;
  /**
   * Si es true, oculta títulos y textos de la tarjeta para usar una imagen
   * que ya incluye el contenido visual.
   */
  hideText?: boolean;
  /**
   * Si es true, muestra un botón en la sección Hero para comenzar la invitación.
   */
  showStartButton?: boolean;
  /**
   * Texto del botón de comenzar en la sección Hero (ej. 'Empezar').
   */
  startButtonText?: string;
  /**
   * Color de fondo personalizado para el botón principal/hero.
   */
  buttonBg?: string;
  /**
   * Color de texto personalizado para el botón principal/hero.
   */
  buttonTextColor?: string;
  /**
   * Desplazamiento horizontal de todo el contenido de texto (px).
   * Negativo = izquierda, positivo = derecha.
   */
  contentOffsetX?: number;
  /**
   * Desplazamiento vertical de todo el contenido de texto (px).
   * Negativo = arriba, positivo = abajo.
   */
  contentOffsetY?: number;
  /**
   * Imagen PNG/WebP usada como fondo de los botones de la sección.
   */
  buttonBackgroundImage?: string;
  /**
   * Si es true, oculta la etiqueta de texto del botón (útil cuando el PNG ya la incluye).
   */
  hideButtonLabel?: boolean;
  /**
   * Imagen de fondo específica para el botón de Google Maps.
   */
  mapsButtonBackgroundImage?: string;
  /**
   * Imagen de fondo específica para el botón de Waze.
   */
  wazeButtonBackgroundImage?: string;
  /**
   * Imagen de fondo específica para el botón de confirmar asistencia.
   */
  confirmButtonBackgroundImage?: string;
  /**
   * Imagen de fondo específica para el botón de declinar asistencia.
   */
  declineButtonBackgroundImage?: string;
  /**
   * Separación vertical / margen inferior debajo de esta tarjeta (px).
   * Permite distanciar tarjetas de forma individual tanto en modo fijo como fluido.
   */
  cardGap?: number;
  /**
   * Disposición de los botones cuando hay múltiples (o en general):
   * 'row' = uno al lado del otro (horizontal)
   * 'column' = uno debajo del otro (vertical)
   */
  buttonsLayout?: 'row' | 'column';
  /**
   * Alineación horizontal del contenedor de botones: 'center' | 'flex-start' | 'flex-end'
   */
  buttonsAlign?: 'center' | 'left' | 'right';
  /**
   * Desplazamiento horizontal exclusivo de los botones (px).
   * Negativo = izquierda, positivo = derecha.
   */
  buttonsOffsetX?: number;
  /**
   * Desplazamiento vertical exclusivo de los botones (px).
   * Negativo = arriba, positivo = abajo.
   */
  buttonsOffsetY?: number;
  /**
   * Espacio / separación entre los botones (px).
   * Puede ser 0 o incluso negativo para acercar o superponer botones.
   */
  buttonsGap?: number;
  /**
   * Escala o tamaño del fondo PNG de los botones (%: ej. 100 por defecto, 40 a 160).
   */
  buttonBackgroundScale?: number;
  buttonDesktopScale?: number;
  /**
   * Título personalizado para esta tarjeta (anula el título por defecto del evento o sección).
   */
  customTitle?: string;
  /**
   * Subtítulo o texto secundario personalizado para esta tarjeta (anula el texto por defecto del evento o sección).
   */
  customSubtitle?: string;
  /**
   * URL de destino del álbum de fotos (Memoroo u otro servicio).
   */
  albumUrl?: string;
  /**
   * Texto personalizado para el botón del álbum de fotos.
   */
  buttonText?: string;
  /**
   * URL de imagen personalizada para el código QR del álbum de fotos.
   */
  qrUrl?: string;
  /**
   * Si es false, oculta el código QR en la tarjeta del álbum de fotos.
   */
  showQr?: boolean;
  /**
   * Teléfono de contacto / WhatsApp para el footer o cierre de invitación.
   */
  contactPhone?: string;
  /**
   * Texto de contacto para el footer o cierre de invitación.
   */
  contactText?: string;
}

export type DesktopSidebarsStyle = 'black' | 'blur' | 'transparent' | 'image';

export interface DesktopSidebarsConfig {
  /** Si true, activa las bandas laterales en modo Desktop (primera opción) */
  enabled?: boolean;
  /** Estilo de las bandas: 'black' (sólido), 'blur' (vidrio esmerilado), 'transparent' o 'image' */
  style?: DesktopSidebarsStyle;
  /** Color para las bandas en modo sólido (por defecto #000000) */
  color?: string;
  /** Intensidad de desenfoque en px para vidrio esmerilado (por defecto 16) */
  blurAmount?: number;
  /** Opacidad del tinte oscuro para vidrio esmerilado (0 a 1, por defecto 0.5) */
  opacity?: number;
  /** URL de imagen de fondo personalizada para las bandas laterales */
  backgroundImageUrl?: string;
  /** Ancho del visor central simulado de móvil en desktop (px, por defecto 480) */
  centralWidth?: number;
}

export interface EventLayoutConfig {
  mode?: "fluid" | "fixed";
  /** Altura fija global de cada sección en DESKTOP (px) */
  sectionHeight?: number;
  /** Alturas fijas individuales de cada sección en DESKTOP (px), sobrescriben sectionHeight */
  sectionHeights?: Record<string, number>;
  /** Altura fija global de cada sección en MÓVIL (px). Si no se define, hereda sectionHeight */
  sectionHeightMobile?: number;
  /** Alturas fijas individuales de cada sección en MÓVIL (px), sobrescriben sectionHeightMobile */
  sectionHeightsMobile?: Record<string, number>;
  sectionGap?: number;
  continuousBackgroundUrl?: string;
  /** URL de imagen de fondo específica para navegación en Modo Fluido (independiente) */
  fluidBackgroundUrl?: string;
  /** URL de imagen de fondo general de respaldo para todo el evento */
  generalBackgroundUrl?: string;
  contentAlignment?: "center" | "top";
  transparentSections?: boolean;
  /** Comportamiento del fondo principal: fijo a la pantalla (wallpaper de punta a punta) o desplazable con el scroll */
  backgroundAttachment?: "fixed" | "scroll";
  /** Estilos visuales individuales por sección (fondo, borde, transparencia) */
  sectionStyles?: Record<string, SectionStyle>;
  /** Bandas laterales para modo Desktop que delimitan el visor móvil */
  desktopSidebars?: DesktopSidebarsConfig;
  /** Si true, bloquea los manejadores interactivos de redimensión de altura en el previsualizador */
  lockSectionHeights?: boolean;
}

export interface CustomUploadedFont {
  name: string;
  url: string;
  format?: string;
}

export interface EventDesignConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
    textMuted?: string;
    accent?: string;
    border?: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    /** Fuente secundaria destacada (para alias bancario, datos clave, fechas o información importante y legible) */
    secondaryFont?: string;
    /** URL de CSS de fuente personalizada (e.g. Google Fonts CSS URL o @font-face) */
    customFontUrl?: string;
    /** Fuentes subidas por el usuario (.ttf, .otf, .woff, .woff2) disponibles en el editor */
    uploadedFonts?: CustomUploadedFont[];
  };
  layout?: EventLayoutConfig;
}

export interface PhotosSectionConfig {
  enabled?: boolean;
  title?: string;
  description?: string;
  buttonText?: string;
  albumUrl?: string;
  qrEnabled?: boolean;
}

export interface EventSectionConfig {
  order?: string[];
  enabled?: Record<string, boolean>;
  photos?: PhotosSectionConfig;
}

export interface Event {
  id: string;
  slug: string;
  name: string;
  title: string;
  subtitle?: string;
  welcome_text?: string;
  type: EventType | string;
  template_id: string;
  template_version?: string;
  status: EventStatus;
  date: string;
  start_time: string;
  location: string;
  address: string;
  maps_url: string;
  waze_url: string;
  dress_code: string;
  gifts_text: string;
  memoroo_url: string;
  memoroo_qr_url: string;
  cover_image?: string;
  footer_title?: string;
  footer_text?: string;
  schedule?: ScheduleItem[];
  design_config?: EventDesignConfig;
  section_config?: EventSectionConfig;
  whatsapp_template?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Datos públicos del evento que se exponen al renderizar la invitación.
 */
export interface PublicEvent {
  id: string;
  slug: string;
  name: string;
  title: string;
  subtitle?: string;
  welcomeText?: string;
  type: string;
  templateId: string;
  templateVersion?: string;
  status: EventStatus;
  date: string;
  startTime: string;
  location: string;
  address: string;
  mapsUrl: string;
  wazeUrl: string;
  dressCode: string;
  giftsText: string;
  memorooUrl: string;
  memorooQrUrl: string;
  coverImage?: string;
  footerTitle?: string;
  footerText?: string;
  schedule?: ScheduleItem[];
  designConfig?: EventDesignConfig;
  sectionConfig?: EventSectionConfig;
  whatsappTemplate?: string;
}

