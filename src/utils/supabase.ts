import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  
  console.error('❌ CRITICAL: Missing Supabase environment variables:', missing);
  console.error('⚠️ Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.error('📋 For local development: Create .env file with VITE_ prefix');
  console.error('🚀 For Vercel deployment: Set in Settings → Environment Variables with VITE_ prefix');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);