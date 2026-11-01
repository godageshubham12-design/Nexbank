import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage keys for customizable Supabase connection
export const STORAGE_KEY_URL = 'nexmoney_supabase_url';
export const STORAGE_KEY_ANON = 'nexmoney_supabase_anon_key';
export const STORAGE_KEY_MODE = 'nexmoney_cloud_mode'; // 'live' | 'simulation'

// Retrieve environment credentials
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const envAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export function getStoredSupabaseConfig() {
  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || envUrl;
  const localAnon = localStorage.getItem(STORAGE_KEY_ANON) || envAnon;
  const mode = localStorage.getItem(STORAGE_KEY_MODE) || (localUrl && localAnon ? 'live' : 'simulation');
  
  return {
    url: localUrl,
    anonKey: localAnon,
    isConfigured: Boolean(localUrl && localAnon && localUrl.startsWith('https://')),
    mode: mode as 'live' | 'simulation',
  };
}

export function saveSupabaseConfig(url: string, anonKey: string, mode: 'live' | 'simulation') {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  localStorage.setItem(STORAGE_KEY_MODE, mode);
  window.dispatchEvent(new Event('nexmoney_config_changed'));
}

// Global live client reference
let realClient: SupabaseClient | null = null;

export function getLiveSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config.isConfigured) {
    if (!realClient) {
      try {
        realClient = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        realClient = null;
      }
    }
    return realClient;
  }
  return null;
}

export const SUPABASE_DOCUMENTS_BUCKET = 'nexmoney-documents';
