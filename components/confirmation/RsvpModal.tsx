'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { submitPublicRsvp } from '@/lib/confirmations/public-rsvp';
import type { TemplateTheme } from '@/templates/types';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventSlug?: string;
  eventTitle?: string;
  theme?: TemplateTheme;
  initialMode?: 'attend' | 'decline';
}

export function RsvpModal({
  isOpen,
  onClose,
  eventId,
  eventSlug,
  eventTitle,
  theme,
  initialMode = 'attend',
}: RsvpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'attend' | 'decline'>(initialMode);
  // Nuevo estado para el paso. Si asiste, arranca en paso 1 (selección de tipo). Si declina, va directo al paso 2.
  const [step, setStep] = useState<1 | 2>(initialMode === 'attend' ? 1 : 2);
  const [rsvpType, setRsvpType] = useState<'individual' | 'family'>('individual');
  const [members, setMembers] = useState<string[]>(['']);
  const [familyName, setFamilyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(initialMode === 'attend' ? 1 : 2);
      setRsvpType('individual');
      setMembers(['']);
      setFamilyName('');
      setPhone('');
      setComment('');
      setErrorMsg(null);
      setIsSuccess(false);
      // Evitar scroll del fondo cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialMode]);

  if (!isOpen || !mounted) return null;

  const primaryColor = theme?.colors?.primary || '#9333ea';
  const headingFont = theme?.typography?.headingFont || 'inherit';

  const handleAddMember = () => {
    setMembers((prev) => [...prev, '']);
  };

  const handleMemberChange = (index: number, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (errorMsg) setErrorMsg(null);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const validMembers = members.map((m) => m.trim()).filter(Boolean);

    if (mode === 'attend') {
      if (validMembers.length === 0) {
        setErrorMsg('Por favor, escribí tu nombre y apellido.');
        return;
      }
    } else {
      // Modo declinar
      if (validMembers.length === 0 && !familyName.trim()) {
        setErrorMsg('Por favor, ingresá tu nombre o el de tu familia.');
        return;
      }
    }

    startTransition(async () => {
      const res = await submitPublicRsvp({
        eventId,
        eventSlug,
        type: rsvpType,
        name: familyName.trim() || undefined,
        members: validMembers.length > 0 ? validMembers : [familyName.trim()],
        status: mode === 'attend' ? 'confirmed' : 'declined',
        phone: phone.trim() || undefined,
        comment: comment.trim() || undefined,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(res.error || 'Ocurrió un error al guardar. Intentá nuevamente.');
      }
    });
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(5, 5, 10, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#1e293b',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s, color 0.15s',
              zIndex: 30,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            ✕
          </button>

          {isSuccess ? (
            /* Pantalla de confirmación exitosa */
            <div style={{ textAlign: 'center', padding: '2.5rem 1.75rem', overflowY: 'auto' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: mode === 'attend' ? '#dcfce7' : '#f1f5f9',
                  color: mode === 'attend' ? '#16a34a' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  margin: '0 auto 1rem auto',
                  fontWeight: 700,
                }}
              >
                {mode === 'attend' ? '✓' : '—'}
              </div>
              <h3
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: mode === 'attend' ? '#166534' : '#334155',
                  marginBottom: '0.75rem',
                  fontFamily: headingFont,
                }}
              >
                {mode === 'attend' ? '¡Asistencia Confirmada!' : 'Gracias por avisarnos'}
              </h3>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  marginBottom: '1.75rem',
                }}
              >
                {mode === 'attend'
                  ? `¡Qué alegría contar con vos${rsvpType === 'family' ? ' y tu familia' : ''}! Nos vemos para celebrar mis 15.`
                  : 'Lamentamos que no puedas acompañarnos, ¡pero te agradecemos mucho por avisar!'}
              </p>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.85rem 2rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: primaryColor,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
              >
                Listo
              </button>
            </div>
          ) : mode === 'attend' && step === 1 ? (
            /* Paso 1: Elegir el tipo de asistencia */
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ padding: '2rem 1.5rem 0.5rem 1.5rem', flexShrink: 0, textAlign: 'center' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: primaryColor,
                    marginBottom: '0.3rem',
                  }}
                >
                  {eventTitle || 'Confirmación de Asistencia'}
                </span>
                <h2
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    fontFamily: headingFont,
                  }}
                >
                  ¿Venís solo/a o con tu familia?
                </h2>
              </div>
              
              <div style={{ padding: '1.5rem 1.5rem 2rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setRsvpType('individual');
                    setMembers([members[0] || '']);
                    setStep(2);
                  }}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.85rem',
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <span style={{ fontSize: '1.75rem' }}>👤</span>
                  Asistiré individualmente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRsvpType('family');
                    if (members.length < 2) {
                      setMembers((prev) => (prev[0] ? [prev[0], ''] : ['', '']));
                    }
                    setStep(2);
                  }}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '0.85rem',
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <span style={{ fontSize: '1.75rem' }}>👥</span>
                  Asistiré con mi grupo / familia
                </button>
              </div>

              <div
                style={{
                  padding: '1rem 1.5rem calc(1rem + env(safe-area-inset-bottom, 0px)) 1.5rem',
                  borderTop: '1px solid #f1f5f9',
                  textAlign: 'center',
                  backgroundColor: '#ffffff'
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.5rem 1.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Formulario (Paso 2) */
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Encabezado Fijo Arriba */}
              <div style={{ padding: '1.25rem 1.5rem 0.25rem 1.5rem', flexShrink: 0, textAlign: 'center', position: 'relative' }}>
                {mode === 'attend' && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '1.25rem',
                      background: 'none',
                      border: 'none',
                      color: primaryColor,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    ← Volver
                  </button>
                )}
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: primaryColor,
                    marginBottom: '0.25rem',
                  }}
                >
                  {eventTitle || 'Confirmación de Asistencia'}
                </span>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    fontFamily: headingFont,
                  }}
                >
                  {mode === 'attend' ? 'Completá tus datos' : 'Avisar que no podré asistir'}
                </h2>
              </div>

              {/* Contenido scrolleable del formulario */}
              <div style={{ padding: '1rem 1.5rem 0.75rem 1.5rem', overflowY: 'auto', flex: 1, minHeight: 0 }}>

            {/* Campos según modo y tipo */}
            {mode === 'attend' ? (
              rsvpType === 'individual' ? (
                /* Individual: una sola línea con Nombre y Apellido */
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    htmlFor="rsvp-single-name"
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '0.3rem',
                    }}
                  >
                    Nombre y Apellido
                  </label>
                  <input
                    id="rsvp-single-name"
                    type="text"
                    autoFocus
                    placeholder="Escribí tu nombre y apellido"
                    value={members[0] || ''}
                    onChange={(e) => handleMemberChange(0, e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.7rem 0.85rem',
                      borderRadius: '0.6rem',
                      border: '2px solid #e2e8f0',
                      fontSize: '0.95rem',
                      color: '#0f172a',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              ) : (
                /* Familia: Nombre de familia + lista de integrantes en una sola línea */
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.6rem' }}>
                    <label
                      htmlFor="rsvp-family-name"
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.3rem',
                      }}
                    >
                      Nombre de la Familia o Grupo (opcional)
                    </label>
                    <input
                      id="rsvp-family-name"
                      type="text"
                      placeholder="Ej: Familia Gómez"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '0.6rem',
                        border: '2px solid #e2e8f0',
                        fontSize: '0.9rem',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                      onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                    />
                  </div>

                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Integrantes que asistirán
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {members.map((member, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          animation: 'fadeIn 0.2s ease-out forwards',
                        }}
                      >
                        <input
                          type="text"
                          placeholder={idx === 0 ? 'Nombre y apellido (Integrante 1)' : `Nombre y apellido (Integrante ${idx + 1})`}
                          value={member}
                          onChange={(e) => handleMemberChange(idx, e.target.value)}
                          style={{
                            flex: 1,
                            boxSizing: 'border-box',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '0.6rem',
                            border: '2px solid #e2e8f0',
                            fontSize: '0.9rem',
                            color: '#0f172a',
                            outline: 'none',
                            transition: 'border-color 0.15s ease',
                          }}
                          onFocus={(e) => (e.target.style.borderColor = primaryColor)}
                          onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                        />
                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            aria-label={`Quitar integrante ${idx + 1}`}
                            title="Quitar integrante"
                            style={{
                              padding: '0.65rem',
                              borderRadius: '0.5rem',
                              border: 'none',
                              backgroundColor: '#fee2e2',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                              lineHeight: 1,
                              fontWeight: 700,
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botón + para agregar integrantes sin límite debajo del primer integrante */}
                  <div style={{ marginTop: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.6rem',
                        border: `2px dashed ${primaryColor}`,
                        backgroundColor: `${primaryColor}08`,
                        color: primaryColor,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, transform 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${primaryColor}18`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${primaryColor}08`)}
                    >
                      <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
                      Agregar otro integrante
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Modo declinar: pide nombre y apellido o familia */
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="decline-name"
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.3rem',
                  }}
                >
                  Nombre y Apellido o Familia
                </label>
                <input
                  id="decline-name"
                  type="text"
                  placeholder="Ej: Laura Gómez / Familia Pérez"
                  value={members[0] || familyName}
                  onChange={(e) => {
                    handleMemberChange(0, e.target.value);
                    setFamilyName(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.7rem 0.85rem',
                    borderRadius: '0.6rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.95rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Teléfono de contacto opcional */}
            <div style={{ marginBottom: '0.8rem' }}>
              <label
                htmlFor="rsvp-phone"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '0.2rem',
                }}
              >
                Teléfono / WhatsApp (opcional)
              </label>
              <input
                id="rsvp-phone"
                type="tel"
                placeholder="Ej: 11 2345-6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.55rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>

            {/* Mensaje o dedicatoria opcional */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="rsvp-comment"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '0.2rem',
                }}
              >
                Mensaje o dedicatoria (opcional)
              </label>
              <textarea
                id="rsvp-comment"
                rows={2}
                placeholder="¡Nos vemos en la fiesta! / Un saludo grande."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.55rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '50px',
                }}
              />
            </div>

            {/* Mensaje de error */}
            {errorMsg && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #f87171',
                  color: '#b91c1c',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.55rem',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                {errorMsg}
              </div>
            )}

              </div>

              {/* Botones Fijos Abajo: Siempre visibles sin necesidad de scrollear */}
              <div
                style={{
                  padding: '0.75rem 1.5rem calc(0.75rem + env(safe-area-inset-bottom, 0px)) 1.5rem',
                  borderTop: '1px solid #f1f5f9',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  gap: '0.6rem',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 20,
                }}
              >
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.7rem',
                    border: 'none',
                    backgroundColor: mode === 'attend' ? primaryColor : '#475569',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: isPending ? 'wait' : 'pointer',
                    pointerEvents: 'auto',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: 'opacity 0.15s, transform 0.1s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!isPending) e.currentTarget.style.opacity = '0.92';
                  }}
                  onMouseLeave={(e) => {
                    if (!isPending) e.currentTarget.style.opacity = '1';
                  }}
                >
                  {isPending ? 'Guardando...' : 'Listo, confirmar'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.7rem',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    pointerEvents: 'auto',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
