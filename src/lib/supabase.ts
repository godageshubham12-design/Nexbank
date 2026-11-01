import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Local storage keys for customizable Supabase connection
export const STORAGE_KEY_URL = 'nexmoney_supabase_url';
export const STORAGE_KEY_ANON = 'nexmoney_supabase_anon_key';
export const STORAGE_KEY_MODE = 'nexmoney_cloud_mode'; // 'live' | 'simulation'

// Default project configuration provided for NEXMONEY
export const DEFAULT_SUPABASE_URL = 'https://odzkkahthrptpqldchre.supabase.co';
export const DEFAULT_SUPABASE_ANON = 'sb_publishable_XC-si0L325xVbrqE6Q4DQw_Pf9FKvrb';

// Retrieve environment credentials safely across Vite and Node test environments
const envUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL as string) || '';
const envAnon = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY as string) || '';

export function getStoredSupabaseConfig() {
  const rawLocalUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const rawLocalAnon = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null;
  
  // Use stored custom credentials, env vars, or default project credentials
  const localUrl = (rawLocalUrl && rawLocalUrl.trim() !== '' && !rawLocalUrl.includes('your-project'))
    ? rawLocalUrl.trim()
    : (envUrl || DEFAULT_SUPABASE_URL);

  const localAnon = (rawLocalAnon && rawLocalAnon.trim() !== '' && !rawLocalAnon.includes('your-anon'))
    ? rawLocalAnon.trim()
    : (envAnon || DEFAULT_SUPABASE_ANON);

  const rawMode = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_MODE) : null;
  const isConfigured = Boolean(localUrl && localAnon && localUrl.startsWith('https://'));
  const mode = (rawMode as 'live' | 'simulation') || (isConfigured ? 'live' : 'simulation');
  
  return {
    url: localUrl,
    anonKey: localAnon,
    isConfigured,
    mode,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string, mode: 'live' | 'simulation') {
  realClient = null;
  currentCachedUrl = '';
  currentCachedKey = '';
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  localStorage.setItem(STORAGE_KEY_MODE, mode);
  window.dispatchEvent(new Event('nexmoney_config_changed'));
}

// Global live client reference
let realClient: SupabaseClient | null = null;
let currentCachedUrl = '';
let currentCachedKey = '';

export function getLiveSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (config.isConfigured) {
    if (!realClient || currentCachedUrl !== config.url || currentCachedKey !== config.anonKey) {
      try {
        currentCachedUrl = config.url;
        currentCachedKey = config.anonKey;
        realClient = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        realClient = null;
      }
    }
    return realClient;
  }
  realClient = null;
  return null;
}

export const SUPABASE_DOCUMENTS_BUCKET = 'nexmoney-documents';
