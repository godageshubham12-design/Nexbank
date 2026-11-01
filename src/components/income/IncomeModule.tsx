import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Tag,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Income, IncomeCategory } from '../../types';

interface IncomeModuleProps {
  onOpenAddModal: () => void;
  onEditIncome: (income: Income) => void;
}

const CATEGORIES: ('All' | IncomeCategory)[] = [
  'All',
  'Salary',
  'Business',
  'Freelancing',
  'Investments',
  'Interest',
  'Rental',
  'Gifts',
  'Other',
];

export const IncomeModule: React.FC<IncomeModuleProps> = ({ onOpenAddModal, onEditIncome }) => {
  const { incomes, deleteIncome, formatMoney, currencySymbol } = useFinance();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | IncomeCategory>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered income list
  const filteredIncomes = useMemo(() => {
    return incomes.filter((inc) => {
      // Search filter
      const matchesSearch =
        inc.title.toLowerCase().includes(search.toLowerCase()) ||
        (inc.notes && inc.notes.toLowerCase().includes(search.toLowerCase())) ||
        inc.payment_method.toLowerCase().includes(search.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'All' || inc.category === selectedCategory;

      // Date range filter
      const matchesStart = !startDate || inc.date >= startDate;
      const matchesEnd = !endDate || inc.date <= endDate;

      return matchesSearch && matchesCategory && matchesStart && matchesEnd;
    });
  }, [incomes, search, selectedCategory, startDate, endDate]);

  const totalFilteredAmount = useMemo(() => {
    return filteredIncomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [filteredIncomes]);

  const averageIncome = useMemo(() => {
    if (filteredIncomes.length === 0) return 0;
    return totalFilteredAmount / filteredIncomes.length;
  }, [filteredIncomes, totalFilteredAmount]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income entry from Supabase Cloud?')) {
      setDeletingId(id);
      try {
        await deleteIncome(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Total Filtered Income</span>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">
            {formatMoney(totalFilteredAmount)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{filteredIncomes.length} cloud records</p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
          <span className="text-xs font-semibold text-slate-400">Average Transaction</span>
          <h3 className="text-2xl font-bold text-white mt-1">{formatMoney(averageIncome)}</h3>
          <p className="text-xs text-slate-400 mt-1">Per recorded revenue event</p>
        </div>

        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Database Engine</span>
            <h3 className="text-lg font-bold text-white mt-1">Supabase PostgreSQL</h3>
            <p className="text-xs text-emerald-400 mt-0.5">RLS Multi-Tenant Enforced</p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, memo or payment method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setStartDate('');
              setEndDate('');
            }}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Reset Filters
          </button>
        </div>

        {/* Date Range Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-[11px] text-rose-400 hover:underline"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Income Records Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg overflow-hidden">
        {filteredIncomes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-400" />
            <h4 className="text-base font-semibold text-slate-300">No income records found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No income entries match the active search or category filters.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
            >
              Add First Income Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Income Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment Channel</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-white">{inc.title}</div>
                      {inc.notes && (
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{inc.notes}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{inc.date}</td>
                    <td className="py-3.5 px-4 text-slate-400">{inc.payment_method}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-emerald-400">
                      +{currencySymbol}
                      {Number(inc.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditIncome(inc)}
                          title="Edit Income"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id)}
                          disabled={deletingId === inc.id}
                          title="Delete Income"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
