import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Peringatan: VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diisi di file .env! ' +
    'Silakan lengkapi file .env agar dapat terhubung ke database Supabase.'
  );
}

// Inisialisasi Supabase Client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

