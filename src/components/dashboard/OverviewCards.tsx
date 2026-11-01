import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Plus,
  CreditCard,
  FileUp,
  Target,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface OverviewCardsProps {
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenBudget: () => void;
  onOpenGoal: () => void;
  onOpenUpload: () => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  onOpenIncome,
  onOpenExpense,
  onOpenBudget,
  onOpenGoal,
  onOpenUpload,
}) => {
  const {
    totalIncome,
    totalExpenses,
    availableBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    formatMoney,
    currencySymbol,
  } = useFinance();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Available Balance - Premium Banking Card Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-6 text-white shadow-xl shadow-blue-900/20 border border-blue-500/30 flex flex-col justify-between min-h-[190px]">
          {/* Subtle card chip & metallic pattern */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-white/10 backdrop-blur-md border border-white/20 text-blue-100">
                NEXMONEY VAULT
              </span>
            </div>
            <div className="w-8 h-6 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center opacity-90 shadow-sm">
              <div className="w-5 h-4 border border-amber-600/40 rounded-sm" />
            </div>
          </div>

          <div className="my-3 z-10">
            <p className="text-xs font-medium text-blue-200/90 tracking-wide">Available Balance</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {formatMoney(availableBalance)}
            </h3>
          </div>

          <div className="flex items-center justify-between text-xs text-blue-200/80 pt-2 border-t border-white/10 z-10">
            <span className="font-mono tracking-wider">
              •••• •••• •••• {user?.id ? user.id.slice(0, 4).toUpperCase() : '9021'}
            </span>
            <span className="font-semibold text-white truncate max-w-[120px]">
              {user?.full_name}
            </span>
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {formatMoney(totalIncome)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-400 font-medium">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{formatMoney(monthlyIncome)} recorded this month</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Verified Cloud Records</span>
            <span className="font-mono text-emerald-400">PostgreSQL</span>
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Outlays</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {formatMoney(totalExpenses)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{formatMoney(monthlyExpenses)} spent this month</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Expense Budget Control</span>
            <span className="font-mono text-rose-400">Tracked</span>
          </div>
        </div>

        {/* Card 4: Monthly Savings & Rate */}
        <div className="rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Monthly Net Savings</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>

          <div className="my-3">
            <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              monthlySavings >= 0 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {formatMoney(monthlySavings)}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-400">Savings Rate:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                savingsRate >= 20
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {savingsRate}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Formula: Income - Expenses</span>
            <span className="font-mono text-slate-400">Dynamic</span>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Quick Financial Actions
            </h4>
            <p className="text-xs text-slate-400">Perform cloud transactions with instant persistence</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={onOpenIncome}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Add Income</span>
          </button>

          <button
            onClick={onOpenExpense}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onOpenBudget}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>

          <button
            onClick={onOpenGoal}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
          >
            <Target className="w-4 h-4" />
            <span>New Goal</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition"
          >
            <FileUp className="w-4 h-4" />
            <span>Upload Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
