import React from 'react';
import type { InvitationPageProps } from '../../types';
import { elegantTheme } from '../theme';
import { resolveTheme } from '../../theme-resolver';
import { PublicInvitationRenderer } from '@/components/invitation/PublicInvitationRenderer';

export function ElegantInvitation({
  event,
  guestGroup,
  existingConfirmation,
}: InvitationPageProps) {
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
      guestGroup={guestGroup}
      existingConfirmation={existingConfirmation}
      customHeaderDecorator={customHeader}
    />
  );
}
