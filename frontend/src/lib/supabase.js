import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function missingSupabase() {
  throw new Error("Supabase frontend keys are not configured.");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOtp: missingSupabase,
        verifyOtp: missingSupabase,
        signOut: async () => ({ error: null })
      }
    };
