import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  TrendingUp,
  Award,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types';

interface SavingsGoalsModuleProps {
  onOpenCreateGoalModal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
}

export const SavingsGoalsModule: React.FC<SavingsGoalsModuleProps> = ({
  onOpenCreateGoalModal,
  onEditGoal,
}) => {
  const { savingsGoals, deleteSavingsGoal, addFundsToGoal, formatMoney, currencySymbol } = useFinance();

  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const totalTargetSum = savingsGoals.reduce((acc, curr) => acc + Number(curr.target_amount || 0), 0);
  const totalSavedSum = savingsGoals.reduce((acc, curr) => acc + Number(curr.current_saved || 0), 0);
  const overallProgress = totalTargetSum > 0 ? Math.round((totalSavedSum / totalTargetSum) * 100) : 0;

  const handleQuickDeposit = async (goal: SavingsGoal) => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    setDepositing(true);
    try {
      await addFundsToGoal(goal.id, amt);

      // Trigger celebration if goal is reached!
      if (goal.current_saved + amt >= goal.target_amount) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setDepositGoalId(null);
      setDepositAmount('');
    } finally {
      setDepositing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this savings goal from Supabase Cloud?')) {
      await deleteSavingsGoal(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Total Savings Target</span>
          <h3 className="text-2xl font-bold text-white mt-1">{formatMoney(totalTargetSum)}</h3>
          <p className="text-xs text-slate-400 mt-1">Across {savingsGoals.length} milestones</p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Total Accumulated</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatMoney(totalSavedSum)}</h3>
          <p className="text-xs text-slate-400 mt-1">{overallProgress}% of financial target</p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Target Milestones</span>
            <h3 className="text-lg font-bold text-white mt-1">{savingsGoals.length} Active Goals</h3>
            <p className="text-xs text-amber-400 mt-0.5">Automated Progress Tracking</p>
          </div>
          <button
            onClick={onOpenCreateGoalModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            Active Savings Portfolios
          </h3>
          <span className="text-xs text-slate-400">Real-time Cloud Status</span>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-12 text-center text-slate-500 shadow-lg">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
            <h4 className="text-base font-semibold text-slate-300">No savings goals created</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Define your financial goals such as an emergency fund, travel, or vehicle purchase to track progress.
            </p>
            <button
              onClick={onOpenCreateGoalModal}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition"
            >
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savingsGoals.map((g) => {
              const percent = Math.min(100, Math.round((g.current_saved / g.target_amount) * 100));
              const isCompleted = g.current_saved >= g.target_amount;

              return (
                <div
                  key={g.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                          style={{ backgroundColor: g.color || '#3b82f6' }}
                        >
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white truncate max-w-[170px]">
                            {g.goal_name}
                          </h4>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Target: {g.target_date}
                          </span>
                        </div>
                      </div>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Achieved
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {percent}%
                        </span>
                      )}
                    </div>

                    {g.notes && (
                      <p className="text-xs text-slate-400 line-clamp-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                        {g.notes}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full transition-all duration-700 rounded-full"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: g.color || '#3b82f6',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Saved:{' '}
                          <strong className="text-white font-mono">{formatMoney(g.current_saved)}</strong>
                        </span>
                        <span className="text-slate-400">
                          Target:{' '}
                          <strong className="text-white font-mono">{formatMoney(g.target_amount)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Deposit Dock */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2">
                    {depositGoalId === g.id ? (
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="1"
                            placeholder="Add funds"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
                          />
                        </div>
                        <button
                          onClick={() => handleQuickDeposit(g)}
                          disabled={depositing}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setDepositGoalId(null)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setDepositGoalId(g.id)}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+ Deposit Funds</span>
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onEditGoal(g)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                            title="Edit Goal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
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
