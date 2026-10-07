'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { AdminUser } from '@/lib/admin/types';
import { changeAdminPassword } from '@/lib/admin/users';

interface AdminLayoutProps {
  user: AdminUser | null;
  eventId?: string;
  eventName?: string;
  children: React.ReactNode;
}

export function AdminLayout({ user, eventId, eventName, children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdError('');
    try {
      const res = await changeAdminPassword(newPassword);
      if (res.success) {
        setPwdSuccess(true);
        setTimeout(() => {
          setShowPasswordModal(false);
          setPwdSuccess(false);
          setNewPassword('');
        }, 1500);
      } else {
        setPwdError(res.error || 'Error al cambiar contraseña');
      }
    } catch {
      setPwdError('Error de conexión');
    } finally {
      setPwdLoading(false);
    }
  };

  const isEventHome = eventId && pathname === `/admin/events/${eventId}`;
  const isGuests = eventId && pathname.includes('/guests');
  const isConfirmations = eventId && pathname.includes('/confirmations');
  const isImport = eventId && pathname.includes('/import');
  const isEdit = eventId && pathname.includes('/edit');
  const isEditor = eventId && pathname.includes('/editor');
  const isPreview = eventId && pathname.includes('/preview');
  const isMedia = eventId && pathname.includes('/media');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Navbar */}
      <header
        className="admin-top-header"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/admin/events"
            style={{
              fontWeight: 800,
              fontSize: '1.15rem',
              color: '#9333ea',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap',
            }}
          >
            <span>✨</span> Plataforma
          </Link>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>Admin</span>
          
          {user?.role === 'super_admin' && (
            <>
              <span style={{ color: '#cbd5e1' }}>|</span>
              <Link
                href="/admin/users"
                style={{
                  fontSize: '0.9rem',
                  color: pathname === '/admin/users' ? '#9333ea' : '#64748b',
                  fontWeight: pathname === '/admin/users' ? 700 : 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Usuarios
              </Link>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155' }}>
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <span
                style={{
                  background: user.role === 'super_admin' ? '#f3e8ff' : '#e0f2fe',
                  color: user.role === 'super_admin' ? '#7e22ce' : '#0369a1',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '99px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                {user.role === 'super_admin' ? 'Super' : 'Admin'}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowPasswordModal(true)}
            title="Cambiar Contraseña"
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '0.45rem',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🔑 Clave
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '0.45rem',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '1rem', width: '100%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Cambiar Contraseña</h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#64748b' }}>Ingresá tu nueva clave personal para acceder a la plataforma.</p>

            {pwdSuccess ? (
              <div style={{ padding: '0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center', fontWeight: 600 }}>
                ¡Contraseña actualizada con éxito!
              </div>
            ) : (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pwdError && (
                  <div style={{ padding: '0.6rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', fontSize: '0.8rem' }}>
                    {pwdError}
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>Nueva Contraseña</label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setShowPasswordModal(false); setPwdError(''); setPwdSuccess(false); setNewPassword(''); }}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={pwdLoading}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', border: 'none', background: '#9333ea', color: '#ffffff', fontWeight: 600, cursor: pwdLoading ? 'wait' : 'pointer' }}
                  >
                    {pwdLoading ? 'Guardando...' : 'Actualizar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Event Sub-Navigation if inside an event */}
      {eventId && (
        <div
          className="admin-nav-bar"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0.5rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Link href="/admin/events" style={{ color: '#64748b', textDecoration: 'none' }}>
              Eventos
            </Link>
            <span style={{ color: '#94a3b8' }}>›</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{eventName || 'Evento'}</span>
          </div>

          <nav
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              maxWidth: '100%',
              paddingBottom: '2px',
            }}
          >
            <Link
              href={`/admin/events/${eventId}`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isEventHome ? '#f3e8ff' : 'transparent',
                color: isEventHome ? '#7e22ce' : '#475569',
              }}
            >
              📊 Resumen
            </Link>
            <Link
              href={`/admin/events/${eventId}/guests`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isGuests ? '#f3e8ff' : 'transparent',
                color: isGuests ? '#7e22ce' : '#475569',
              }}
            >
              👥 Invitados
            </Link>
            <Link
              href={`/admin/events/${eventId}/confirmations`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isConfirmations ? '#f3e8ff' : 'transparent',
                color: isConfirmations ? '#7e22ce' : '#475569',
              }}
            >
              ✅ Confirmaciones
            </Link>
            <Link
              href={`/admin/events/${eventId}/import`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isImport ? '#f3e8ff' : 'transparent',
                color: isImport ? '#7e22ce' : '#475569',
              }}
            >
              📥 CSV
            </Link>
            <Link
              href={`/admin/events/${eventId}/media`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isMedia ? '#f3e8ff' : 'transparent',
                color: isMedia ? '#7e22ce' : '#475569',
              }}
            >
              🖼️ Multimedia
            </Link>
            <Link
              href={`/admin/events/${eventId}/editor`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isEditor ? '#f3e8ff' : '#faf5ff',
                color: isEditor ? '#7e22ce' : '#9333ea',
                border: '1px solid #d8b4fe',
              }}
            >
              ✏️ Editor
            </Link>
            <Link
              href={`/admin/events/${eventId}/edit`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isEdit ? '#f3e8ff' : 'transparent',
                color: isEdit ? '#7e22ce' : '#475569',
              }}
            >
              ⚙️ Ajustes
            </Link>
            <Link
              href={`/admin/events/${eventId}/preview`}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                background: isPreview ? '#fef9c3' : 'transparent',
                color: isPreview ? '#854d0e' : '#475569',
              }}
            >
              👁️ Preview
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="admin-main-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>{children}</main>
    </div>
  );
}
