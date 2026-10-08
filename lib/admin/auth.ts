'use server';

import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionToken, getSessionData, SESSION_COOKIE } from './session';
import type { AdminUser } from './types';

// Default mock admin user for local development when Supabase credentials are not yet configured
const DEMO_ADMIN_USER: AdminUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@bianca15.com',
  name: 'Super Administrador',
  role: 'super_admin',
};

async function getLocalSessionUser(): Promise<AdminUser | null> {
  try {
    const store = await cookies();
    const cookieVal = store.get(SESSION_COOKIE)?.value;
    const sessionData = await getSessionData(cookieVal);
    if (sessionData && sessionData.userId) {
      return {
        id: sessionData.userId,
        email: sessionData.email || '',
        name: sessionData.name || 'Admin',
        role: sessionData.role || 'event_admin',
      };
    }
    const isValid = await verifySessionToken(cookieVal);
    return isValid ? DEMO_ADMIN_USER : null;
  } catch {
    return null;
  }
}

/** Lanza error si la petición no proviene de un administrador autenticado. Usar en cada Server Action admin. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentAdminUser();
  if (!user) throw new Error('No autorizado');
  return user;
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  // 1. Revisar si hay sesión local firmada activa (admin-session)
  const localUser = await getLocalSessionUser();
  // Si es sesión local pura de superadmin (maezno sin userId de Supabase)
  if (localUser && localUser.email === DEMO_ADMIN_USER.email) {
    return localUser;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return localUser;
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Sin usuario Supabase en la cookie auth: revisar sesión firmada
      return localUser;
    }

    // Usar cliente administrativo para consultar perfiles sin restricciones de RLS
    const adminSupabase = getAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id, email, name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Administrador',
        role: (user.user_metadata?.role as AdminUser['role']) || 'super_admin',
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as AdminUser['role'],
    };
  } catch {
    return localUser;
  }
}

export async function loginAdmin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Por favor completá todos los campos.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Modo local: el login se hace vía /api/auth/login (cookie firmada)
    return { success: false, error: 'Usá el inicio de sesión local.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: 'Credenciales inválidas. Por favor intentá nuevamente.' };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Error al iniciar sesión. Por favor intentá nuevamente.' };
  }
}

export async function logoutAdmin(): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
  }

  try {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
  } catch {
    // Ignore
  }

  redirect('/admin/login');
}

export async function canUserManageEvent(eventId: string): Promise<boolean> {
  const user = await getCurrentAdminUser();
  if (!user) return false;
  if (user.role === 'super_admin') return true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return true;

  try {
    const supabase = getAdminClient();
    const { data } = await supabase.rpc('can_manage_event', {
      p_user_id: user.id,
      p_event_id: eventId,
    });
    return !!data;
  } catch {
    return true; // Fallback seguro
  }
}
