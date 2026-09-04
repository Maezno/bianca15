import React from 'react';
import type { SectionBaseProps } from './types';
import { CountdownTimer } from '@/components/invitation/CountdownTimer';

export function CountdownSection({ event, theme }: SectionBaseProps) {
  if (!event.date) return null;

  return (
    <section aria-label="Cuenta regresiva del evento">
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.8rem',
            letterSpacing: '0.2em',
            color: theme.colors.primary,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          ⏳ CUENTA REGRESIVA
        </span>
      </div>
      <CountdownTimer
        targetDateStr={event.date}
        targetTimeStr={event.startTime}
        primaryColor={theme.colors.primary}
        textColor={theme.colors.text}
        cardBg={theme.colors.surface}
        borderStyle={`1px solid ${theme.colors.border}`}
      />
    </section>
  );
}
