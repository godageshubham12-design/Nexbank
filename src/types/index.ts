export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  currency: CurrencyCode;
  created_at: string;
  updated_at?: string;
}

export type IncomeCategory =
  | 'Salary'
  | 'Business'
  | 'Freelancing'
  | 'Investments'
  | 'Interest'
  | 'Rental'
  | 'Gifts'
  | 'Other';

export type ExpenseCategory =
  | 'Food'
  | 'Shopping'
  | 'Travel'
  | 'Education'
  | 'Bills'
  | 'Health'
  | 'Entertainment'
  | 'Housing'
  | 'Groceries'
  | 'Other';

export type PaymentMethod =
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI'
  | 'Cash'
  | 'Cheque'
  | 'Net Banking';

export interface Income {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: IncomeCategory;
  date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  payment_method: PaymentMethod;
  notes?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  monthly_budget: number;
  month: string; // YYYY-MM
  created_at: string;
  updated_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_saved: number;
  target_date: string; // YYYY-MM-DD
  notes?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

export type DocumentCategory =
  | 'Expense Receipt'
  | 'Salary Slip'
  | 'Tax Document'
  | 'Bank Statement'
  | 'Invoice'
  | 'Other';

export interface DocumentRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: DocumentCategory;
  upload_date: string;
  storage_url?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}
