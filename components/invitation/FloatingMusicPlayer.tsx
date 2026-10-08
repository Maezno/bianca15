'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FloatingMusicPlayerProps {
  audioSrc?: string;
  primaryColor?: string;
  defaultVolume?: number;
}

// Declaración para TypeScript
declare global {
  interface Window {
    __invitationAudio?: HTMLAudioElement;
    __playInvitationMusic?: () => void;
  }
}

export function FloatingMusicPlayer({
  audioSrc = '/audio/alices-theme.mp3',
  primaryColor = '#9333ea',
  defaultVolume = 0.70,
}: FloatingMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reutilizar o instanciar el elemento de audio único
    let audio = window.__invitationAudio;
    if (!audio) {
      audio = new Audio(audioSrc);
      audio.loop = true;
      audio.volume = defaultVolume;
      window.__invitationAudio = audio;
    } else {
      if (typeof window !== 'undefined' && audio.src && !audio.src.endsWith(audioSrc)) {
        audio.src = audioSrc;
      }
      audio.volume = defaultVolume;
    }
    audioRef.current = audio;

    // Sincronizar el estado de reproducción con eventos nativos
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    if (!audio.paused) {
      setIsPlaying(true);
    }

    const playAudio = () => {
      const currentAudio = audioRef.current || window.__invitationAudio;
      if (!currentAudio) return;
      currentAudio.play().catch((err) => {
        // Bloqueo esperado de navegador si no hubo gesto previo
        console.warn('Reproducción de audio a la espera de interacción:', err);
      });
    };

    // Exponer la función globalmente para que el botón "Empezar" la invoque directamente
    window.__playInvitationMusic = playAudio;

    const handleCustomPlay = () => playAudio();
    window.addEventListener('play-invitation-music', handleCustomPlay);

    // Intentar reproducir de inmediato (si el navegador lo permite)
    playAudio();

    // Desbloquear con cualquier primer clic o toque en la pantalla
    const onUserInteraction = () => {
      const currentAudio = audioRef.current || window.__invitationAudio;
      if (currentAudio && currentAudio.paused) {
        currentAudio.play().then(() => {
          removeListeners();
        }).catch(() => {
          // Si falla, los listeners quedan activos para la siguiente interacción
        });
      }
    };

    const removeListeners = () => {
      window.removeEventListener('click', onUserInteraction);
      window.removeEventListener('touchend', onUserInteraction);
    };

    window.addEventListener('click', onUserInteraction, { passive: true });
    window.addEventListener('touchend', onUserInteraction, { passive: true });

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      window.removeEventListener('play-invitation-music', handleCustomPlay);
      removeListeners();
    };
  }, [audioSrc, defaultVolume]);

  const togglePlay = () => {
    const audio = audioRef.current || window.__invitationAudio;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
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
