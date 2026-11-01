/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { AuthPage } from './components/auth/AuthPage';

// Module Components
import { DashboardModule } from './components/dashboard/DashboardModule';
import { IncomeModule } from './components/income/IncomeModule';
import { ExpenseModule } from './components/expense/ExpenseModule';
import { TransactionsModule } from './components/transactions/TransactionsModule';
import { BudgetModule } from './components/budget/BudgetModule';
import { SavingsGoalsModule } from './components/goals/SavingsGoalsModule';
import { DocumentVaultModule } from './components/documents/DocumentVaultModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { CloudArchitectureModule } from './components/cloud/CloudArchitectureModule';
import { SettingsModule } from './components/settings/SettingsModule';

// Modals
import { IncomeModal } from './components/modals/IncomeModal';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { GoalModal } from './components/modals/GoalModal';
import { DocumentUploadModal } from './components/modals/DocumentUploadModal';

import { Income, Expense, Budget, SavingsGoal } from './types';
import { Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { loading: financeLoading } = useFinance();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<Income | null>(null);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-600/30 mb-4 animate-bounce">
          N
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span>Connecting to Supabase Cloud Engine...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated: Show Login/Register page
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickIncome={() => {
          setIncomeToEdit(null);
          setIncomeModalOpen(true);
        }}
        onOpenQuickExpense={() => {
          setExpenseToEdit(null);
          setExpenseModalOpen(true);
        }}
      />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickIncome={() => {
          setIncomeToEdit(null);
          setIncomeModalOpen(true);
        }}
        onOpenQuickExpense={() => {
          setExpenseToEdit(null);
          setExpenseModalOpen(true);
        }}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickIncome={() => {
            setIncomeToEdit(null);
            setIncomeModalOpen(true);
          }}
          onOpenQuickExpense={() => {
            setExpenseToEdit(null);
            setExpenseModalOpen(true);
          }}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />

        {/* Tab Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardModule
              setActiveTab={setActiveTab}
              onOpenIncome={() => {
                setIncomeToEdit(null);
                setIncomeModalOpen(true);
              }}
              onOpenExpense={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              onOpenBudget={() => {
                setBudgetToEdit(null);
                setBudgetModalOpen(true);
              }}
              onOpenGoal={() => {
                setGoalToEdit(null);
                setGoalModalOpen(true);
              }}
              onOpenUpload={() => setUploadModalOpen(true)}
              onEditIncome={(inc) => {
                setIncomeToEdit(inc);
                setIncomeModalOpen(true);
              }}
              onEditExpense={(exp) => {
                setExpenseToEdit(exp);
                setExpenseModalOpen(true);
              }}
            />
          )}

          {activeTab === 'income' && (
            <IncomeModule
              onOpenAddModal={() => {
                setIncomeToEdit(null);
                setIncomeModalOpen(true);
              }}
              onEditIncome={(inc) => {
                setIncomeToEdit(inc);
                setIncomeModalOpen(true);
              }}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseModule
              onOpenAddModal={() => {
                setExpenseToEdit(null);
                setExpenseModalOpen(true);
              }}
              onEditExpense={(exp) => {
                setExpenseToEdit(exp);
                setExpenseModalOpen(true);
              }}
            />
          )}

          {activeTab === 'transactions' && <TransactionsModule />}

          {activeTab === 'budget' && (
            <BudgetModule
              onOpenSetBudgetModal={() => {
                setBudgetToEdit(null);
                setBudgetModalOpen(true);
              }}
              onEditBudget={(budget) => {
                setBudgetToEdit(budget);
                setBudgetModalOpen(true);
              }}
            />
          )}

          {activeTab === 'goals' && (
            <SavingsGoalsModule
              onOpenCreateGoalModal={() => {
                setGoalToEdit(null);
                setGoalModalOpen(true);
              }}
              onEditGoal={(goal) => {
                setGoalToEdit(goal);
                setGoalModalOpen(true);
              }}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentVaultModule onOpenUploadModal={() => setUploadModalOpen(true)} />
          )}

          {activeTab === 'reports' && <ReportsModule />}

          {activeTab === 'cloud-architecture' && <CloudArchitectureModule />}

          {activeTab === 'settings' && <SettingsModule />}
        </main>
      </div>

      {/* Global Modals */}
      <IncomeModal
        isOpen={incomeModalOpen}
        onClose={() => {
          setIncomeModalOpen(false);
          setIncomeToEdit(null);
        }}
        incomeToEdit={incomeToEdit}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => {
          setExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />

      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => {
          setBudgetModalOpen(false);
          setBudgetToEdit(null);
        }}
        budgetToEdit={budgetToEdit}
      />

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => {
          setGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
      />

      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <MainAppContent />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
