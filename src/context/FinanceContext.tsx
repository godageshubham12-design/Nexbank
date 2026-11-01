import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { CloudDatabase } from '../lib/cloudEngine';
import {
  UserProfile,
  Income,
  Expense,
  Budget,
  SavingsGoal,
  DocumentRecord,
  Transaction,
  CurrencyCode,
} from '../types';

interface FinanceContextType {
  profile: UserProfile | null;
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  documents: DocumentRecord[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  // Key Financial KPIs
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;

  // Formatting
  currency: CurrencyCode;
  formatMoney: (val: number) => string;
  currencySymbol: string;

  // Actions
  addIncome: (income: Omit<Income, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editIncome: (id: string, updates: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  setBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
  deleteSavingsGoal: (id: string) => Promise<void>;
  addFundsToGoal: (id: string, amount: number) => Promise<void>;

  uploadDocument: (file: File, category: DocumentRecord['category']) => Promise<void>;
  downloadDocument: (doc: DocumentRecord) => Promise<void>;
  deleteDocument: (doc: DocumentRecord) => Promise<void>;

  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refetchAll: () => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'A$',
};

const FinanceContext = createContext<FinanceContextType>({} as FinanceContextType);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!user) {
      setProfile(null);
      setIncomes([]);
      setExpenses([]);
      setBudgets([]);
      setSavingsGoals([]);
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [p, inc, exp, bud, g, doc] = await Promise.all([
        CloudDatabase.getProfile(user.id),
        CloudDatabase.getIncomes(user.id),
        CloudDatabase.getExpenses(user.id),
        CloudDatabase.getBudgets(user.id),
        CloudDatabase.getSavingsGoals(user.id),
        CloudDatabase.getDocuments(user.id),
      ]);

      setProfile(p);
      setIncomes(inc);
      setExpenses(exp);
      setBudgets(bud);
      setSavingsGoals(g);
      setDocuments(doc);
    } catch (err: any) {
      console.error('Error fetching financial records:', err);
      setError(err?.message || 'Failed to load records from Supabase Cloud');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  // Calculations
  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const totalIncome = useMemo(() => {
    return incomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [incomes]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [expenses]);

  const availableBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  const monthlyIncome = useMemo(() => {
    return incomes
      .filter((i) => i.date?.startsWith(currentMonth))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [incomes, currentMonth]);

  const monthlyExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date?.startsWith(currentMonth))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  }, [expenses, currentMonth]);

  const monthlySavings = useMemo(() => {
    return monthlyIncome - monthlyExpenses;
  }, [monthlyIncome, monthlyExpenses]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    const rate = (monthlySavings / monthlyIncome) * 100;
    return Math.max(0, Math.round(rate));
  }, [monthlyIncome, monthlySavings]);

  const transactions = useMemo<Transaction[]>(() => {
    const incTx: Transaction[] = incomes.map((i) => ({
      id: i.id,
      user_id: i.user_id,
      title: i.title,
      type: 'income',
      amount: i.amount,
      category: i.category,
      date: i.date,
      payment_method: i.payment_method,
      notes: i.notes,
      created_at: i.created_at,
    }));

    const expTx: Transaction[] = expenses.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      title: e.title,
      type: 'expense',
      amount: e.amount,
      category: e.category,
      date: e.date,
      payment_method: e.payment_method,
      notes: e.notes,
      created_at: e.created_at,
    }));

    return [...incTx, ...expTx].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, expenses]);

  const currency = profile?.currency || 'USD';
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '$';

  const formatMoney = (val: number): string => {
    const formatted = Math.abs(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${val < 0 ? '-' : ''}${currencySymbol}${formatted}`;
  };

  // Mutators
  const addIncome = async (income: Omit<Income, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Authentication required.');
    const created = await CloudDatabase.createIncome(user.id, income);
    setIncomes((prev) => [created, ...prev]);
  };

  const editIncome = async (id: string, updates: Partial<Income>) => {
    if (!user) throw new Error('Authentication required.');
    const updated = await CloudDatabase.updateIncome(user.id, id, updates);
    setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const deleteIncome = async (id: string) => {
    if (!user) throw new Error('Authentication required.');
    await CloudDatabase.deleteIncome(user.id, id);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Authentication required.');
    const created = await CloudDatabase.createExpense(user.id, expense);
    setExpenses((prev) => [created, ...prev]);
  };

  const editExpense = async (id: string, updates: Partial<Expense>) => {
    if (!user) throw new Error('Authentication required.');
    const updated = await CloudDatabase.updateExpense(user.id, id, updates);
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const deleteExpense = async (id: string) => {
    if (!user) throw new Error('Authentication required.');
    await CloudDatabase.deleteExpense(user.id, id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const setBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Authentication required.');
    const saved = await CloudDatabase.upsertBudget(user.id, budget);
    setBudgets((prev) => {
      const filtered = prev.filter((b) => !(b.category === budget.category && b.month === budget.month));
      return [saved, ...filtered];
    });
  };

  const deleteBudget = async (id: string) => {
    if (!user) throw new Error('Authentication required.');
    await CloudDatabase.deleteBudget(user.id, id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) throw new Error('Authentication required.');
    const created = await CloudDatabase.createSavingsGoal(user.id, goal);
    setSavingsGoals((prev) => [created, ...prev]);
  };

  const editSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    if (!user) throw new Error('Authentication required.');
    const updated = await CloudDatabase.updateSavingsGoal(user.id, id, updates);
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!user) throw new Error('Authentication required.');
    await CloudDatabase.deleteSavingsGoal(user.id, id);
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const addFundsToGoal = async (id: string, amount: number) => {
    if (!user) throw new Error('Authentication required.');
    const target = savingsGoals.find((g) => g.id === id);
    if (!target) return;
    const newSaved = Number(target.current_saved || 0) + amount;
    await editSavingsGoal(id, { current_saved: newSaved });
  };

  const uploadDocument = async (file: File, category: DocumentRecord['category']) => {
    if (!user) throw new Error('Authentication required.');
    const uploaded = await CloudDatabase.uploadDocument(user.id, file, category);
    setDocuments((prev) => [uploaded, ...prev]);
  };

  const downloadDocument = async (doc: DocumentRecord) => {
    if (!user) throw new Error('Authentication required.');
    await CloudDatabase.downloadDocument(user.id, doc);
  };

  const deleteDocument = async (doc: DocumentRecord) => {
    if (!user) throw new Error('Authentication required.');
    await CloudDatabase.deleteDocument(user.id, doc);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Authentication required.');
    const updated = await CloudDatabase.updateProfile(user.id, updates);
    setProfile(updated);
  };

  const resetDemoData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await CloudDatabase.resetAndSeedUser(user.id, user.email, user.full_name);
      await fetchUserData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        profile,
        incomes,
        expenses,
        budgets,
        savingsGoals,
        documents,
        transactions,
        loading,
        error,
        totalIncome,
        totalExpenses,
        availableBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate,
        currency,
        currencySymbol,
        formatMoney,
        addIncome,
        editIncome,
        deleteIncome,
        addExpense,
        editExpense,
        deleteExpense,
        setBudget,
        deleteBudget,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        addFundsToGoal,
        uploadDocument,
        downloadDocument,
        deleteDocument,
        updateProfile,
        refetchAll: fetchUserData,
        resetDemoData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);
