'use client';

import { useEffect } from 'react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * app/error.tsx
 *
 * Página de error global de Next.js (App Router).
 * Se muestra cuando un Server Component o Client Component lanza
 * una excepción no capturada durante el render de una ruta.
 *
 * Diseño limpio y amigable, sin exponer stack traces al usuario final.
 * Hito 10 — Resiliencia y manejo de errores.
 */
export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Registrar el error para diagnóstico (podría enviarse a Sentry, etc.)
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          padding: '3rem 2.5rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontSize: '1.75rem',
          }}
        >
          ⚠️
        </div>

        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.75rem',
            lineHeight: 1.2,
          }}
        >
          Algo salió mal
        </h1>

        <p
          style={{
            color: '#64748b',
            fontSize: '0.95rem',
            margin: '0 0 2rem',
            lineHeight: 1.6,
          }}
        >
          Ocurrió un error inesperado. Podés intentar recargar la página o
          volver a intentarlo en unos momentos.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            id="error-retry-btn"
            onClick={reset}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
            }
          >
            Reintentar
          </button>

          <a
            id="error-home-link"
            href="/"
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.625rem',
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                '#e2e8f0')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                '#f1f5f9')
            }
          >
            Volver al inicio
          </a>
        </div>

        {process.env.NODE_ENV === 'development' && error?.digest && (
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'monospace',
            }}
          >
            Digest: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
