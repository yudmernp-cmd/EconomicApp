import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Faltan las variables de Supabase. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el .env'
  );
}

export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      detectSessionInUrl: true,
      flowType: 'implicit',
    },
  }
);