import { createClient } from '@supabase/supabase-js';
import { logger } from './lib/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function validateEnvironment(): { url: string; key: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = new Error(
      'Supabase configuration error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in environment variables'
    );
    logger.error('Supabase environment validation failed', error);
    throw error;
  }

  if (typeof supabaseUrl !== 'string' || !supabaseUrl.startsWith('https://')) {
    const error = new Error('Invalid Supabase URL format');
    logger.error('Invalid Supabase URL', { url: supabaseUrl });
    throw error;
  }

  return { url: supabaseUrl, key: supabaseAnonKey };
}

const { url, key } = validateEnvironment();

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'thoughts-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'thoughts-app',
    },
  },
});

logger.info('Supabase client initialized successfully');
