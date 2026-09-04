'use client';

import React from 'react';

interface SectionErrorBoundaryProps {
  /** Identificador de la sección, utilizado en logs de error */
  sectionId?: string;
  children: React.ReactNode;
  /** Nodo alternativo a mostrar en lugar del fallback por defecto */
  fallback?: React.ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

/**
 * SectionErrorBoundary
 *
 * Error Boundary de React que aísla secciones opcionales de la invitación pública
 * (fotos, mapa, cronograma, cuenta regresiva, etc.).
 *
 * Si una sección falla en tiempo de render, el resto de la invitación permanece
 * intacta. El error queda registrado en consola para diagnóstico sin exponer
 * detalles técnicos al invitado.
 *
 * Hito 10 — Resiliencia y Error Boundaries.
 */
export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): SectionErrorBoundaryState {
    const message =
      error instanceof Error ? error.message : 'Error desconocido';
    return { hasError: true, errorMessage: message };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    const section = this.props.sectionId ?? 'desconocida';
    console.error(
      `[SectionErrorBoundary] Error en sección "${section}":`,
      error,
      info.componentStack,
    );
  }

  override render() {
    if (this.state.hasError) {
      // Si se pasó un fallback personalizado, usarlo directamente
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto: aviso mínimo, sin datos técnicos
      return (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#64748b',
            margin: '0.5rem 0',
          }}
        >
          Esta sección no está disponible temporalmente.
        </div>
      );
    }

    return this.props.children;
  }
}
