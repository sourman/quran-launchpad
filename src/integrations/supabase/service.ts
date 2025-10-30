// Service role client for admin operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Service role client for admin operations like creating institutions
// This client bypasses RLS and doesn't use auth
export const supabaseAdmin = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      // Use an isolated storage key and noop storage to avoid creating
      // another GoTrueClient competing on the same storage namespace.
      storageKey: 'sb-service-role',
      storage: {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      },
    },
    global: {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  }
);
