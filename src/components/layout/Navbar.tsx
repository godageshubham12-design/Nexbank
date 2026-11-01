import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Bell,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab } from './Sidebar';
import { CurrencyCode } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
  onOpenMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickIncome,
  onOpenQuickExpense,
  onOpenMenu,
}) => {
  const { user, cloudMode } = useAuth();
  const { availableBalance, formatMoney, profile, updateProfile, currency } = useFinance();
  const { theme, toggleTheme } = useTheme();

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Real-time financial status & cloud telemetry' },
    income: { title: 'Income Management', subtitle: 'Track and categorize all incoming revenue' },
    expenses: { title: 'Expense Management', subtitle: 'Monitor expenditures and monthly outlays' },
    transactions: { title: 'Transaction Ledger', subtitle: 'Unified ledger with sorting & search' },
    budget: { title: 'Monthly Budgets', subtitle: 'Proactive spending limits & threshold alerts' },
    goals: { title: 'Savings Goals', subtitle: 'Set and track financial milestones with progress' },
    documents: { title: 'Document Vault', subtitle: 'Private encrypted storage on Supabase Cloud' },
    reports: { title: 'Financial Reports', subtitle: 'Generate analytics statements, PDF & CSV' },
    'cloud-architecture': { title: 'Cloud CC-2 Architecture', subtitle: 'PostgreSQL schema, RLS policies & specs' },
    settings: { title: 'Account & Settings', subtitle: 'Configure credentials, profile & system theme' },
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateProfile({ currency: e.target.value as CurrencyCode });
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/80 dark:bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu trigger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            aria-label="Open mobile menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white dark:text-white">
                {titles[activeTab]?.title || 'NEXMONEY'}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                CC-2 Project
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              {titles[activeTab]?.subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Currency Selector */}
          <div className="relative">
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="appearance-none bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (CA$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Cloud Architecture / SQL trigger */}
          <button
            onClick={() => setActiveTab('cloud-architecture')}
            title="Inspect Supabase Cloud Architecture & SQL Schema"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-medium transition"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SQL & RLS</span>
          </button>

          {/* Quick Add Buttons on top */}
          <button
            onClick={onOpenQuickIncome}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>

          <button
            onClick={onOpenQuickExpense}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* User profile avatar / Settings trigger */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-left transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
              {user?.full_name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
