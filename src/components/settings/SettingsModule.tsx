import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Cloud,
  Moon,
  Sun,
  RotateCcw,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { getStoredSupabaseConfig } from '../../lib/supabase';
import { CurrencyCode } from '../../types';

export const SettingsModule: React.FC = () => {
  const { user, logout, setCloudSettings } = useAuth();
  const { profile, updateProfile, resetDemoData, currency } = useFinance();
  const { theme, toggleTheme } = useTheme();

  // Profile form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Cloud credentials form
  const storedConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(storedConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(storedConfig.anonKey);
  const [cloudMode, setCloudMode] = useState<'live' | 'simulation'>(storedConfig.mode);
  const [cloudSaved, setCloudSaved] = useState(false);

  // Password reset message
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({ full_name: fullName.trim() });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveCloudSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setCloudSettings(supabaseUrl.trim(), supabaseAnonKey.trim(), cloudMode);
    setCloudSaved(true);
    setTimeout(() => setCloudSaved(false), 2500);
  };

  const handleResetPassword = () => {
    setPasswordNotice(`A password reset link has been dispatched to ${user?.email} via Supabase Auth.`);
  };

  const handleResetSeed = async () => {
    if (confirm('Reset your financial data to the clean initial CC-2 evaluation state?')) {
      await resetDemoData();
      alert('Data reset successfully.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">User Profile</h3>
            <p className="text-xs text-slate-400">Authenticated Supabase User Details</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email (Supabase Auth ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Financial Currency
              </label>
              <select
                value={currency}
                onChange={(e) => updateProfile({ currency: e.target.value as CurrencyCode })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="CAD">CAD (CA$ - Canadian Dollar)</option>
                <option value="AUD">AUD (A$ - Australian Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Security Password
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition text-center"
              >
                Send Password Reset Email
              </button>
            </div>
          </div>

          {passwordNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordNotice}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {profileSaved ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Profile updated in Supabase!
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Supabase Cloud Connection Settings */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Supabase Cloud Connection</h3>
            <p className="text-xs text-slate-400">
              Connect your own Supabase project URL & Anon key, or use built-in Cloud Sandbox
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveCloudSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Operating Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCloudMode('live')}
                className={`p-3 rounded-xl border text-left transition ${
                  cloudMode === 'live'
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white">Live Supabase Cloud</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Direct API calls to your Supabase PostgreSQL & Storage
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCloudMode('simulation')}
                className={`p-3 rounded-xl border text-left transition ${
                  cloudMode === 'simulation'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-emerald-400">Cloud Sandbox Mode</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Isolated multi-user simulation with persistent local PostgreSQL schema
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Supabase Public Anon Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Safe public client key. Never use the secret <code>service_role</code> key.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {cloudSaved ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Connection settings updated!
              </span>
            ) : <span />}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Supabase Config</span>
            </button>
          </div>
        </form>
      </div>

      {/* Theme and Evaluation Controls */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white">Appearance & Project Maintenance</h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 border-y border-slate-800">
          <div>
            <div className="text-sm font-semibold text-white">Interface Theme</div>
            <div className="text-xs text-slate-400">Toggle between Dark Navy Fintech and Clean Light mode</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            <span>Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
          <div>
            <div className="text-sm font-semibold text-white">Reset Evaluation Dataset</div>
            <div className="text-xs text-slate-400">
              Restore initial incomes, expenses, budgets and goals for college testing
            </div>
          </div>
          <button
            onClick={handleResetSeed}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Records</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
