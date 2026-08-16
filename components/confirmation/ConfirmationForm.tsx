'use client';

import { useState, useEffect, useTransition } from 'react';
import { saveConfirmation } from '@/lib/confirmations/save-confirmation';
import { DIETARY_OPTIONS, MAX_COMMENT_LENGTH, MAX_NAME_LENGTH } from '@/lib/confirmations/validation';
import type { ExistingConfirmation } from '@/lib/confirmations/types';

// ─── Types ───────────────────────────────────────────────────────────
type Step =
  | 'initial'
  | 'attendance'
  | 'confirm_no'
  | 'count'
  | 'names'
  | 'restrictions'
  | 'comment'
  | 'summary'
  | 'success'
  | 'declined_success';

interface AttendeeData {
  name: string;
  dietary: string;   // DietaryOption value or custom text (for 'other')
  dietaryKey: string; // The selected option key ('none'|'vegetarian'|...|'other')
  dietaryOther: string; // Custom text when dietaryKey === 'other'
}

interface ConfirmationFormProps {
  token: string;
  maxGuests: number;
  groupName: string;
  eventTitle: string;
  existingConfirmation: ExistingConfirmation | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────
function labelForDietary(value: string | null): string {
  if (!value) return 'Ninguna';
  const opt = DIETARY_OPTIONS.find((o) => o.value === value);
  return opt ? opt.label : value; // custom text falls through
}

function buildInitialAttendees(existing: ExistingConfirmation | null): AttendeeData[] {
  if (existing?.attendees?.length) {
    return existing.attendees.map((a) => {
      const knownOpt = DIETARY_OPTIONS.find((o) => o.value === (a.dietaryRestriction ?? 'none'));
      const dietaryKey = knownOpt ? knownOpt.value : 'other';
      const dietaryOther = knownOpt ? '' : (a.dietaryRestriction ?? '');
      return {
        name: a.name,
        dietary: a.dietaryRestriction ?? 'none',
        dietaryKey,
        dietaryOther,
      };
    });
  }
  return [{ name: '', dietary: 'none', dietaryKey: 'none', dietaryOther: '' }];
}

// ─── Main Component ───────────────────────────────────────────────────
export function ConfirmationForm({
  token,
  maxGuests,
  groupName,
  eventTitle,
  existingConfirmation,
}: ConfirmationFormProps) {
  const initialStep: Step = existingConfirmation ? 'initial' : 'attendance';

  const [step, setStep] = useState<Step>(initialStep);
  const [isPending, startTransition] = useTransition();
  const [attending, setAttending] = useState<boolean | null>(
    existingConfirmation ? existingConfirmation.status === 'confirmed' : null
  );
  const [count, setCount] = useState<number>(
    existingConfirmation?.guestsCount ?? 1
  );
  const [attendees, setAttendees] = useState<AttendeeData[]>(
    buildInitialAttendees(existingConfirmation)
  );
  const [comment, setComment] = useState<string>(
    existingConfirmation?.comment ?? ''
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [nameErrors, setNameErrors] = useState<Record<number, string>>({});

  // Sync attendees array when count changes
  useEffect(() => {
    setAttendees((prev) => {
      const next = [...prev];
      while (next.length < count) {
        next.push({ name: '', dietary: 'none', dietaryKey: 'none', dietaryOther: '' });
      }
      return next.slice(0, count);
    });
  }, [count]);

  // ─── Navigation helpers ─────────────────────────────────────────────
  function startEditing() {
    setAttending(existingConfirmation?.status === 'confirmed' ? true : existingConfirmation?.status === 'declined' ? false : null);
    setCount(existingConfirmation?.guestsCount ?? 1);
    setAttendees(buildInitialAttendees(existingConfirmation));
    setComment(existingConfirmation?.comment ?? '');
    setSubmitError(null);
    setNameErrors({});
    setStep('attendance');
  }

  function handleAttendanceYes() {
    setAttending(true);
    setStep('count');
  }

  function handleAttendanceNo() {
    setAttending(false);
    setStep('confirm_no');
  }

  function validateNames(): boolean {
    const errors: Record<number, string> = {};
    attendees.forEach((a, i) => {
      const name = a.name.trim();
      if (!name) {
        errors[i] = 'El nombre es obligatorio.';
      } else if (name.length > MAX_NAME_LENGTH) {
        errors[i] = `Máximo ${MAX_NAME_LENGTH} caracteres.`;
      }
    });
    setNameErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNamesNext() {
    if (validateNames()) setStep('restrictions');
  }

  // ─── Submit helpers ──────────────────────────────────────────────────
  function buildFinalAttendees() {
    return attendees.map((a) => ({
      name: a.name.trim(),
      dietaryRestriction:
        a.dietaryKey === 'other' && a.dietaryOther.trim()
          ? a.dietaryOther.trim()
          : a.dietaryKey === 'other'
          ? 'other'
          : a.dietaryKey,
    }));
  }

  function submitConfirmation() {
    setSubmitError(null);
    startTransition(async () => {
      const finalAttendees = attending ? buildFinalAttendees() : [];
      const result = await saveConfirmation({
        token,
        status: attending ? 'confirmed' : 'declined',
        guestsCount: attending ? count : 0,
        attendees: finalAttendees,
        comment: comment.trim(),
      });
      if (result.success) {
        setStep(attending ? 'success' : 'declined_success');
      } else {
        setSubmitError(
          result.error ?? 'No pudimos guardar tu confirmación. Por favor intentá nuevamente.'
        );
      }
    });
  }

  function submitDeclined() {
    setSubmitError(null);
    startTransition(async () => {
      const result = await saveConfirmation({
        token,
        status: 'declined',
        guestsCount: 0,
        attendees: [],
        comment: '',
      });
      if (result.success) {
        setStep('declined_success');
      } else {
        setSubmitError(
          result.error ?? 'No pudimos guardar tu respuesta. Por favor intentá nuevamente.'
        );
      }
    });
  }

  // ─── Styles ────────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: '1.25rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    padding: '2rem 1.5rem',
    maxWidth: '480px',
    margin: '1.5rem auto',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  };
  const heading: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '1.25rem',
    textAlign: 'center',
    lineHeight: 1.3,
  };
  const subtext: React.CSSProperties = {
    fontSize: '0.95rem',
    color: '#555',
    textAlign: 'center',
    marginBottom: '1.5rem',
  };
  const btn = (variant: 'primary' | 'secondary' | 'danger' | 'ghost'): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: variant === 'secondary' || variant === 'ghost' ? '2px solid #e2e8f0' : 'none',
    background:
      variant === 'primary' ? '#9333ea' :
      variant === 'danger'  ? '#dc2626' :
      '#fff',
    color:
      variant === 'primary' ? '#fff' :
      variant === 'danger'  ? '#fff' :
      '#374151',
    marginBottom: '0.75rem',
    transition: 'opacity 0.15s',
    textAlign: 'center' as const,
    letterSpacing: '0.03em',
  });
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.6rem',
    border: '2px solid #e2e8f0',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginTop: '0.25rem',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.15rem',
    fontSize: '0.875rem',
  };
  const errorText: React.CSSProperties = {
    color: '#dc2626',
    fontSize: '0.8rem',
    marginTop: '0.25rem',
  };
  const divider: React.CSSProperties = {
    borderTop: '1px solid #f1f5f9',
    margin: '1.25rem 0',
  };

  // ─── Error banner ───────────────────────────────────────────────────
  const ErrorBanner = () =>
    submitError ? (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '0.6rem',
          padding: '0.75rem 1rem',
          color: '#991b1b',
          fontSize: '0.9rem',
          marginBottom: '1rem',
        }}
      >
        {submitError}
      </div>
    ) : null;

  // ─── Step: INITIAL (existing confirmation) ─────────────────────────
  if (step === 'initial' && existingConfirmation) {
    const ec = existingConfirmation;

    if (ec.status === 'confirmed') {
      return (
        <div style={card}>
          <p style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</p>
          <h2 style={{ ...heading, color: '#166534' }}>Ya confirmaste tu asistencia</h2>
          <p style={{ ...subtext, marginBottom: '0.5rem' }}>
            <strong>{groupName}</strong>
          </p>
          <p style={subtext}>
            {ec.guestsCount === 1 ? '1 persona' : `${ec.guestsCount} personas`}
          </p>
          {ec.attendees.length > 0 && (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 1.25rem',
                textAlign: 'center',
              }}
            >
              {ec.attendees.map((a, i) => (
                <li key={i} style={{ color: '#374151', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {a.name}
                  {a.dietaryRestriction && a.dietaryRestriction !== 'none' && (
                    <span style={{ color: '#9333ea', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                      · {labelForDietary(a.dietaryRestriction)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {ec.comment && (
            <p style={{ ...subtext, fontStyle: 'italic', marginBottom: '1.25rem' }}>
              "{ec.comment}"
            </p>
          )}
          <div style={divider} />
          <button style={btn('secondary')} onClick={startEditing} type="button">
            MODIFICAR CONFIRMACIÓN
          </button>
        </div>
      );
    }

    if (ec.status === 'declined') {
      return (
        <div style={card}>
          <p style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>🤍</p>
          <h2 style={{ ...heading, color: '#374151' }}>
            Actualmente indicaste que no podrás asistir
          </h2>
          <p style={subtext}>¿Cambiaste de opinión?</p>
          <button
            style={btn('primary')}
            onClick={() => {
              setAttending(null);
              setStep('attendance');
            }}
            type="button"
          >
            SÍ, AHORA VOY 🎉
          </button>
        </div>
      );
    }
  }

  // ─── Step: ATTENDANCE (¿SÍ o NO?) ─────────────────────────────────
  if (step === 'attendance') {
    return (
      <div style={card}>
        <p style={{ ...subtext, marginBottom: '0.5rem' }}>{groupName}</p>
        <h2 style={heading}>¿VAS A ACOMPAÑARME?</h2>
        <p style={{ ...subtext, color: '#9333ea', fontWeight: 600 }}>{eventTitle}</p>
        <div style={{ marginTop: '1.5rem' }}>
          <button style={btn('primary')} onClick={handleAttendanceYes} type="button">
            SÍ, VOY A ESTAR 🎉
          </button>
          <button style={btn('secondary')} onClick={handleAttendanceNo} type="button">
            NO PODRÉ ASISTIR 🤍
          </button>
        </div>
        <ErrorBanner />
      </div>
    );
  }

  // ─── Step: CONFIRM NO ──────────────────────────────────────────────
  if (step === 'confirm_no') {
    return (
      <div style={card}>
        <p style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.75rem' }}>🤍</p>
        <h2 style={heading}>¿Estás seguro de que no podrás acompañarme?</h2>
        <p style={subtext}>Sentiremos mucho no tenerte.</p>
        <div style={{ marginTop: '1rem' }}>
          <button style={btn('primary')} onClick={() => setStep('attendance')} type="button">
            VOLVER
          </button>
          <button
            style={{ ...btn('secondary'), color: '#dc2626', borderColor: '#fca5a5' }}
            onClick={submitDeclined}
            disabled={isPending}
            type="button"
            aria-busy={isPending}
          >
            {isPending ? 'GUARDANDO...' : 'CONFIRMAR QUE NO ASISTIRÉ'}
          </button>
        </div>
        <ErrorBanner />
      </div>
    );
  }

  // ─── Step: COUNT ───────────────────────────────────────────────────
  if (step === 'count') {
    return (
      <div style={card}>
        <p style={{ ...subtext, marginBottom: '0.5rem' }}>{groupName}</p>
        <h2 style={heading}>¿CUÁNTAS PERSONAS VAN A ASISTIR?</h2>
        <p style={subtext}>Tu grupo tiene hasta {maxGuests} {maxGuests === 1 ? 'cupo' : 'cupos'}.</p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            margin: '1.5rem 0',
          }}
        >
          <button
            type="button"
            aria-label="Disminuir cantidad"
            disabled={count <= 1}
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              border: '2px solid #e2e8f0',
              background: count <= 1 ? '#f8fafc' : '#fff',
              fontSize: '1.5rem',
              cursor: count <= 1 ? 'not-allowed' : 'pointer',
              color: count <= 1 ? '#cbd5e1' : '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            −
          </button>

          <span
            style={{ fontSize: '2.5rem', fontWeight: 700, color: '#9333ea', minWidth: '2rem', textAlign: 'center' }}
            aria-live="polite"
            aria-label={`${count} ${count === 1 ? 'persona' : 'personas'}`}
          >
            {count}
          </span>

          <button
            type="button"
            aria-label="Aumentar cantidad"
            disabled={count >= maxGuests}
            onClick={() => setCount((c) => Math.min(maxGuests, c + 1))}
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              border: '2px solid #e2e8f0',
              background: count >= maxGuests ? '#f8fafc' : '#fff',
              fontSize: '1.5rem',
              cursor: count >= maxGuests ? 'not-allowed' : 'pointer',
              color: count >= maxGuests ? '#cbd5e1' : '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            +
          </button>
        </div>

        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {count === 1 ? '1 persona' : `${count} personas`}
        </p>

        <button style={btn('primary')} onClick={() => setStep('names')} type="button">
          CONTINUAR
        </button>
        <button style={btn('ghost')} onClick={() => setStep('attendance')} type="button">
          VOLVER
        </button>
      </div>
    );
  }

  // ─── Step: NAMES ───────────────────────────────────────────────────
  if (step === 'names') {
    return (
      <div style={card}>
        <p style={{ ...subtext, marginBottom: '0.5rem' }}>{groupName}</p>
        <h2 style={heading}>¿QUIÉNES VAN A ACOMPAÑARME?</h2>
        <p style={subtext}>{count === 1 ? 'Ingresá el nombre de la persona.' : `Ingresá los nombres de las ${count} personas.`}</p>

        {attendees.slice(0, count).map((a, i) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <label
              htmlFor={`attendee-name-${i}`}
              style={labelStyle}
            >
              Persona {i + 1}
            </label>
            <input
              id={`attendee-name-${i}`}
              type="text"
              value={a.name}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              placeholder="Nombre completo"
              style={{
                ...inputStyle,
                borderColor: nameErrors[i] ? '#fca5a5' : '#e2e8f0',
              }}
              aria-describedby={nameErrors[i] ? `attendee-name-error-${i}` : undefined}
              aria-invalid={!!nameErrors[i]}
              onChange={(e) => {
                const val = e.target.value;
                setAttendees((prev) => {
                  const next = [...prev];
                  next[i] = { ...next[i], name: val };
                  return next;
                });
                if (nameErrors[i]) {
                  setNameErrors((prev) => {
                    const next = { ...prev };
                    delete next[i];
                    return next;
                  });
                }
              }}
            />
            {nameErrors[i] && (
              <p id={`attendee-name-error-${i}`} style={errorText} role="alert">
                {nameErrors[i]}
              </p>
            )}
          </div>
        ))}

        <button style={btn('primary')} onClick={handleNamesNext} type="button">
          CONTINUAR
        </button>
        <button style={btn('ghost')} onClick={() => setStep('count')} type="button">
          VOLVER
        </button>
      </div>
    );
  }

  // ─── Step: RESTRICTIONS ────────────────────────────────────────────
  if (step === 'restrictions') {
    return (
      <div style={card}>
        <p style={{ ...subtext, marginBottom: '0.5rem' }}>{groupName}</p>
        <h2 style={heading}>RESTRICCIONES ALIMENTARIAS</h2>
        <p style={subtext}>Indicanos si alguien tiene una restricción especial.</p>

        {attendees.slice(0, count).map((a, i) => (
          <div key={i} style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              {a.name.trim() || `Persona ${i + 1}`}
            </p>
            <label htmlFor={`dietary-${i}`} style={labelStyle}>
              Restricción alimentaria
            </label>
            <select
              id={`dietary-${i}`}
              value={a.dietaryKey}
              style={{ ...inputStyle, appearance: 'auto' }}
              onChange={(e) => {
                const key = e.target.value;
                setAttendees((prev) => {
                  const next = [...prev];
                  next[i] = {
                    ...next[i],
                    dietaryKey: key,
                    dietary: key,
                    dietaryOther: key !== 'other' ? '' : next[i].dietaryOther,
                  };
                  return next;
                });
              }}
            >
              {DIETARY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {a.dietaryKey === 'other' && (
              <div style={{ marginTop: '0.5rem' }}>
                <label htmlFor={`dietary-other-${i}`} style={labelStyle}>
                  Especificar:
                </label>
                <input
                  id={`dietary-other-${i}`}
                  type="text"
                  value={a.dietaryOther}
                  maxLength={MAX_NAME_LENGTH}
                  placeholder="Ej: Alergia al maní"
                  style={inputStyle}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAttendees((prev) => {
                      const next = [...prev];
                      next[i] = { ...next[i], dietaryOther: val };
                      return next;
                    });
                  }}
                />
              </div>
            )}
          </div>
        ))}

        <button style={btn('primary')} onClick={() => setStep('comment')} type="button">
          CONTINUAR
        </button>
        <button style={btn('ghost')} onClick={() => setStep('names')} type="button">
          VOLVER
        </button>
      </div>
    );
  }

  // ─── Step: COMMENT ─────────────────────────────────────────────────
  if (step === 'comment') {
    return (
      <div style={card}>
        <p style={{ ...subtext, marginBottom: '0.5rem' }}>{groupName}</p>
        <h2 style={heading}>¿QUERÉS DEJARNOS UN MENSAJE?</h2>
        <p style={subtext}>Opcional · hasta {MAX_COMMENT_LENGTH} caracteres</p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="confirmation-comment" style={labelStyle}>
            Mensaje (opcional)
          </label>
          <textarea
            id="confirmation-comment"
            value={comment}
            maxLength={MAX_COMMENT_LENGTH}
            rows={4}
            placeholder="Ej: Llegaremos un poco más tarde."
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '100px',
            }}
            onChange={(e) => setComment(e.target.value)}
          />
          <p style={{ textAlign: 'right', fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            {comment.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>

        <button style={btn('primary')} onClick={() => setStep('summary')} type="button">
          VER RESUMEN
        </button>
        <button style={btn('ghost')} onClick={() => setStep('restrictions')} type="button">
          VOLVER
        </button>
      </div>
    );
  }

  // ─── Step: SUMMARY ─────────────────────────────────────────────────
  if (step === 'summary') {
    const finalAttendees = buildFinalAttendees();
    const withRestrictions = finalAttendees.filter(
      (a) => a.dietaryRestriction && a.dietaryRestriction !== 'none'
    );

    return (
      <div style={card}>
        <h2 style={{ ...heading, marginBottom: '0.5rem' }}>TU CONFIRMACIÓN</h2>
        <p style={{ ...subtext, marginBottom: '1.25rem' }}>
          Revisá los datos antes de confirmar.
        </p>

        <div
          style={{
            background: '#faf5ff',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', marginBottom: '0.75rem' }}>
            {groupName}
          </p>
          <div style={divider} />
          <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>Asistencia</p>
          <p style={{ color: '#374151', marginBottom: '0.75rem' }}>✅ Sí, asistiré</p>

          <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>Personas</p>
          <p style={{ color: '#374151', marginBottom: '0.75rem' }}>
            {count} {count === 1 ? 'persona' : 'personas'}
          </p>

          <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>Asistentes</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem' }}>
            {finalAttendees.map((a, i) => (
              <li key={i} style={{ color: '#374151', marginBottom: '0.2rem', fontSize: '0.95rem' }}>
                {a.name}
              </li>
            ))}
          </ul>

          {withRestrictions.length > 0 && (
            <>
              <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>Restricciones</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem' }}>
                {withRestrictions.map((a, i) => (
                  <li key={i} style={{ color: '#374151', marginBottom: '0.2rem', fontSize: '0.9rem' }}>
                    {a.name} — {labelForDietary(a.dietaryRestriction)}
                  </li>
                ))}
              </ul>
            </>
          )}

          {comment.trim() && (
            <>
              <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>Mensaje</p>
              <p style={{ color: '#374151', fontStyle: 'italic', fontSize: '0.9rem' }}>
                "{comment.trim()}"
              </p>
            </>
          )}
        </div>

        <ErrorBanner />

        <button
          style={btn('primary')}
          onClick={submitConfirmation}
          disabled={isPending}
          type="button"
          aria-busy={isPending}
        >
          {isPending ? 'GUARDANDO...' : 'CONFIRMAR ASISTENCIA'}
        </button>
        <button
          style={btn('ghost')}
          onClick={() => setStep('attendance')}
          disabled={isPending}
          type="button"
        >
          EDITAR
        </button>
      </div>
    );
  }

  // ─── Step: SUCCESS ─────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ ...card, textAlign: 'center' }}>
        <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</p>
        <h2 style={{ ...heading, color: '#166534' }}>¡CONFIRMADO!</h2>
        <p style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          Gracias por acompañarme en una noche tan especial.
        </p>
        <p style={{ color: '#9333ea', fontWeight: 600 }}>Nos vemos en mis 15. ❤️</p>
        <div style={divider} />
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          {count === 1 ? '1 persona confirmada.' : `${count} personas confirmadas.`}
        </p>
      </div>
    );
  }

  // ─── Step: DECLINED SUCCESS ────────────────────────────────────────
  if (step === 'declined_success') {
    return (
      <div style={{ ...card, textAlign: 'center' }}>
        <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>❤️</p>
        <h2 style={{ ...heading, color: '#374151' }}>Gracias por avisarnos</h2>
        <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.6 }}>
          Sentiremos mucho que no puedas acompañarnos.
        </p>
      </div>
    );
  }

  return null;
}
