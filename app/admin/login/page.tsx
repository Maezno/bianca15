'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        const redirect = searchParams.get('redirect') || '/admin/events';
        router.push(redirect);
        router.refresh();
      } else {
        setError(data.error || 'Usuario o contraseña incorrectos.');
        setLoading(false);
      }
    } catch {
      setError('Error de conexión. Por favor intentá nuevamente.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, sans-serif;
          background: #0d0d14;
          position: relative;
          overflow: hidden;
          padding: 1.5rem;
        }

        /* Fondo con gradiente animado */
        .login-bg {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(139,92,246,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 90%, rgba(236,72,153,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 60% 40%, rgba(59,130,246,0.1) 0%, transparent 50%);
          animation: bgPulse 8s ease-in-out infinite alternate;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes bgPulse {
          0%   { opacity: 0.7; }
          100% { opacity: 1; }
        }

        /* Partículas decorativas */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          animation: orbFloat 12s ease-in-out infinite alternate;
          z-index: 0;
        }
        .orb-1 {
          width: 400px; height: 400px;
          background: rgba(139,92,246,0.12);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: rgba(236,72,153,0.1);
          bottom: -80px; right: -80px;
          animation-delay: -4s;
        }
        .orb-3 {
          width: 200px; height: 200px;
          background: rgba(59,130,246,0.1);
          top: 50%; left: 70%;
          animation-delay: -2s;
        }

        @keyframes orbFloat {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 20px) scale(1.08); }
        }

        /* Card */
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05) inset,
            0 32px 64px rgba(0,0,0,0.5),
            0 0 80px rgba(139,92,246,0.08);
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(16px)'};
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        /* Header */
        .login-icon {
          width: 56px; height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem;
          margin: 0 auto 1.25rem;
          box-shadow: 0 8px 24px rgba(139,92,246,0.4);
        }

        .login-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #f1f5f9;
          text-align: center;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          text-align: center;
          margin-bottom: 2rem;
        }

        /* Error */
        .login-error {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          text-align: center;
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-6px); }
          75%       { transform: translateX(6px); }
        }

        /* Form */
        .login-form { display: flex; flex-direction: column; gap: 1rem; }

        .field-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          margin-bottom: 0.35rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .input-wrap { position: relative; }

        .login-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-size: 0.95rem;
          color: #f1f5f9;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }

        .login-input::placeholder { color: rgba(255,255,255,0.2); }

        .login-input:focus {
          border-color: rgba(139,92,246,0.6);
          background: rgba(139,92,246,0.08);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
        }

        .pass-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.35);
          font-size: 1.1rem;
          padding: 0.25rem;
          transition: color 0.2s;
          line-height: 1;
        }
        .pass-toggle:hover { color: rgba(255,255,255,0.7); }

        /* Submit */
        .login-btn {
          width: 100%;
          padding: 0.8rem;
          margin-top: 0.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(139,92,246,0.4);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(139,92,246,0.5);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Spinner */
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 0.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
        }

        .divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin: 1.5rem 0;
        }
      `}</style>

      <div className="login-root">
        <div className="login-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="login-card">
          {/* Header */}
          <div className="login-icon">✨</div>
          <h1 className="login-title">Panel Administrativo</h1>
          <p className="login-subtitle">Ingresá tus credenciales para continuar</p>

          {/* Error */}
          {error && <div className="login-error">{error}</div>}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="username">Usuario</label>
              <input
                id="username"
                className="login-input"
                type="text"
                autoComplete="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">Contraseña</label>
              <div className="input-wrap">
                <input
                  id="password"
                  className="login-input"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading && <span className="spinner" />}
              {loading ? 'Ingresando...' : 'Ingresar al Panel'}
            </button>
          </form>

          <hr className="divider" />
          <p className="login-footer">Plataforma de Invitaciones Digitales</p>
        </div>
      </div>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
