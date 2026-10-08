'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FloatingMusicPlayerProps {
  audioSrc?: string;
  primaryColor?: string;
  defaultVolume?: number;
}

export function FloatingMusicPlayer({
  audioSrc = '/audio/alices-theme.mp3',
  primaryColor = '#9333ea',
  defaultVolume = 0.25,
}: FloatingMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.loop = true;
    audio.volume = defaultVolume;
    audioRef.current = audio;

    const startAudioOnInteraction = () => {
      if (audioRef.current && !hasInteracted) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        }).catch(() => {
          // Si el navegador bloquea, espera un clic en el botón
        });
      }
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('scroll', startAudioOnInteraction);
    };

    window.addEventListener('click', startAudioOnInteraction, { once: true });
    window.addEventListener('touchstart', startAudioOnInteraction, { once: true });
    window.addEventListener('scroll', startAudioOnInteraction, { once: true });

    return () => {
      removeListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioSrc, defaultVolume, hasInteracted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setHasInteracted(true);
      }).catch((err) => {
        console.error('Error al reproducir audio:', err);
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 9990,
      }}
    >
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Silenciar música' : 'Reproducir música'}
        title={isPlaying ? 'Silenciar música' : 'Reproducir música'}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backgroundColor: isPlaying ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.25s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = isPlaying ? 'rgba(15, 23, 42, 0.75)' : 'rgba(15, 23, 42, 0.55)';
        }}
      >
        {isPlaying ? (
          /* Ícono notas musicales / sonando */
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={primaryColor || '#a855f7'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: 'spinSlow 4s linear infinite',
            }}
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ) : (
          /* Ícono silenciado */
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      <style jsx global>{`
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
