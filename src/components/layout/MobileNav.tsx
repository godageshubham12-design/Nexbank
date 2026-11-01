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
  X,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenQuickIncome,
  onOpenQuickExpense,
}) => {
  const { user, logout, switchDemoUser } = useAuth();

  if (!isOpen) return null;

  const navItems: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budgets', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'documents', label: 'Document Vault', icon: FileText },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'cloud-architecture', label: 'Cloud CC-2 Arch & SQL', icon: Cloud },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 text-slate-200 p-4 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base">
              N
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">NEXMONEY</span>
              <p className="text-[10px] text-slate-400">Cloud Finance System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-2 my-4">
          <button
            onClick={() => {
              onClose();
              onOpenQuickIncome();
            }}
            className="py-2 px-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold text-center"
          >
            + Add Income
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenQuickExpense();
            }}
            className="py-2 px-2 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold text-center"
          >
            + Add Expense
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User profile footer */}
        <div className="pt-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{user?.full_name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
