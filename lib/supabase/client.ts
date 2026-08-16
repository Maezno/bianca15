import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Crea un cliente de Supabase para uso en Client Components ("use client").
 *
 * Uso:
 *   const supabase = createClient();
 *   const { data } = await supabase.from("guest_groups").select("*");
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
