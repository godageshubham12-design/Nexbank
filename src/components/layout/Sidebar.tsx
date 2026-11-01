import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  PieChart,
  Target,
  FileText,
  BarChart3,
  Cloud,
  Settings,
  LogOut,
  ShieldCheck,
  Sparkles,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';

export type ActiveTab =
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'transactions'
  | 'budget'
  | 'goals'
  | 'documents'
  | 'reports'
  | 'cloud-architecture'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickIncome,
  onOpenQuickExpense,
}) => {
  const { user, logout, cloudMode, switchDemoUser } = useAuth();
  const { profile, currencySymbol, availableBalance, formatMoney } = useFinance();
  const { theme } = useTheme();

  const navItems: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'documents', label: 'Document Vault', icon: FileText, badge: 'Storage' },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'cloud-architecture', label: 'Cloud CC-2 Arch', icon: Cloud, badge: 'RLS & SQL' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-slate-900/95 dark:bg-slate-950/95 text-slate-200 border-r border-slate-800 backdrop-blur-xl z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-xl tracking-wider">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">NEXMONEY</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400">Manage Money. Stay Organized.</p>
          </div>
        </div>

        {/* Live Cloud Status Pill */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">
              {cloudMode === 'live' ? 'Supabase Cloud (Live)' : 'Supabase Cloud (Sandbox)'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            RLS Active
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Financial Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Action Buttons */}
        <div className="pt-4 px-2 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">
            Quick Entry
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenQuickIncome}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+ Income</span>
            </button>
            <button
              onClick={onOpenQuickExpense}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>+ Expense</span>
            </button>
          </div>
        </div>

        {/* Multi-Tenant Viva Switcher for College Evaluation */}
        <div className="pt-4 px-2">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                RLS Multi-User Test
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                onClick={() => switchDemoUser('a1b2c3d4-e5f6-7a8b-9c0d-111122223333')}
                className={`py-1.5 px-2 rounded font-medium text-center transition ${
                  user?.email.includes('alex')
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Alex Morgan
              </button>
              <button
                onClick={() => switchDemoUser('f6e5d4c3-b2a1-0f9e-8d7c-444455556666')}
                className={`py-1.5 px-2 rounded font-medium text-center transition ${
                  user?.email.includes('sarah')
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Sarah Chen
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
              Switching accounts proves complete data isolation via Supabase user_id policies.
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.full_name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
