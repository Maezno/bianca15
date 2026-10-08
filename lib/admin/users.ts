'use server';

import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from './auth';

export async function getAdminUsers() {
  await requireAdmin();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    return { success: false, error: `Supabase no está configurado (faltan: ${missing.join(', ')} en el entorno del servidor).` };
  }

  try {
    const supabase = getAdminClient();
    // Use the admin api to fetch all users from auth.users (requires service role key)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error(authError);
      return { success: false, error: 'Error al obtener usuarios. Asegúrate de tener configurada la SUPABASE_SERVICE_ROLE_KEY.' };
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      return { success: false, error: 'Error al obtener perfiles.' };
    }

    const mergedUsers = (users || []).map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      return {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || 'Sin nombre',
        role: profile?.role || user.user_metadata?.role || 'event_admin',
        createdAt: user.created_at,
      };
    });

    return { success: true, users: mergedUsers };
  } catch (err) {
    console.error(err);
    return { success: false, error: 'Error inesperado al obtener usuarios.' };
  }
}

export async function createAdminUser(data: { email: string; name: string; role: 'super_admin' | 'event_admin', password?: string }) {
  await requireAdmin();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: 'Faltan variables de Supabase en el servidor.' };
  }

  try {
    const supabase = getAdminClient();
    
    // Create the user in Auth
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password || 'bianca15temporal', // Default password if not provided
      email_confirm: true,
      user_metadata: {
        name: data.name,
        role: data.role
      }
    });

    if (createError) {
      return { success: false, error: createError.message };
    }

    if (userData.user) {
      // Garantizar que la tabla profiles tenga el rol exacto guardado
      await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
        });

      // Asignar al nuevo usuario a todos los eventos existentes para evitar que no vea eventos creados
      const { data: allEvents } = await supabase.from('events').select('id');
      if (allEvents && allEvents.length > 0) {
        const assignments = allEvents.map((evt: { id: string }) => ({
          event_id: evt.id,
          user_id: userData.user.id,
        }));
        await supabase
          .from('event_admins')
          .upsert(assignments, { onConflict: 'event_id,user_id', ignoreDuplicates: true });
      }
    }

    return { success: true, userId: userData.user.id };
  } catch (err) {
    return { success: false, error: 'Error inesperado al crear el usuario.' };
  }
}

export async function deleteAdminUser(userId: string) {
  await requireAdmin();
  
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Error inesperado al eliminar el usuario.' };
  }
}

export async function changeAdminPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireAdmin();

  if (user.id === '00000000-0000-0000-0000-000000000001') {
    return { success: false, error: 'La contraseña del administrador local se gestiona mediante la variable LOCAL_ADMIN_PASS.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al actualizar la contraseña.' };
  }
}
