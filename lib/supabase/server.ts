import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseServerClient() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string; domain?: string; maxAge?: number; expires?: Date; httpOnly?: boolean; secure?: boolean; sameSite?: "lax" | "strict" | "none" }) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  return supabase;
}


