import React from 'react';
import type { EventPageProps } from '../../types';
import { elegantTheme } from '../theme';
import { resolveTheme } from '../../theme-resolver';
import { PublicInvitationRenderer } from '@/components/invitation/PublicInvitationRenderer';

export function ElegantEvent({
  event,
  isInteractivePreview,
  selectedSectionId,
  onUpdateSectionHeight,
}: EventPageProps) {
  const theme = resolveTheme(elegantTheme, event.designConfig);

  const customHeader = (
    <div style={{ textAlign: 'center' }} aria-hidden="true">
      <span style={{ fontSize: '1.25rem', color: theme.colors.primary, letterSpacing: '0.3em' }}>
        ✦ — ✦ — ✦
      </span>
    </div>
  );

  return (
    <PublicInvitationRenderer
      event={event}
      theme={theme}
      customHeaderDecorator={customHeader}
      isInteractivePreview={isInteractivePreview}
      selectedSectionId={selectedSectionId}
      onUpdateSectionHeight={onUpdateSectionHeight}
    />
  );
}
