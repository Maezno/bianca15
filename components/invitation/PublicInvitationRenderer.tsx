'use client';

import React, { useState, useRef } from 'react';
import type { PublicEvent } from '@/types/event';
import type { PublicGuestGroup } from '@/lib/guests/types';
import type { TemplateTheme } from '@/templates/types';
import type { ExistingConfirmation } from '@/lib/confirmations/types';
import { getActiveSections } from '@/templates/theme-resolver';
import { SectionErrorBoundary } from '@/components/common/SectionErrorBoundary';
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
      const newH = Math.max(250, Math.min(2500, Math.round(startHeightRef.current + delta)));
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

  return (
    <>
      {/* Barra flotante de control */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '12px',
          zIndex: 40,
          background: isSelected ? 'rgba(126, 34, 206, 0.94)' : 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '2rem',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.2)',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f8fafc' }}>
          ↕ {currentHeight}px
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateHeight(sectionId, Math.max(250, currentHeight - 50));
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
            onUpdateHeight(sectionId, Math.max(250, currentHeight - 10));
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
  const sectionGap = layout?.sectionGap !== undefined ? layout.sectionGap : (isFixed ? 0 : 32);
  const continuousBg = layout?.continuousBackgroundUrl;
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: continuousBg
          ? `url("${continuousBg}") top center / 100% auto no-repeat, ${theme.colors.background}`
          : theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.bodyFont,
        padding: isFixed ? '0' : '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '560px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: `${sectionGap}px`,
          boxSizing: 'border-box',
        }}
      >
        {customHeaderDecorator}

        {activeSections.map((sectionId) => {
          let sectionElement: React.ReactNode = null;
          switch (sectionId) {
            case 'hero':
              sectionElement = <HeroSection key="hero" {...sectionProps} />;
              break;
            case 'welcome':
              sectionElement = <WelcomeSection key="welcome" {...sectionProps} />;
              break;
            case 'countdown':
              sectionElement = (
                <SectionErrorBoundary key="countdown" sectionId="countdown">
                  <CountdownSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'date':
              sectionElement = (
                <SectionErrorBoundary key="date" sectionId="date">
                  <DateSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'location':
              sectionElement = (
                <SectionErrorBoundary key="location" sectionId="location">
                  <LocationSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'schedule':
              sectionElement = (
                <SectionErrorBoundary key="schedule" sectionId="schedule">
                  <ScheduleSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'dress_code':
              sectionElement = (
                <SectionErrorBoundary key="dress_code" sectionId="dress_code">
                  <DressCodeSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'gifts':
              sectionElement = (
                <SectionErrorBoundary key="gifts" sectionId="gifts">
                  <GiftsSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'photos':
              sectionElement = (
                <SectionErrorBoundary key="photos" sectionId="photos">
                  <PhotosSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'confirmation':
              sectionElement = <ConfirmationSection key="confirmation" {...sectionProps} />;
              break;
            case 'share':
              sectionElement = (
                <SectionErrorBoundary key="share" sectionId="share">
                  <ShareSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            case 'footer':
              sectionElement = (
                <SectionErrorBoundary key="footer" sectionId="footer">
                  <FooterSection {...sectionProps} />
                </SectionErrorBoundary>
              );
              break;
            default:
              return null;
          }

          if (!isFixed) {
            return (
              <div key={sectionId} id={`section-${sectionId}`} style={{ width: '100%' }}>
                {sectionElement}
              </div>
            );
          }

          const currentSectionHeight = layout?.sectionHeights?.[sectionId] || defaultHeight;
          const isSelected = selectedSectionId === sectionId;

          return (
            <div
              key={sectionId}
              id={`section-${sectionId}`}
              style={{
                height: `${currentSectionHeight}px`,
                maxHeight: `${currentSectionHeight}px`,
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: contentAlign === 'top' ? 'flex-start' : 'center',
                alignItems: 'center',
                overflowY: 'hidden',
                overflowX: 'hidden',
                padding: '1.25rem 1rem',
                position: 'relative',
                transition: 'box-shadow 0.2s ease',
                boxShadow: isSelected
                  ? '0 0 0 3px #9333ea, 0 8px 24px rgba(147, 51, 234, 0.25)'
                  : undefined,
              }}
            >
              <div style={{ width: '100%' }}>{sectionElement}</div>

              {isInteractivePreview && onUpdateSectionHeight && (
                <InteractiveSectionResizer
                  sectionId={sectionId}
                  currentHeight={currentSectionHeight}
                  defaultHeight={defaultHeight}
                  isSelected={isSelected}
                  onUpdateHeight={onUpdateSectionHeight}
                />
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
