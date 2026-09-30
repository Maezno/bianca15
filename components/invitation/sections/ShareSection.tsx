import React from 'react';
import type { SectionBaseProps } from './types';
import { ShareSection as BaseShareSection } from '@/components/invitation/ShareSection';

export function ShareSection({ event, theme, guestGroup }: SectionBaseProps) {
  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['share'];
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <section aria-label="Compartir invitación" style={{ textAlign: 'center', width: '100%' }}>
      <BaseShareSection
        title={event.title}
        eventName={event.name}
        groupName={guestGroup?.name}
        btnBg={theme.colors.primary}
        btnColor="#ffffff"
        cardBg={theme.colors.surface}
        borderColor={theme.colors.border}
        textColor={theme.colors.text}
        titleOffsetY={titleOffsetY}
      />
    </section>
  );
}
