import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente público do Supabase. Usa somente a chave anon: tudo o que é sensível
// (conteúdo do livro, pedidos) é protegido por RLS e pelas Edge Functions.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, flowType: 'pkce' },
    })
  : null;
