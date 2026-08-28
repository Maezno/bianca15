'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDateStr: string; // Formato YYYY-MM-DD
  targetTimeStr?: string; // Formato HH:MM
  primaryColor?: string;
  textColor?: string;
  cardBg?: string;
  borderStyle?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function CountdownTimer({
  targetDateStr,
  targetTimeStr = '00:00',
  primaryColor = '#9333ea',
  textColor = '#0f172a',
  cardBg = 'rgba(255, 255, 255, 0.05)',
  borderStyle = '1px solid rgba(255, 255, 255, 0.1)',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    if (!targetDateStr) return;

    const calculateTime = () => {
      const [year, month, day] = targetDateStr.split('-').map(Number);
      const [hours, minutes] = (targetTimeStr || '00:00').split(':').map(Number);
      const target = new Date(year, month - 1, day, hours, minutes, 0).getTime();
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours: h, minutes: m, seconds: s, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr, targetTimeStr]);

  if (!timeLeft) return null;

  if (timeLeft.isPast) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: 'center',
          padding: '1.25rem',
          borderRadius: '0.75rem',
          background: cardBg,
          border: borderStyle,
          color: primaryColor,
          fontWeight: 700,
          fontSize: '1.1rem',
        }}
      >
        ✨ ¡Llegó el gran día! 🎉
      </div>
    );
  }

  const units = [
    { label: 'DÍAS', value: timeLeft.days },
    { label: 'HORAS', value: timeLeft.hours },
    { label: 'MIN', value: timeLeft.minutes },
    { label: 'SEG', value: timeLeft.seconds },
  ];

  return (
    <div
      role="timer"
      aria-label={`Faltan ${timeLeft.days} días, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos y ${timeLeft.seconds} segundos`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          style={{
            background: cardBg,
            border: borderStyle,
            borderRadius: '0.75rem',
            padding: '0.75rem 0.25rem',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            transition: 'transform 0.2s ease',
          }}
        >
          <div
            style={{
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 800,
              color: primaryColor,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
            }}
          >
            {String(unit.value).padStart(2, '0')}
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              fontWeight: 700,
              color: textColor,
              marginTop: '0.25rem',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}
          >
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}
