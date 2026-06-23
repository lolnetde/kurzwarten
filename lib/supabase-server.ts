import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServerKey =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseServerKey = Boolean(
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const supabaseServer = createClient(supabaseUrl, supabaseServerKey as string, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
