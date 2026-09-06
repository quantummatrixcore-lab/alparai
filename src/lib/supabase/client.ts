import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Browser & HMR Safe Singleton Cache to prevent multiple GoTrueClient instances
let cachedClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  if (!cachedClient) {
    cachedClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

export const supabase = typeof window !== "undefined"
  ? (cachedClient ?? (cachedClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)))
  : createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
