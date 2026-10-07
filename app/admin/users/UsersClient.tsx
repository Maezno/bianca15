'use client';

import React, { useState } from 'react';
import { createAdminUser, deleteAdminUser } from '@/lib/admin/users';

interface UserItem {
  id: string;
  email: string | undefined;
  name: string;
  role: string;
  createdAt: string;
}

export function UsersClient({ initialUsers, initialError }: { initialUsers: UserItem[], initialError?: string }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'super_admin' | 'event_admin'>('event_admin');

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este administrador?')) return;
    setLoading(true);
    const res = await deleteAdminUser(id);
    if (res.success) {
      setUsers(users.filter(u => u.id !== id));
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);

    const res = await createAdminUser({ name, email, password, role });
    
    if (res.success) {
      // Optimizative add
      setUsers([...users, {
        id: res.userId!,
        email,
        name,
        role,
        createdAt: new Date().toISOString()
      }]);
      setShowModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('event_admin');
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Administradores</h1>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            padding: '0.5rem 1rem',
            background: '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + Nuevo Administrador
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Nombre</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Email</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Rol</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Fecha</th>
              <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem' }}>{user.name}</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: user.role === 'super_admin' ? '#f3e8ff' : '#e0f2fe',
                    color: user.role === 'super_admin' ? '#7e22ce' : '#0369a1',
                    borderRadius: '99px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {user.role === 'super_admin' ? 'Super Admin' : 'Admin Eventos'}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !error && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                  No hay administradores cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontWeight: 700 }}>Nuevo Administrador</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Nombre</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Contraseña Temporal</label>
                <input 
                  type="text" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="Mínimo 6 caracteres"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Rol</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value as any)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                >
                  <option value="super_admin">Super Administrador (Acceso total)</option>
                  <option value="event_admin">Admin de Eventos</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ flex: 1, padding: '0.75rem', border: 'none', background: '#9333ea', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
