import { createClient } from '@supabase/supabase-js';

const isProduction = import.meta.env.PROD;
const hasKeys = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

if (isProduction && !hasKeys) {
  throw new Error("Supabase configuration missing in production");
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase keys are missing from environment. Using mock/placeholder connection.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
