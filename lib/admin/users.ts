'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from './auth';

export async function getAdminUsers() {
  await requireAdmin();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY o SUPABASE_SERVICE_ROLE_KEY');
    return { success: false, error: `Supabase no está configurado (faltan: ${missing.join(', ')} en el entorno del servidor).` };
  }

  try {
    const supabase = await createClient();
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

    const mergedUsers = users.map(user => {
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
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: 'Faltan variables de Supabase en el servidor.' };
  }

  try {
    const supabase = await createClient();
    
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

    return { success: true, userId: userData.user.id };
  } catch (err) {
    return { success: false, error: 'Error inesperado al crear el usuario.' };
  }
}

export async function deleteAdminUser(userId: string) {
  await requireAdmin();
  
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Error inesperado al eliminar el usuario.' };
  }
}
