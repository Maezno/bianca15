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
        textColor={sectionStyle?.textColor || theme.colors.text}
        titleColor={sectionStyle?.titleColor}
        titleOffsetY={titleOffsetY}
        buttonsLayout={sectionStyle?.buttonsLayout}
        buttonsAlign={sectionStyle?.buttonsAlign}
        buttonsOffsetX={sectionStyle?.buttonsOffsetX}
        buttonsOffsetY={sectionStyle?.buttonsOffsetY}
        buttonsGap={sectionStyle?.buttonsGap}
        buttonBackgroundImage={sectionStyle?.buttonBackgroundImage}
        hideButtonLabel={sectionStyle?.hideButtonLabel}
        buttonBackgroundScale={sectionStyle?.buttonBackgroundScale}
        hideTitle={sectionStyle?.hideTitle}
        hideSubtitle={sectionStyle?.hideSubtitle}
        hideText={sectionStyle?.hideText}
      />
    </section>
  );
}
