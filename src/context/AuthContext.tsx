import React, { createContext, useContext, useEffect, useState } from 'react';
import { CloudAuth } from '../lib/cloudEngine';
import { getStoredSupabaseConfig, saveSupabaseConfig, getLiveSupabaseClient } from '../lib/supabase';
import { DEMO_USERS } from '../lib/mockData';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  cloudMode: 'live' | 'simulation';
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (demoId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  setCloudSettings: (url: string, anonKey: string, mode: 'live' | 'simulation') => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [config, setConfig] = useState(getStoredSupabaseConfig());

  const refreshSession = async () => {
    setLoading(true);
    try {
      const sessionUser = await CloudAuth.getCurrentSession();
      setUser(sessionUser);
    } catch (err) {
      console.error('Session refresh failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    // Listen to real Supabase auth state changes if configured
    let authSubscription: { unsubscribe: () => void } | null = null;
    const liveClient = getLiveSupabaseClient();
    if (liveClient) {
      const { data } = liveClient.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              'User',
          });
        } else if (getStoredSupabaseConfig().mode === 'live') {
          setUser(null);
        }
      });
      authSubscription = data.subscription;
    }

    const handleConfigChange = () => {
      setConfig(getStoredSupabaseConfig());
      refreshSession();
    };

    window.addEventListener('nexmoney_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('nexmoney_config_changed', handleConfigChange);
      authSubscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authUser = await CloudAuth.signIn(email, password);
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const authUser = await CloudAuth.signUp(email, password, fullName);
      setUser(authUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await CloudAuth.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchDemoUser = async (demoId: string) => {
    const target = DEMO_USERS.find(u => u.id === demoId);
    if (!target) return;
    setLoading(true);
    try {
      // If currently in live mode, switch to simulation mode so sandbox ID isn't sent to live Supabase
      if (config.mode === 'live') {
        saveSupabaseConfig(config.url, config.anonKey, 'simulation');
        setConfig(getStoredSupabaseConfig());
      }
      localStorage.setItem('nexmoney_current_user_id', target.id);
      setUser({
        id: target.id,
        email: target.email,
        full_name: target.name,
      });
    } finally {
      setLoading(false);
    }
  };

  const setCloudSettings = (url: string, anonKey: string, mode: 'live' | 'simulation') => {
    saveSupabaseConfig(url, anonKey, mode);
    setConfig(getStoredSupabaseConfig());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cloudMode: config.mode,
        isConfigured: config.isConfigured,
        login,
        register,
        logout,
        switchDemoUser,
        refreshSession,
        setCloudSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
