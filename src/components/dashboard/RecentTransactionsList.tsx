import React from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  CreditCard,
  Tag,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../layout/Sidebar';

interface RecentTransactionsListProps {
  onViewAll: () => void;
  onEditIncome: (id: string) => void;
  onEditExpense: (id: string) => void;
}

export const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  onViewAll,
  onEditIncome,
  onEditExpense,
}) => {
  const { transactions, formatMoney, currencySymbol } = useFinance();
  const recent = transactions.slice(0, 6);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            Recent Cloud Transactions
          </h3>
          <p className="text-xs text-slate-400">Latest activity synced from Supabase PostgreSQL</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium text-slate-400">No transactions recorded yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Add an income or expense to generate live database transactions.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {recent.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={`${tx.type}-${tx.id}`}
                onClick={() => (isIncome ? onEditIncome(tx.id) : onEditExpense(tx.id))}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition cursor-pointer group"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isIncome ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition">
                      {tx.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-300">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400">{tx.date}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">{tx.payment_method}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Badge */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm sm:text-base font-bold font-mono ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {currencySymbol}
                    {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <span
                    className={`inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {tx.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
