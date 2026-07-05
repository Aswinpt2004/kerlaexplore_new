import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fesjtqdchhhpsmqontep.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc2p0cWRjaGhocHNtcW9udGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNDY4OTYsImV4cCI6MjA5ODcyMjg5Nn0.NaLb80o0VssS9KniiIsrc8HURx5jXPICRvSlzCbnfzI";

export const isSupabaseConfigured = true;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in environment. Falling back to default project credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
