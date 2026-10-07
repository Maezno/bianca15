import React from 'react';
import { getCurrentAdminUser } from '@/lib/admin/auth';
import { getAdminUsers } from '@/lib/admin/users';
import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UsersClient } from './UsersClient';

export const metadata = {
  title: 'Administradores - Panel',
};

export default async function AdminUsersPage() {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect('/admin/login?redirect=/admin/users');
  }

  // Only super_admin should access this ideally, but we will let the client components handle display or restrict here
  if (user.role !== 'super_admin') {
    return (
      <AdminLayout user={user}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Acceso Denegado</h2>
          <p>Solo los super administradores pueden gestionar usuarios.</p>
        </div>
      </AdminLayout>
    );
  }

  const { success, users, error } = await getAdminUsers();

  return (
    <AdminLayout user={user}>
      <UsersClient initialUsers={success && users ? users : []} initialError={error} />
    </AdminLayout>
  );
}
