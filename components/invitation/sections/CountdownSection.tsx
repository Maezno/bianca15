import React from 'react';
import type { SectionBaseProps } from './types';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';

export function CountdownSection({ event, theme }: SectionBaseProps) {
  if (!event.date) return null;

  const sectionStyle = event.designConfig?.layout?.sectionStyles?.['countdown'];
  const noBoxes = Boolean(sectionStyle?.countdownNoBoxes || sectionStyle?.noBackground);
  const titleOffsetY = sectionStyle?.titleOffsetY;

  return (
    <section
      aria-label="Cuenta regresiva del evento"
      style={{
        textAlign: 'center',
        width: '100%',
      }}
    >
      <div
        data-heading-container="true"
        style={{
          textAlign: 'center',
          marginBottom: '1rem',
          transform: titleOffsetY !== undefined ? `translateY(${titleOffsetY}px)` : undefined,
          transition: 'transform 0.15s ease',
        }}
      >
        <h2
          data-heading="true"
          style={{
            fontFamily: theme.typography.headingFont,
            fontSize: '1.25rem',
            letterSpacing: '0.18em',
            color: sectionStyle?.titleColor || theme.colors.primary,
            textTransform: 'uppercase',
            fontWeight: 600,
            margin: '0',
            textAlign: 'center',
            display: 'block',
          }}
        >
          CUENTA REGRESIVA
        </h2>
      </div>
      <CountdownTimer
        targetDateStr={event.date}
        targetTimeStr={event.startTime}
        primaryColor={sectionStyle?.titleColor || theme.colors.primary}
        numberColor={sectionStyle?.countdownNumberColor}
        textColor={sectionStyle?.textColor || theme.colors.text}
        cardBg={theme.colors.surface}
        borderStyle={`1px solid ${theme.colors.border}`}
        noBoxes={noBoxes}
        numberSize={sectionStyle?.countdownNumberSize}
      />
    </section>
  );
}
