import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',
  Shopping: '#ec4899',
  Travel: '#3b82f6',
  Education: '#8b5cf6',
  Bills: '#ef4444',
  Health: '#10b981',
  Entertainment: '#6366f1',
  Housing: '#14b8a6',
  Groceries: '#84cc16',
  Other: '#64748b',
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const FinancialCharts: React.FC = () => {
  const { incomes, expenses, currencySymbol, formatMoney } = useFinance();

  // 1. Monthly Comparison Data (last 6 months)
  const monthlyComparisonData = useMemo(() => {
    const monthsMap: Record<string, { month: string; income: number; expense: number; savings: number }> = {};
    const d = new Date();

    // Initialize last 6 months in chronological order
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      const label = targetDate.toLocaleString('default', { month: 'short' });
      monthsMap[key] = { month: label, income: 0, expense: 0, savings: 0 };
    }

    incomes.forEach((inc) => {
      if (inc.date) {
        const key = inc.date.slice(0, 7);
        if (monthsMap[key]) {
          monthsMap[key].income += Number(inc.amount || 0);
        }
      }
    });

    expenses.forEach((exp) => {
      if (exp.date) {
        const key = exp.date.slice(0, 7);
        if (monthsMap[key]) {
          monthsMap[key].expense += Number(exp.amount || 0);
        }
      }
    });

    return Object.values(monthsMap).map((m) => ({
      ...m,
      savings: Math.max(0, m.income - m.expense),
    }));
  }, [incomes, expenses]);

  // 2. Expense Category Breakdown Data
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount || 0);
    });

    const entries = Object.entries(catMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: CATEGORY_COLORS[name] || '#3b82f6',
    }));

    return entries.sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalExpenseSum = useMemo(() => {
    return categoryData.reduce((acc, curr) => acc + curr.value, 0);
  }, [categoryData]);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-400 capitalize">{entry.name}:</span>
              <span className="font-mono font-semibold text-white">
                {currencySymbol}
                {Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Income vs Expenses (Bar comparison) - Spans 2 Columns */}
      <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-lg flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              Monthly Income vs Expenses
            </h3>
            <p className="text-xs text-slate-400">Cash flow dynamics across the past 6 months</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Expense</span>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${currencySymbol}${val >= 1000 ? `${val / 1000}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Category Breakdown Donut */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-lg flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            Expense Breakdown
          </h3>
          <p className="text-xs text-slate-400">Category allocation of real cloud entries</p>
        </div>

        <div className="relative h-56 sm:h-60 w-full my-2">
          {categoryData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <p>No expense data recorded yet.</p>
              <p className="text-[11px] mt-1">Add an expense to view breakdown.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [
                      `${currencySymbol}${Number(value).toFixed(2)}`,
                      'Spent',
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Total Pill */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
                <span className="text-sm font-bold text-white">{formatMoney(totalExpenseSum)}</span>
              </div>
            </>
          )}
        </div>

        {/* Category Legend list (Top 4) */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-800">
          {categoryData.slice(0, 4).map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="text-slate-300 truncate">{c.name}</span>
              <span className="text-slate-500 font-mono text-[11px] ml-auto">
                {totalExpenseSum > 0 ? `${Math.round((c.value / totalExpenseSum) * 100)}%` : '0%'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
