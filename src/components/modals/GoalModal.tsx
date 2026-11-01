import React, { useState, useEffect } from 'react';
import { X, Target, AlertCircle } from 'lucide-react';
import { SavingsGoal } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, goalToEdit }) => {
  const { addSavingsGoal, editSavingsGoal, currencySymbol } = useFinance();

  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('');
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [color, setColor] = useState('#3b82f6');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setGoalName(goalToEdit.goal_name);
      setTargetAmount(String(goalToEdit.target_amount));
      setCurrentSaved(String(goalToEdit.current_saved));
      setTargetDate(goalToEdit.target_date);
      setColor(goalToEdit.color || '#3b82f6');
      setNotes(goalToEdit.notes || '');
    } else {
      setGoalName('');
      setTargetAmount('');
      setCurrentSaved('0');
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().split('T')[0]);
      setColor('#3b82f6');
      setNotes('');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetAmount);
    const parsedSaved = parseFloat(currentSaved || '0');

    if (!goalName.trim()) {
      setError('Please provide a goal name.');
      return;
    }
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }
    if (isNaN(parsedSaved) || parsedSaved < 0) {
      setError('Current saved amount cannot be negative.');
      return;
    }
    if (!targetDate) {
      setError('Please choose a target date.');
      return;
    }

    setSubmitting(true);
    try {
      if (goalToEdit) {
        await editSavingsGoal(goalToEdit.id, {
          goal_name: goalName.trim(),
          target_amount: parsedTarget,
          current_saved: parsedSaved,
          target_date: targetDate,
          color,
          notes: notes.trim() || undefined,
        });
      } else {
        await addSavingsGoal({
          goal_name: goalName.trim(),
          target_amount: parsedTarget,
          current_saved: parsedSaved,
          target_date: targetDate,
          color,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save goal to Supabase.');
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
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h2>
              <p className="text-xs text-slate-400">Track milestones and progress</p>
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
              Goal Name / Target *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund (6 Months)"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Amount ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-semibold placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Already Saved ({currencySymbol})
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={currentSaved}
                onChange={(e) => setCurrentSaved(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-semibold placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Completion Date *
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition ${
                    color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-80'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Why this goal matters, auto-transfer instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition resize-none"
            />
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition"
            >
              {submitting ? 'Saving Goal...' : goalToEdit ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
