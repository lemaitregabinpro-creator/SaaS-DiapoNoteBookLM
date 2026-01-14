import { createClient } from '@supabase/supabase-js';

// Ces clés seront dans ton fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou Key manquante. Vérifiez votre .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données (User Profile)
export interface UserProfile {
  id: string; // Lié à auth.users
  email: string;
  full_name?: string;
  avatar_url?: string;
  plan: 'guest' | 'free' | 'essential' | 'pro' | 'lifetime';
  credits: number;
  created_at: string;
}