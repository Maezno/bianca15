'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { PublicEvent } from '@/types/event';
import type { SectionStyle } from '@/types/event';
import type { PublicGuestGroup } from '@/lib/guests/types';
import type { TemplateTheme } from '@/templates/types';
import type { ExistingConfirmation } from '@/lib/confirmations/types';
import { getActiveSections } from '@/templates/theme-resolver';
import { SectionErrorBoundary } from '@/components/common/SectionErrorBoundary';

/**
 * Mapa de fuentes predefinidas: font-family stack → URL de Google Fonts CSS.
 * Permite cargar automáticamente las fuentes del selector sin URL manual.
 */
const PREDEFINED_FONT_URLS: Record<string, string> = {
  'Great Vibes, cursive': 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
  'Alex Brush, cursive': 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap',
  'Pinyon Script, cursive': 'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap',
  'Tangerine, cursive': 'https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap',
  'Dancing Script, cursive': 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
  'Parisienne, cursive': 'https://fonts.googleapis.com/css2?family=Parisienne&display=swap',
  'Italianno, cursive': 'https://fonts.googleapis.com/css2?family=Italianno&display=swap',
  'Cormorant Garamond, Georgia, serif': 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap',
  'Playfair Display, Georgia, serif': 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
  'Cinzel, serif': 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap',
  'EB Garamond, Georgia, serif': 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap',
  'Libre Baskerville, Georgia, serif': 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap',
  'DM Serif Display, Georgia, serif': 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap',
  'Cardo, serif': 'https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&display=swap',
  'Montserrat, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Raleway, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Josefin Sans, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,600;1,300&display=swap',
  'Lato, sans-serif': 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&display=swap',
  'Poppins, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Nunito, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap',
  'Open Sans, system-ui, sans-serif': 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&display=swap',
};

/** Inyecta en el <head> la hoja de estilos de Google Fonts para una fuente predefinida si existe */
function ensurePredefinedFontLoaded(fontFamily: string): void {
  if (typeof window === 'undefined') return;
  const url = PREDEFINED_FONT_URLS[fontFamily];
  if (!url) return;
  const id = `gf-${fontFamily.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

import {
  HeroSection,
  WelcomeSection,
  CountdownSection,
  DateSection,
  LocationSection,
  ScheduleSection,
  DressCodeSection,
  GiftsSection,
  PhotosSection,
  ConfirmationSection,
  ShareSection,
  FooterSection,
} from './sections';
import { FloatingMusicPlayer } from './FloatingMusicPlayer';

const DEFAULT_SECTIONS = [
  'hero',
  'welcome',
  'countdown',
  'date',
  'location',
  'schedule',
  'dress_code',
  'gifts',
  'photos',
  'confirmation',
  'share',
  'footer',
];

export interface PublicInvitationRendererProps {
  event: PublicEvent;
  theme: TemplateTheme;
  guestGroup?: PublicGuestGroup | null;
  existingConfirmation?: ExistingConfirmation | null;
  customHeaderDecorator?: React.ReactNode;
  isInteractivePreview?: boolean;
  selectedSectionId?: string | null;
  onUpdateSectionHeight?: (sectionId: string, height: number) => void;
}

function InteractiveSectionResizer({
  sectionId,
  currentHeight,
  defaultHeight,
  isSelected,
  onUpdateHeight,
}: {
  sectionId: string;
  currentHeight: number;
  defaultHeight: number;
  isSelected: boolean;
  onUpdateHeight: (sectionId: string, height: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(currentHeight);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = currentHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startYRef.current;
      const newH = Math.max(200, Math.min(2500, Math.round(startHeightRef.current + delta)));
      onUpdateHeight(sectionId, newH);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <>
      {/* Barra flotante de control de altura */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 40,
          background: isSelected ? 'rgba(126, 34, 206, 0.94)' : 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: '2rem',
          padding: isCollapsed ? '3px 8px' : '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.25)',
          userSelect: 'none',
          maxWidth: 'calc(100% - 20px)',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          title={isCollapsed ? 'Desplegar ajuste de altura' : 'Minimizar barra de altura'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>↕ {currentHeight}px</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{isCollapsed ? '⚙️' : '✕'}</span>
        </button>

        {!isCollapsed && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateHeight(sectionId, Math.max(200, currentHeight - 50));
              }}
              title="Reducir 50px"
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              -50
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateHeight(sectionId, Math.max(200, currentHeight - 10));
              }}
              title="Reducir 10px"
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              -10
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateHeight(sectionId, Math.min(2500, currentHeight + 10));
              }}
              title="Aumentar 10px"
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              +10
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateHeight(sectionId, Math.min(2500, currentHeight + 50));
              }}
              title="Aumentar 50px"
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: 'none',
                color: '#fff',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              +50
            </button>
            {currentHeight !== defaultHeight && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateHeight(sectionId, defaultHeight);
                }}
                title="Restablecer a la altura estándar"
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                }}
              >
                ↺
              </button>
            )}
          </>
        )}
      </div>

      {/* Agarrador inferior para arrastrar y cambiar altura */}
      <div
        onMouseDown={handleMouseDown}
        title="Arrastrá hacia arriba o abajo para modificar la altura de esta sección"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '14px',
          cursor: 'ns-resize',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDragging
            ? 'rgba(147, 51, 234, 0.45)'
            : 'linear-gradient(to bottom, transparent, rgba(147, 51, 234, 0.2))',
          transition: 'background 0.15s ease',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '4px',
            borderRadius: '2px',
            background: isDragging ? '#9333ea' : 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
          }}
        />
      </div>
    </>
  );
}

interface SectionCardItemProps {
  sectionId: string;
  sectionStyle?: SectionStyle;
  sectionTheme?: TemplateTheme;
  sectionElement: React.ReactNode;
  isFixed: boolean;
  layoutSectionHeight?: number;
  layoutMobileHeight?: number;
  contentAlign: 'center' | 'top';
  isSelected: boolean;
  isInteractivePreview?: boolean;
  isHeightLocked?: boolean;
  onUpdateSectionHeight?: (sectionId: string, height: number) => void;
  defaultHeight: number;
  defaultHeightMobile?: number;
  centralWidth?: number;
}

function SectionCardItem({
  sectionId,
  sectionStyle,
  sectionTheme,
  sectionElement,
  isFixed,
  layoutSectionHeight,
  layoutMobileHeight,
  contentAlign,
  isSelected,
  isInteractivePreview,
  isHeightLocked,
  onUpdateSectionHeight,
  defaultHeight,
  defaultHeightMobile,
  centralWidth = 480,
}: SectionCardItemProps) {
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const updateMobile = () => setIsMobileScreen(window.innerWidth <= 768);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    if (!sectionStyle?.backgroundImage) {
      setNaturalDimensions(null);
      return;
    }
    if (sectionStyle.imageWidth && sectionStyle.imageHeight) {
      setNaturalDimensions({ width: sectionStyle.imageWidth, height: sectionStyle.imageHeight });
      return;
    }
    const img = new Image();
    img.src = sectionStyle.backgroundImage;
    if (img.complete && img.naturalWidth > 0) {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    } else {
      img.onload = () => {
        setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
    }
  }, [sectionStyle?.backgroundImage, sectionStyle?.imageWidth, sectionStyle?.imageHeight]);

  const hasBgImage = !!sectionStyle?.backgroundImage;

  // Ancho efectivo del div de la tarjeta:
  // Se adapta automáticamente al ancho de la imagen seleccionada, o al cardWidth definido
  const effectiveWidth = sectionStyle?.cardWidth
    ? (typeof sectionStyle.cardWidth === 'number' ? `${sectionStyle.cardWidth}px` : sectionStyle.cardWidth)
    : (sectionStyle?.imageWidth
        ? `${sectionStyle.imageWidth}px`
        : (naturalDimensions?.width ? `${naturalDimensions.width}px` : '560px'));

  // Proporción natural de la imagen para garantizar que se muestre completa sin recortes
  const imgRatio = (sectionStyle?.imageWidth && sectionStyle?.imageHeight)
    ? (sectionStyle.imageWidth / sectionStyle.imageHeight)
    : (naturalDimensions && naturalDimensions.height > 0 ? (naturalDimensions.width / naturalDimensions.height) : null);

  // Estilos de fondo: escala diferenciada Desktop / Móvil
  const bgSizeMobile = sectionStyle?.backgroundSizeMobile || '100% auto';
  const bgSizeDesktop = sectionStyle?.backgroundSize || bgSizeMobile;
  const bgPos = sectionStyle?.backgroundPosition || 'center';
  const bgImageStyle = hasBgImage ? ({
    backgroundImage: `url("${sectionStyle?.backgroundImage}")`,
    backgroundPosition: bgPos,
    backgroundRepeat: 'no-repeat' as const,
    '--bg-size-desktop': bgSizeDesktop,
    '--bg-size-mobile': bgSizeMobile,
    backgroundSize: bgSizeDesktop,
  } as React.CSSProperties) : {};

  // Variables tipográficas, de color y de espaciado de la tarjeta
  const cardHeadingSize = sectionStyle?.titleFontSize
    ? (typeof sectionStyle.titleFontSize === 'number' ? `${sectionStyle.titleFontSize}px` : sectionStyle.titleFontSize)
    : undefined;

  const cardBodySize = sectionStyle?.bodyFontSize
    ? (typeof sectionStyle.bodyFontSize === 'number' ? `${sectionStyle.bodyFontSize}px` : sectionStyle.bodyFontSize)
    : undefined;

  const cardHeadingColor = sectionStyle?.titleColor || undefined;
  const cardBodyColor = sectionStyle?.textColor || undefined;

  const cardNameSize = sectionStyle?.nameFontSize
    ? (typeof sectionStyle.nameFontSize === 'number' ? `${sectionStyle.nameFontSize}px` : sectionStyle.nameFontSize)
    : undefined;
  const cardNameColor = sectionStyle?.nameColor || undefined;
  const cardPublicTitleSize = sectionStyle?.titleFontSize
    ? (typeof sectionStyle.titleFontSize === 'number' ? `${sectionStyle.titleFontSize}px` : sectionStyle.titleFontSize)
    : undefined;
  const cardPublicTitleColor = sectionStyle?.titleColor || undefined;

  const cardVerticalGap = sectionStyle?.verticalGap !== undefined ? `${sectionStyle.verticalGap}px` : undefined;
  const cardWordSpacing = sectionStyle?.wordSpacing !== undefined ? `${sectionStyle.wordSpacing}px` : undefined;
  const cardPaddingX = sectionStyle?.horizontalPadding !== undefined ? `${sectionStyle.horizontalPadding}px` : '1rem';
  const cardTitleOffsetY = sectionStyle?.titleOffsetY !== undefined ? `${sectionStyle.titleOffsetY}px` : undefined;
  const cardTextAlign = sectionStyle?.textAlign || 'center';
  const hideCardTitle = sectionStyle?.hideTitle === true;
  const hideCardSubtitle = sectionStyle?.hideSubtitle === true;
  const hideCardText = sectionStyle?.hideText === true;
  const contentOffsetX = sectionStyle?.contentOffsetX ?? 0;
  const contentOffsetY = sectionStyle?.contentOffsetY ?? 0;
  const hasContentOffset = contentOffsetX !== 0 || contentOffsetY !== 0;

  // Las secciones con botones gestionan contentOffset internamente solo en su bloque de texto,
  // para que los botones nunca se muevan con el slider de texto.
  const isSectionWithButtons = ['location', 'confirmation', 'gifts', 'photos', 'share'].includes(sectionId);

  const cardTypographyStyles: React.CSSProperties = {
    fontFamily: sectionTheme?.typography.bodyFont,
    '--card-heading-font': sectionTheme?.typography.headingFont,
    '--card-body-font': sectionTheme?.typography.bodyFont,
    '--card-secondary-font': sectionTheme?.typography.secondaryFont || sectionTheme?.typography.bodyFont,
    '--card-heading-size': cardHeadingSize,
    '--card-body-size': cardBodySize,
    '--card-heading-color': cardHeadingColor,
    '--card-body-color': cardBodyColor,
    '--card-name-size': cardNameSize,
    '--card-name-color': cardNameColor,
    '--card-public-title-size': cardPublicTitleSize,
    '--card-public-title-color': cardPublicTitleColor,
    '--card-title-offset-y': cardTitleOffsetY,
    '--card-text-align': cardTextAlign,
    textAlign: cardTextAlign,
    '--desktop-btn-visual-scale': sectionStyle?.buttonDesktopScale !== undefined ? (sectionStyle.buttonDesktopScale / 100) : 'min(var(--desktop-btn-scale, 1), 1.25)',
  } as React.CSSProperties;

  const cardClasses = [
    'invitation-card-item',
    cardHeadingSize ? 'has-custom-heading-size' : '',
    cardBodySize ? 'has-custom-body-size' : '',
    cardHeadingColor ? 'has-custom-heading-color' : '',
    cardBodyColor ? 'has-custom-body-color' : '',
    cardTitleOffsetY ? 'has-custom-title-offset' : '',
    hideCardTitle ? 'hide-card-title' : '',
    hideCardSubtitle ? 'hide-card-subtitle' : '',
    hideCardText ? 'hide-card-text' : '',
  ].filter(Boolean).join(' ');

  const innerContentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 'min(560px, 100vw)',
    paddingLeft: cardPaddingX,
    paddingRight: cardPaddingX,
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
    transform: (!isSectionWithButtons && hasContentOffset) ? `translate(${contentOffsetX}px, ${contentOffsetY}px)` : undefined,
    transition: 'transform 0.15s ease',
  };

  // Cálculo del alto natural o proporcional de la imagen de fondo para adaptar la tarjeta
  const naturalImageHeight = sectionStyle?.imageHeight || naturalDimensions?.height;
  const naturalImageWidth = sectionStyle?.imageWidth || naturalDimensions?.width;

  // En modo móvil (pantalla ≤ 768px), el alto proporcional al ancho base móvil (390px):
  const responsiveImageHeight = (naturalImageWidth && naturalImageHeight)
    ? Math.round(390 * (naturalImageHeight / naturalImageWidth))
    : undefined;

  // Factor de escala configurado para el fondo (ej. "120% auto" -> factor 1.2; "150% auto" -> factor 1.5)
  const parseBgScale = (sizeStr?: string): number => {
    if (!sizeStr) return 1;
    const match = sizeStr.trim().match(/^(\d+)(?:\.\d+)?%/);
    if (match) {
      const pct = parseFloat(match[1]);
      return pct > 0 ? pct / 100 : 1;
    }
    return 1;
  };

  const desktopBgScale = parseBgScale(sectionStyle?.backgroundSize);
  const mobileBgScale = parseBgScale(sectionStyle?.backgroundSizeMobile);

  // Proporción de escala entre Desktop (marco central) y Móvil (ancho base 390px)
  const desktopRatio = (centralWidth && centralWidth > 0) ? (centralWidth / 390) : 1.23;

  // En Móvil: Si el usuario ajustó la altura (layoutMobileHeight), se respeta ese valor.
  // De lo contrario, se adapta a la imagen proporcionalmente.
  const baseMobileHeight = layoutMobileHeight
    ? layoutMobileHeight
    : (responsiveImageHeight || naturalImageHeight || (defaultHeightMobile ?? defaultHeight));
  const effectiveMobileHeight = layoutMobileHeight
    ? layoutMobileHeight
    : (hasBgImage ? Math.round(baseMobileHeight * mobileBgScale) : baseMobileHeight);

  // En Desktop: Para que no se distorsione ni cambien los tamaños respecto a móvil,
  // la tarjeta mantiene la misma proporción de aspecto calculada a partir de la altura de móvil
  // multiplicada por la proporción de ancho (centralWidth / 390). Si el usuario fijó layoutSectionHeight, se respeta.
  const baseDesktopHeight = layoutSectionHeight
    ? layoutSectionHeight
    : (layoutMobileHeight
        ? Math.round(layoutMobileHeight * desktopRatio)
        : (naturalImageWidth && naturalImageHeight
            ? Math.round(centralWidth * (naturalImageHeight / naturalImageWidth))
            : defaultHeight));
  const effectiveDesktopHeight = layoutSectionHeight
    ? layoutSectionHeight
    : (layoutMobileHeight
        ? Math.round(effectiveMobileHeight * desktopRatio)
        : (hasBgImage
            ? Math.round(baseDesktopHeight * (sectionStyle?.backgroundSize ? desktopBgScale : mobileBgScale))
            : baseDesktopHeight));

  if (!isFixed) {
    return (
      <div
        id={`section-${sectionId}`}
        style={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          overflow: 'visible',
          margin: 0,
          marginBottom: sectionStyle?.cardGap !== undefined ? `${sectionStyle.cardGap}px` : undefined,
          padding: 0,
        }}
      >
        {/* Div de la tarjeta: 1000px en desktop, 100% en móvil pegado a los costados */}
        <div
          className={cardClasses}
          style={{
            position: 'relative',
            boxSizing: 'border-box',
            ...cardTypographyStyles,
            ...(hasBgImage
              ? {
                  ...bgImageStyle,
                  minHeight: `${isMobileScreen ? effectiveMobileHeight : effectiveDesktopHeight}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }
              : {}),
          }}
        >
          <div style={innerContentStyle}>
            {sectionElement}
          </div>
        </div>
      </div>
    );
  }

  const finalSectionHeight = isMobileScreen ? effectiveMobileHeight : effectiveDesktopHeight;

  return (
    <div
      id={`section-${sectionId}`}
      onClick={() => {
        if (isInteractivePreview && typeof window !== 'undefined') {
          window.parent?.postMessage({ type: 'SELECT_SECTION', sectionId }, '*');
        }
      }}
      style={{
        height: `${effectiveDesktopHeight}px`,
        maxHeight: `${effectiveDesktopHeight}px`,
        '--section-height-mobile': `${effectiveMobileHeight}px`,
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: contentAlign === 'top' ? 'flex-start' : 'center',
        alignItems: 'center',
        padding: 0,
        margin: 0,
        marginBottom: sectionStyle?.cardGap !== undefined ? `${sectionStyle.cardGap}px` : undefined,
        position: 'relative',
        transition: 'box-shadow 0.2s ease',
        overflow: 'visible',
        cursor: isInteractivePreview ? 'pointer' : 'default',
        boxShadow: isSelected
          ? '0 0 0 3px #9333ea, 0 8px 24px rgba(147, 51, 234, 0.25)'
          : undefined,
      } as React.CSSProperties}
    >
      {/* Div de la tarjeta: 1000px en desktop, 100% en móvil pegado a los costados */}
      <div
        className={cardClasses}
        style={{
          height: hasBgImage ? '100%' : 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          ...cardTypographyStyles,
          ...(hasBgImage ? bgImageStyle : {}),
        }}
      >
        <div style={innerContentStyle}>
          {sectionElement}
        </div>
      </div>

      {!isHeightLocked && isInteractivePreview && onUpdateSectionHeight && (
        <InteractiveSectionResizer
          sectionId={sectionId}
          currentHeight={finalSectionHeight}
          defaultHeight={isMobileScreen ? (defaultHeightMobile ?? effectiveMobileHeight) : effectiveDesktopHeight}
          isSelected={isSelected}
          onUpdateHeight={onUpdateSectionHeight}
        />
      )}
    </div>
  );
}

export function PublicInvitationRenderer({
  event,
  theme,
  guestGroup,
  existingConfirmation,
  customHeaderDecorator,
  isInteractivePreview,
  selectedSectionId,
  onUpdateSectionHeight,
}: PublicInvitationRendererProps) {
  const activeSections = getActiveSections(DEFAULT_SECTIONS, event.sectionConfig);
  const layout = event.designConfig?.layout;
  const isFixed = layout?.mode === 'fixed';
  const defaultHeight = layout?.sectionHeight || 700;
  const defaultHeightMobile = layout?.sectionHeightMobile ?? defaultHeight;
  const sectionGap = layout?.sectionGap !== undefined ? layout.sectionGap : (isFixed ? 0 : 32);
  const continuousBg = layout?.continuousBackgroundUrl;
  const fluidBg = layout?.fluidBackgroundUrl;
  const generalBg = layout?.generalBackgroundUrl;
  const contentAlign = layout?.contentAlignment || 'center';
  const transparentSections = layout?.transparentSections;

  const resolvedTheme: TemplateTheme = transparentSections
    ? {
        ...theme,
        colors: {
          ...theme.colors,
          surface: 'rgba(0, 0, 0, 0.25)',
        },
      }
    : theme;

  const sectionProps = { event, theme: resolvedTheme, guestGroup, existingConfirmation };
  const sectionStyles = layout?.sectionStyles || {};

  // Inyectar fuentes subidas por el usuario (@font-face)
  const uploadedFonts = event.designConfig?.typography?.uploadedFonts;
  useEffect(() => {
    if (!uploadedFonts || uploadedFonts.length === 0) {
      const existingStyle = document.getElementById('user-uploaded-fonts');
      if (existingStyle) existingStyle.remove();
      return;
    }
    let styleEl = document.getElementById('user-uploaded-fonts') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'user-uploaded-fonts';
      document.head.appendChild(styleEl);
    }
    const fontFaces = uploadedFonts
      .map((f) => {
        const formatStr = f.format ? ` format('${f.format}')` : '';
        return `@font-face { font-family: '${f.name}'; src: url('${f.url}')${formatStr}; font-display: swap; }`;
      })
      .join('\n');
    styleEl.textContent = fontFaces;
    return () => {
      const el = document.getElementById('user-uploaded-fonts');
      if (el) el.remove();
    };
  }, [uploadedFonts]);

  // Inyectar fuente personalizada global si está configurada
  const customFontUrl = event.designConfig?.typography?.customFontUrl;
  useEffect(() => {
    if (!customFontUrl) {
      const existingLink = document.getElementById('custom-font-link');
      if (existingLink) existingLink.remove();
      return;
    }
    const existingLink = document.getElementById('custom-font-link');
    if (existingLink) existingLink.remove();
    const link = document.createElement('link');
    link.id = 'custom-font-link';
    link.rel = 'stylesheet';
    link.href = customFontUrl;
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById('custom-font-link');
      if (el) el.remove();
    };
  }, [customFontUrl]);

  // Inyectar fuentes personalizadas por sección (URLs externas para títulos y textos)
  useEffect(() => {
    // Limpiar fuentes de sección previas
    document.querySelectorAll('[data-section-font]').forEach((el) => el.remove());

    const injectedUrls = new Set<string>();
    if (customFontUrl) injectedUrls.add(customFontUrl); // no duplicar la global

    Object.entries(sectionStyles).forEach(([secId, style]) => {
      const urls = [style.sectionFontUrl, style.sectionBodyFontUrl].filter(Boolean) as string[];
      urls.forEach((url, idx) => {
        if (!injectedUrls.has(url)) {
          injectedUrls.add(url);
          const link = document.createElement('link');
          link.setAttribute('data-section-font', `${secId}-${idx}`);
          link.rel = 'stylesheet';
          link.href = url;
          document.head.appendChild(link);
        }
      });
    });

    return () => {
      document.querySelectorAll('[data-section-font]').forEach((el) => el.remove());
    };
  }, [JSON.stringify(sectionStyles), customFontUrl]);

  // Cargar automáticamente las fuentes predefinidas de Google (theme global + por sección)
  useEffect(() => {
    ensurePredefinedFontLoaded(theme.typography.headingFont);
    ensurePredefinedFontLoaded(theme.typography.bodyFont);
    if (theme.typography.secondaryFont) ensurePredefinedFontLoaded(theme.typography.secondaryFont);
    Object.values(sectionStyles).forEach((style) => {
      if (style.sectionFont) ensurePredefinedFontLoaded(style.sectionFont);
      if (style.sectionBodyFont) ensurePredefinedFontLoaded(style.sectionBodyFont);
    });
  }, [theme.typography.headingFont, theme.typography.bodyFont, theme.typography.secondaryFont, JSON.stringify(sectionStyles)]);

  /** Resuelve el theme final para una sección aplicando sus overrides individuales */
  const resolveSectionTheme = (sectionId: string, style?: SectionStyle) => {
    const hasColorOverrides = style && (style.noBackground || style.noBorder || style.backgroundImage);
    const hasHeadingFontOverride = style?.sectionFont;
    const hasBodyFontOverride = style?.sectionBodyFont;

    if (!hasColorOverrides && !hasHeadingFontOverride && !hasBodyFontOverride) return resolvedTheme;

    return {
      ...resolvedTheme,
      colors: hasColorOverrides ? {
        ...resolvedTheme.colors,
        ...(style!.noBackground || style!.backgroundImage ? { surface: 'transparent' } : {}),
        ...(style!.noBorder || style!.noBackground ? { border: 'transparent' } : {}),
      } : resolvedTheme.colors,
      styles: hasColorOverrides ? {
        ...(resolvedTheme.styles || {}),
        ...(style!.noBackground || style!.backgroundImage ? { cardShadow: 'none' } : {}),
      } : resolvedTheme.styles,
      typography: {
        ...resolvedTheme.typography,
        ...(hasHeadingFontOverride ? { headingFont: style!.sectionFont! } : {}),
        ...(hasBodyFontOverride ? { bodyFont: style!.sectionBodyFont! } : {}),
      },
    };
  };

  // Determinar la imagen de fondo según el modo (fijo usa continuousBg; fluido usa fluidBg)
  // con respaldo al fondo general si no hay fondo específico para el modo
  const activeModeBg = isFixed ? continuousBg : fluidBg;
  const effectiveBgImage = activeModeBg || generalBg;

  // Comportamiento del fondo: 'fixed' (por defecto: wallpaper estático de punta a punta) o 'scroll'
  const isBgFixed = layout?.backgroundAttachment !== 'scroll';

  const scrollBackgroundStyle = effectiveBgImage && !isBgFixed
    ? isFixed
      ? `url("${effectiveBgImage}") top center / 100% 100% no-repeat, ${theme.colors.background}`
      : `url("${effectiveBgImage}") top center / cover no-repeat, ${theme.colors.background}`
    : theme.colors.background;

  // Configuración de bandas laterales en desktop (Primera opción)
  const sidebarsConfig = layout?.desktopSidebars;
  const sidebarsEnabled = sidebarsConfig?.enabled ?? true;
  const sidebarsStyle = sidebarsConfig?.style || 'black';
  const centralWidth = sidebarsConfig?.centralWidth || 480;
  const sidebarsColor = sidebarsConfig?.color || '#000000';
  const blurAmount = sidebarsConfig?.blurAmount !== undefined ? sidebarsConfig.blurAmount : 16;
  const blurOpacity = sidebarsConfig?.opacity !== undefined ? sidebarsConfig.opacity : 0.5;
  const sidebarsBgImage = sidebarsConfig?.backgroundImageUrl;

  const bandBaseStyle: React.CSSProperties = {
    ...(sidebarsStyle === 'transparent'
      ? {
          background: 'transparent',
          pointerEvents: 'none',
        }
      : {}),
    ...(sidebarsStyle === 'black'
      ? {
          backgroundColor: sidebarsColor,
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.6)',
        }
      : {}),
    ...(sidebarsStyle === 'blur'
      ? {
          backdropFilter: `blur(${blurAmount}px)`,
          WebkitBackdropFilter: `blur(${blurAmount}px)`,
          backgroundColor: `rgba(0, 0, 0, ${blurOpacity})`,
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.4)',
        }
      : {}),
    ...(sidebarsStyle === 'image' && sidebarsBgImage
      ? {
          backgroundImage: `url("${sidebarsBgImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 0 25px rgba(0, 0, 0, 0.5)',
        }
      : {}),
  };

  // Parallax sutil y estable para el fondo general/fijo con zoom de seguridad
  const [parallaxOffset, setParallaxOffset] = useState(0);
  useEffect(() => {
    if (!isBgFixed || !effectiveBgImage) return;

    // Cachear la altura para que el cambio de tamaño dinámico de la barra de direcciones de móvil no reinicie ni sacuda el fondo
    let cachedViewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    let cachedMaxScroll = 1;

    const updateDimensions = () => {
      cachedViewportHeight = window.innerHeight;
      cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - cachedViewportHeight);
    };

    updateDimensions();

    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      const progress = Math.min(1, Math.max(0, currentScroll / cachedMaxScroll));
      // Desplazamiento máximo controlado de 60px distribuido progresivamente
      setParallaxOffset(progress * -60);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Solo actualizar las dimensiones totales al girar la pantalla (orientación) o redimensionamiento real de ancho
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        updateDimensions();
        handleScroll();
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        updateDimensions();
        handleScroll();
      }, 150);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isBgFixed, effectiveBgImage]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: isBgFixed ? theme.colors.background : scrollBackgroundStyle,
        color: theme.colors.text,
        fontFamily: theme.typography.bodyFont,
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
        '--central-width': `${centralWidth}px`,
        '--desktop-btn-scale': `calc(${centralWidth} / 390)`,
      } as React.CSSProperties}
    >
      {/* Bandas laterales para modo Desktop (Marco / Enfoque Móvil) */}
      {sidebarsEnabled && (
        <>
          <div
            className="desktop-side-band desktop-side-band-left"
            aria-hidden="true"
            style={bandBaseStyle}
          />
          <div
            className="desktop-side-band desktop-side-band-right"
            aria-hidden="true"
            style={bandBaseStyle}
          />
        </>
      )}
      {/* Fondo fijo de punta a punta en altura con zoom preventivo y efecto Parallax sutil */}
      {effectiveBgImage && isBgFixed && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: '-10lvh',
            left: 0,
            right: 0,
            width: '100vw',
            height: '120lvh',
            minHeight: '120vh',
            backgroundImage: `url("${effectiveBgImage}")`,
            backgroundPosition: 'center center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            transform: `translate3d(0, ${parallaxOffset}px, 0) scale(1.06)`,
            transformOrigin: 'center center',
            willChange: 'transform',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      <main
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${sectionGap}px`,
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
        }}
      >
        {customHeaderDecorator}

        {activeSections.map((sectionId) => {
          // Obtener estilo individual y calcular theme resuelto para esta sección
          const sectionStyle = sectionStyles[sectionId];
          const sectionTheme = resolveSectionTheme(sectionId, sectionStyle);
          const sectionSpecificProps = { ...sectionProps, theme: sectionTheme };

          // Helper: construir el elemento de sección con el theme ya resuelto
          let sectionElement: React.ReactNode = null;
          switch (sectionId) {
            case 'hero': sectionElement = <HeroSection key="hero" {...sectionSpecificProps} />; break;
            case 'welcome': sectionElement = <WelcomeSection key="welcome" {...sectionSpecificProps} />; break;
            case 'countdown': sectionElement = (<SectionErrorBoundary key="countdown" sectionId="countdown"><CountdownSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'date': sectionElement = (<SectionErrorBoundary key="date" sectionId="date"><DateSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'location': sectionElement = (<SectionErrorBoundary key="location" sectionId="location"><LocationSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'schedule': sectionElement = (<SectionErrorBoundary key="schedule" sectionId="schedule"><ScheduleSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'dress_code': sectionElement = (<SectionErrorBoundary key="dress_code" sectionId="dress_code"><DressCodeSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'gifts': sectionElement = (<SectionErrorBoundary key="gifts" sectionId="gifts"><GiftsSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'photos': sectionElement = (<SectionErrorBoundary key="photos" sectionId="photos"><PhotosSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'confirmation': sectionElement = <ConfirmationSection key="confirmation" {...sectionSpecificProps} />; break;
            case 'share': sectionElement = (<SectionErrorBoundary key="share" sectionId="share"><ShareSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            case 'footer': sectionElement = (<SectionErrorBoundary key="footer" sectionId="footer"><FooterSection {...sectionSpecificProps} /></SectionErrorBoundary>); break;
            default: return null;
          }

          const layoutSectionHeight = layout?.sectionHeights?.[sectionId];
          const layoutMobileHeight = layout?.sectionHeightsMobile?.[sectionId];
          const isSelected = selectedSectionId === sectionId;

          return (
            <SectionCardItem
              key={sectionId}
              sectionId={sectionId}
              sectionStyle={sectionStyle}
              sectionTheme={sectionTheme}
              sectionElement={sectionElement}
              isFixed={isFixed}
              layoutSectionHeight={layoutSectionHeight}
              layoutMobileHeight={layoutMobileHeight}
              contentAlign={contentAlign}
              isSelected={isSelected}
              isInteractivePreview={isInteractivePreview}
              isHeightLocked={Boolean(layout?.lockSectionHeights)}
              onUpdateSectionHeight={onUpdateSectionHeight}
              defaultHeight={defaultHeight}
              defaultHeightMobile={defaultHeightMobile}
              centralWidth={centralWidth}
            />
          );
        })}
      </main>

      {/* Reproductor de música de fondo flotante */}
      <FloatingMusicPlayer
        audioSrc="/audio/alices-theme.mp3"
        primaryColor={theme.colors.primary}
        defaultVolume={0.25}
      />
    </div>
  );
}


