import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Página no encontrada',
  description: 'El enlace que buscás no existe o ya no está disponible.',
  robots: { index: false, follow: false },
};

/**
 * Página 404 global del proyecto.
 *
 * Diseño genérico multi-evento. Se muestra cuando:
 *   - Un token de invitación no existe (vía notFound())
 *   - Un slug de evento no existe
 *   - Cualquier ruta no definida
 *
 * Hito 10 — Resiliencia, errores y SEO.
 */
export default function NotFound() {
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
        boxSizing: 'border-box',
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
        {/* Ícono / código de error */}
        <div
          style={{
            fontSize: '3.5rem',
            lineHeight: 1,
            marginBottom: '0.75rem',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          🔍
        </div>

        <p
          style={{
            fontSize: '4rem',
            fontWeight: 900,
            color: '#e2e8f0',
            margin: '0 0 0.25rem',
            lineHeight: 1,
            letterSpacing: '-0.05em',
          }}
        >
          404
        </p>

        <h1
          style={{
            fontSize: '1.375rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.75rem',
            lineHeight: 1.25,
          }}
        >
          Enlace no encontrado
        </h1>

        <p
          style={{
            color: '#64748b',
            fontSize: '0.95rem',
            margin: '0 0 0.5rem',
            lineHeight: 1.65,
          }}
        >
          El enlace que utilizaste no existe o ya no está disponible.
        </p>

        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            margin: '0 0 2rem',
            lineHeight: 1.5,
          }}
        >
          Si recibiste este enlace de otra persona, contactate con ella para
          que te reenvíe un enlace válido.
        </p>

        <Link
          href="/"
          id="not-found-home-link"
          style={{
            display: 'inline-block',
            padding: '0.7rem 1.75rem',
            borderRadius: '0.625rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
