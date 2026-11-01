import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieIcon,
  CheckCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

export const ReportsModule: React.FC = () => {
  const { user } = useAuth();
  const { incomes, expenses, transactions, formatMoney, currencySymbol } = useFinance();
  const reportPrintRef = useRef<HTMLDivElement>(null);

  // Time preset filter
  const [periodPreset, setPeriodPreset] = useState<'this_month' | 'last_month' | 'last_3_months' | 'all'>('this_month');
  const [reportType, setReportType] = useState<'comprehensive' | 'income' | 'expense' | 'savings'>('comprehensive');

  // Compute date ranges
  const dateRange = useMemo(() => {
    const now = new Date();
    if (periodPreset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      return { start, end, label: now.toLocaleString('default', { month: 'long', year: 'numeric' }) };
    }
    if (periodPreset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start, end, label: lastMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' }) };
    }
    if (periodPreset === 'last_3_months') {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      return { start, end, label: 'Past 3 Months' };
    }
    return { start: '2020-01-01', end: '2099-12-31', label: 'All-Time Records' };
  }, [periodPreset]);

  // Filtered dataset
  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => i.date >= dateRange.start && i.date <= dateRange.end);
  }, [incomes, dateRange]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => e.date >= dateRange.start && e.date <= dateRange.end);
  }, [expenses, dateRange]);

  const reportTotalIncome = filteredIncomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const reportTotalExpense = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const reportNetSavings = reportTotalIncome - reportTotalExpense;
  const reportSavingsRate = reportTotalIncome > 0 ? Math.round((reportNetSavings / reportTotalIncome) * 100) : 0;

  // Category breakdown for expenses
  const categorySummary = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    })).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Handle browser print / PDF export
  const handlePrintPDF = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const allFiltered = [
      ...filteredIncomes.map((i) => ({ ...i, type: 'INCOME' })),
      ...filteredExpenses.map((e) => ({ ...e, type: 'EXPENSE' })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const headers = ['Date', 'Type', 'Title', 'Category', 'Payment Method', 'Amount', 'Notes'];
    const rows = allFiltered.map((r) => [
      r.date,
      r.type,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.payment_method,
      r.amount,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `nexmoney_statement_${periodPreset}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="no-print p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Reporting Period:
          </span>
          {(['this_month', 'last_month', 'last_3_months', 'all'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setPeriodPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                periodPreset === preset
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {preset === 'this_month'
                ? 'Current Month'
                : preset === 'last_month'
                ? 'Last Month'
                : preset === 'last_3_months'
                ? 'Last 3 Months'
                : 'All-Time'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Statement Canvas */}
      <div
        ref={reportPrintRef}
        className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 text-slate-200"
      >
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-600/30">
              N
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white">NEXMONEY</h2>
              <p className="text-xs text-slate-400">Personal Finance Management Statement</p>
              <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                Cloud Computing CC-2 Verified Report
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 space-y-1">
            <p>
              Account Holder: <strong className="text-white">{user?.full_name}</strong>
            </p>
            <p>
              User Email: <span className="text-slate-300">{user?.email}</span>
            </p>
            <p>
              Period: <strong className="text-blue-400">{dateRange.label}</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Inflows
            </span>
            <h4 className="text-xl font-bold font-mono text-emerald-400 mt-1">
              +{formatMoney(reportTotalIncome)}
            </h4>
            <span className="text-[10px] text-slate-500">{filteredIncomes.length} incoming entries</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Outflows
            </span>
            <h4 className="text-xl font-bold font-mono text-rose-400 mt-1">
              -{formatMoney(reportTotalExpense)}
            </h4>
            <span className="text-[10px] text-slate-500">{filteredExpenses.length} outgoing entries</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Net Capital Saved
            </span>
            <h4 className={`text-xl font-bold font-mono mt-1 ${
              reportNetSavings >= 0 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {formatMoney(reportNetSavings)}
            </h4>
            <span className="text-[10px] text-slate-500">Net cash surplus</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Savings Ratio
            </span>
            <h4 className="text-xl font-bold font-mono text-white mt-1">
              {reportSavingsRate}%
            </h4>
            <span className="text-[10px] text-slate-500">Net Saved / Inflow</span>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            Category-wise Outlay Breakdown
          </h3>
          {categorySummary.length === 0 ? (
            <p className="text-xs text-slate-500">No expense records within this period.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {categorySummary.map((cat) => (
                    <tr key={cat.name} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-semibold text-slate-200">{cat.name}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-300">
                        {formatMoney(cat.value)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                        {reportTotalExpense > 0
                          ? `${Math.round((cat.value / reportTotalExpense) * 100)}%`
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Itemized Transactions Statement */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Itemized Statement Ledger ({filteredIncomes.length + filteredExpenses.length} entries)
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {[
                  ...filteredIncomes.map((i) => ({ ...i, type: 'income' as const })),
                  ...filteredExpenses.map((e) => ({ ...e, type: 'expense' as const })),
                ]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 30) // limit for high clarity statement
                  .map((row) => (
                    <tr key={`${row.type}-${row.id}`} className="hover:bg-slate-800/20">
                      <td className="py-2 px-4 font-mono text-slate-400">{row.date}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`uppercase text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            row.type === 'income'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-medium text-white">{row.title}</td>
                      <td className="py-2 px-4 text-slate-300">{row.category}</td>
                      <td className="py-2 px-4 text-slate-400">{row.payment_method}</td>
                      <td
                        className={`py-2 px-4 text-right font-mono font-bold ${
                          row.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {row.type === 'income' ? '+' : '-'}
                        {currencySymbol}
                        {Number(row.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statement Footer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>This statement is an academic project report generated for Cloud Computing CC-2.</p>
          <p className="font-mono">Backend: Supabase Cloud • PostgreSQL • RLS Verified</p>
        </div>
      </div>
    </div>
  );
};
