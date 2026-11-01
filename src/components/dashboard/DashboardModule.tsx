import React from 'react';
import { OverviewCards } from './OverviewCards';
import { FinancialCharts } from './FinancialCharts';
import { RecentTransactionsList } from './RecentTransactionsList';
import { ActiveTab } from '../layout/Sidebar';
import { Income, Expense } from '../../types';

interface DashboardModuleProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenIncome: () => void;
  onOpenExpense: () => void;
  onOpenBudget: () => void;
  onOpenGoal: () => void;
  onOpenUpload: () => void;
  onEditIncome: (income: Income) => void;
  onEditExpense: (expense: Expense) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  setActiveTab,
  onOpenIncome,
  onOpenExpense,
  onOpenBudget,
  onOpenGoal,
  onOpenUpload,
  onEditIncome,
  onEditExpense,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Account Overview & Quick Actions */}
      <OverviewCards
        onOpenIncome={onOpenIncome}
        onOpenExpense={onOpenExpense}
        onOpenBudget={onOpenBudget}
        onOpenGoal={onOpenGoal}
        onOpenUpload={onOpenUpload}
      />

      {/* 2. Visual Charts (Cash flow comparison & Category breakdown) */}
      <FinancialCharts />

      {/* 3. Recent Transactions Feed */}
      <RecentTransactionsList
        onViewAll={() => setActiveTab('transactions')}
        onEditIncome={(id) => {
          // Trigger tab to income or open editor
          setActiveTab('income');
        }}
        onEditExpense={(id) => {
          setActiveTab('expenses');
        }}
      />
    </div>
  );
};
