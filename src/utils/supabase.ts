import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Warn if environment variables are not configured
if (!import.meta.env?.VITE_SUPABASE_URL || !import.meta.env?.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not configured.\n' + 'Create a .env file in the project root with:\n' + 'VITE_SUPABASE_URL=your_supabase_url\n' + 'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n' + 'The app will run with placeholder values for now.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);