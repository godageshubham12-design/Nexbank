import React, { useState, useEffect } from 'react';
import { X, PieChart, AlertCircle } from 'lucide-react';
import { Budget, ExpenseCategory } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Shopping',
  'Travel',
  'Education',
  'Bills',
  'Health',
  'Entertainment',
  'Housing',
  'Groceries',
  'Other',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, budgetToEdit }) => {
  const { setBudget, currencySymbol } = useFinance();

  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setMonthlyBudget(String(budgetToEdit.monthly_budget));
      setMonth(budgetToEdit.month);
    } else {
      setCategory('Food');
      setMonthlyBudget('');
      const d = new Date();
      setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    setError(null);
  }, [budgetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(monthlyBudget);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please provide a valid budget limit greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      await setBudget({
        category,
        monthly_budget: parsed,
        month,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget in Supabase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {budgetToEdit ? 'Adjust Category Budget' : 'Configure Category Budget'}
              </h2>
              <p className="text-xs text-slate-400">Enforced by Supabase PostgreSQL constraints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Monthly Budget Cap ({currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="500"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-semibold placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Budget Month (YYYY-MM) *
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-slate-400 text-xs">
            💡 NEXMONEY will warn you when your expenses hit 80% and trigger a red alert when 100% is breached.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              {submitting ? 'Saving...' : budgetToEdit ? 'Update Budget' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
