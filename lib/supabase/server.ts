import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Crea un cliente de Supabase para uso en Server Components, Server Actions
 * y Route Handlers (nunca en "use client").
 *
 * Uso:
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("guest_groups").select("*");
 *
 * NOTA: Esta función es async porque Next.js 15+ requiere await para cookies().
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options: CookieOptions;
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any)
            );
          } catch {
            // setAll puede fallar en Server Components (solo lectura).
            // Esto es esperado y no afecta la funcionalidad.
          }
        },
      },
    }
  );
}
