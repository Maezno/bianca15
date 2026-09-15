'use client';

import React, { useState, useTransition, useEffect } from 'react';
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
  const [mode, setMode] = useState<'attend' | 'decline'>(initialMode);
  const [rsvpType, setRsvpType] = useState<'individual' | 'family'>('individual');
  const [members, setMembers] = useState<string[]>(['']);
  const [familyName, setFamilyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
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

  if (!isOpen) return null;

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

  return (
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
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.05)',
          padding: '2rem 1.75rem',
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
          <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
            <div
              style={{
                fontSize: '3.5rem',
                marginBottom: '1rem',
                animation: 'bounce 0.5s ease',
              }}
            >
              {mode === 'attend' ? '🎉' : '💌'}
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
        ) : (
          /* Formulario */
          <form onSubmit={handleSubmit}>
            {/* Encabezado */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: primaryColor,
                  marginBottom: '0.35rem',
                }}
              >
                {eventTitle || 'Confirmación de Asistencia'}
              </span>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: headingFont,
                }}
              >
                {mode === 'attend' ? '¿Nos vas a acompañar?' : 'Avisar que no podré asistir'}
              </h2>
            </div>

            {/* Alternador de Modo: Asistiré / No asistiré */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                backgroundColor: '#f1f5f9',
                padding: '0.35rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('attend');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: mode === 'attend' ? '#ffffff' : 'transparent',
                  color: mode === 'attend' ? primaryColor : '#64748b',
                  boxShadow: mode === 'attend' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                ✨ Sí, asistiré
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('decline');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: mode === 'decline' ? '#ffffff' : 'transparent',
                  color: mode === 'decline' ? '#dc2626' : '#64748b',
                  boxShadow: mode === 'decline' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                No podré asistir
              </button>
            </div>

            {/* Si asistirá: Selección Individual o Familia */}
            {mode === 'attend' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.5rem',
                  }}
                >
                  ¿Venís solo/a o con tu familia?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setRsvpType('individual');
                      setMembers([members[0] || '']);
                    }}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: '0.75rem',
                      border: rsvpType === 'individual' ? `2px solid ${primaryColor}` : '2px solid #e2e8f0',
                      backgroundColor: rsvpType === 'individual' ? `${primaryColor}10` : '#ffffff',
                      color: rsvpType === 'individual' ? primaryColor : '#475569',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                    Individual
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRsvpType('family');
                      if (members.length < 2) {
                        setMembers((prev) => (prev[0] ? [prev[0], ''] : ['', '']));
                      }
                    }}
                    style={{
                      padding: '0.85rem 0.5rem',
                      borderRadius: '0.75rem',
                      border: rsvpType === 'family' ? `2px solid ${primaryColor}` : '2px solid #e2e8f0',
                      backgroundColor: rsvpType === 'family' ? `${primaryColor}10` : '#ffffff',
                      color: rsvpType === 'family' ? primaryColor : '#475569',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>👨‍👩‍👧‍👦</span>
                    Familia / Grupo
                  </button>
                </div>
              </div>
            )}

            {/* Campos según modo y tipo */}
            {mode === 'attend' ? (
              rsvpType === 'individual' ? (
                /* Individual: una sola línea con Nombre y Apellido */
                <div style={{ marginBottom: '1.25rem' }}>
                  <label
                    htmlFor="rsvp-single-name"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Nombre y Apellido
                  </label>
                  <input
                    id="rsvp-single-name"
                    type="text"
                    required
                    autoFocus
                    placeholder="Escribí tu nombre y apellido"
                    value={members[0] || ''}
                    onChange={(e) => handleMemberChange(0, e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.75rem',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
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
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label
                      htmlFor="rsvp-family-name"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: '#334155',
                        marginBottom: '0.35rem',
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
                        padding: '0.75rem 1rem',
                        borderRadius: '0.75rem',
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

                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Integrantes que asistirán
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {members.map((member, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          animation: 'fadeIn 0.2s ease-out forwards',
                        }}
                      >
                        <input
                          type="text"
                          required={idx === 0}
                          placeholder={idx === 0 ? 'Nombre y apellido (Integrante 1)' : `Nombre y apellido (Integrante ${idx + 1})`}
                          value={member}
                          onChange={(e) => handleMemberChange(idx, e.target.value)}
                          style={{
                            flex: 1,
                            boxSizing: 'border-box',
                            padding: '0.8rem 1rem',
                            borderRadius: '0.75rem',
                            border: '2px solid #e2e8f0',
                            fontSize: '0.95rem',
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
                              padding: '0.75rem',
                              borderRadius: '0.6rem',
                              border: 'none',
                              backgroundColor: '#fee2e2',
                              color: '#ef4444',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem',
                              lineHeight: 1,
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Botón + para agregar integrantes sin límite debajo del primer integrante */}
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1.15rem',
                        borderRadius: '0.75rem',
                        border: `2px dashed ${primaryColor}`,
                        backgroundColor: `${primaryColor}08`,
                        color: primaryColor,
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s, transform 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${primaryColor}18`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${primaryColor}08`)}
                    >
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                      Agregar otro integrante
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Modo declinar: pide nombre y apellido o familia */
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="decline-name"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Nombre y Apellido o Familia
                </label>
                <input
                  id="decline-name"
                  type="text"
                  required
                  placeholder="Ej: Laura Gómez / Familia Pérez"
                  value={members[0] || familyName}
                  onChange={(e) => {
                    handleMemberChange(0, e.target.value);
                    setFamilyName(e.target.value);
                  }}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.85rem 1rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Teléfono de contacto opcional */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="rsvp-phone"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '0.25rem',
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
                  padding: '0.7rem 1rem',
                  borderRadius: '0.65rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>

            {/* Mensaje o dedicatoria opcional */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="rsvp-comment"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#64748b',
                  marginBottom: '0.25rem',
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
                  padding: '0.7rem 1rem',
                  borderRadius: '0.65rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '60px',
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
                  padding: '0.75rem 1rem',
                  borderRadius: '0.65rem',
                  fontSize: '0.875rem',
                  marginBottom: '1.25rem',
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Botón LISTO */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  flex: 1,
                  padding: '0.95rem 1.5rem',
                  borderRadius: '0.85rem',
                  border: 'none',
                  backgroundColor: mode === 'attend' ? primaryColor : '#475569',
                  color: '#ffffff',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: isPending ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'opacity 0.15s, transform 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
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
                  padding: '0.95rem 1.25rem',
                  borderRadius: '0.85rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  fontSize: '0.95rem',
                  fontWeight: 600,
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
}
