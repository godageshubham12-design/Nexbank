import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types';

interface BudgetModuleProps {
  onOpenSetBudgetModal: () => void;
  onEditBudget: (budget: Budget) => void;
}

export const BudgetModule: React.FC<BudgetModuleProps> = ({
  onOpenSetBudgetModal,
  onEditBudget,
}) => {
  const { budgets, expenses, deleteBudget, formatMoney, currencySymbol } = useFinance();

  // Current month default
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate actual spending for each category in selected month
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      if (e.date && e.date.startsWith(selectedMonth)) {
        map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
      }
    });
    return map;
  }, [expenses, selectedMonth]);

  // Filter budgets for selected month
  const activeBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  // Overall totals
  const totalBudgetCap = useMemo(() => {
    return activeBudgets.reduce((acc, curr) => acc + Number(curr.monthly_budget || 0), 0);
  }, [activeBudgets]);

  const totalSpentInBudgetedCategories = useMemo(() => {
    return activeBudgets.reduce((acc, curr) => {
      return acc + (categorySpending[curr.category] || 0);
    }, 0);
  }, [activeBudgets, categorySpending]);

  const overallUsagePct = totalBudgetCap > 0
    ? Math.round((totalSpentInBudgetedCategories / totalBudgetCap) * 100)
    : 0;

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget target from Supabase Cloud?')) {
      await deleteBudget(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budgeted */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Total Budget Allocation</span>
          <h3 className="text-2xl font-bold text-white mt-1">{formatMoney(totalBudgetCap)}</h3>
          <p className="text-xs text-slate-400 mt-1">Across {activeBudgets.length} configured categories</p>
        </div>

        {/* Total Spent */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Budgeted Spend Realized</span>
          <h3 className={`text-2xl font-bold mt-1 ${
            overallUsagePct >= 100 ? 'text-rose-400' : overallUsagePct >= 80 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {formatMoney(totalSpentInBudgetedCategories)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {overallUsagePct}% of assigned monthly capital
          </p>
        </div>

        {/* Actions & Month selector */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Target Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={onOpenSetBudgetModal}
            className="mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Category Budget</span>
          </button>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            Category Budgets & Threshold Guardrails
          </h3>
          <span className="text-xs text-slate-400">
            {activeBudgets.length} active caps for {selectedMonth}
          </span>
        </div>

        {activeBudgets.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-12 text-center text-slate-500 shadow-lg">
            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-400" />
            <h4 className="text-base font-semibold text-slate-300">No category budgets defined</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Setting budget guardrails allows NEXMONEY to warn you at 80% usage and alert you if exceeded.
            </p>
            <button
              onClick={onOpenSetBudgetModal}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              Set First Category Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBudgets.map((b) => {
              const spent = categorySpending[b.category] || 0;
              const remaining = b.monthly_budget - spent;
              const percent = Math.min(150, Math.round((spent / b.monthly_budget) * 100));

              // Status styles
              let statusBadge = (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Healthy
                </span>
              );
              let barColor = 'bg-emerald-500';

              if (percent >= 100) {
                statusBadge = (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    Budget Exceeded!
                  </span>
                );
                barColor = 'bg-rose-500';
              } else if (percent >= 80) {
                statusBadge = (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" />
                    80% Threshold Warning
                  </span>
                );
                barColor = 'bg-amber-500';
              }

              return (
                <div
                  key={b.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{b.category}</h4>
                      <p className="text-xs text-slate-400 font-mono">Month: {b.month}</p>
                    </div>
                    {statusBadge}
                  </div>

                  {/* Numbers */}
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Spent:</span>{' '}
                      <strong className="text-white font-mono text-sm">{formatMoney(spent)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Cap:</span>{' '}
                      <span className="text-slate-300 font-mono text-sm">{formatMoney(b.monthly_budget)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{percent}% consumed</span>
                      <span className={remaining < 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {remaining >= 0 ? `${formatMoney(remaining)} remaining` : `Exceeded by ${formatMoney(Math.abs(remaining))}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => onEditBudget(b)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 text-xs font-medium transition flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Adjust</span>
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
