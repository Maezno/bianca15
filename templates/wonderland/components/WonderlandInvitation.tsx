import React from 'react';
import type { InvitationPageProps } from '../../types';
import { wonderlandTheme } from '../theme';
import { resolveTheme } from '../../theme-resolver';
import { PublicInvitationRenderer } from '@/components/invitation/PublicInvitationRenderer';

export function WonderlandInvitation({
  event,
  guestGroup,
  existingConfirmation,
}: InvitationPageProps) {
  const theme = resolveTheme(wonderlandTheme, event.designConfig);

  const customHeader = (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle, ${theme.colors.secondary}40 0%, rgba(10, 10, 15, 0) 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          textAlign: 'center',
          fontSize: '1.25rem',
          color: theme.colors.primary,
          letterSpacing: '0.5rem',
          opacity: 0.8,
        }}
        aria-hidden="true"
      >
        ♠ ♥ ♦ ♣
      </div>
    </>
  );

  return (
    <PublicInvitationRenderer
      event={event}
      theme={theme}
      guestGroup={guestGroup}
      existingConfirmation={existingConfirmation}
      customHeaderDecorator={customHeader}
    />
  );
}
