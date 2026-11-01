-- ==============================================================================
-- NEXMONEY: Cloud Finance Management System
-- College Cloud Computing CC-2 Mini-Project Database Schema
-- Target Platform: Supabase PostgreSQL with Row Level Security (RLS)
-- Bucket: nexmoney-documents (Private Cloud Storage)
-- ==============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE 1: PROFILES
-- Stores extended user profile information linked directly to Supabase Auth
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- TABLE 2: INCOMES
-- Stores all incoming revenues with categorization, payment method & metadata
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('Salary', 'Business', 'Freelancing', 'Investments', 'Interest', 'Rental', 'Gifts', 'Other')),
  date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cash', 'Cheque', 'Net Banking')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON public.incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON public.incomes(date);

-- ==============================================================================
-- TABLE 3: EXPENSES
-- Stores all expenditures with categorization, payment method & metadata
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('Food', 'Shopping', 'Travel', 'Education', 'Bills', 'Health', 'Entertainment', 'Housing', 'Groceries', 'Other')),
  date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Cash', 'Cheque', 'Net Banking')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);

-- ==============================================================================
-- TABLE 4: BUDGETS
-- Stores monthly category budget limits for expense tracking
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Food', 'Shopping', 'Travel', 'Education', 'Bills', 'Health', 'Entertainment', 'Housing', 'Groceries', 'Other')),
  monthly_budget NUMERIC(12, 2) NOT NULL CHECK (monthly_budget > 0),
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_user_category_month UNIQUE (user_id, category, month)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets(user_id, month);

-- ==============================================================================
-- TABLE 5: SAVINGS_GOALS
-- Stores financial target goals and tracked accumulations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_name TEXT NOT NULL CHECK (char_length(trim(goal_name)) > 0),
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  current_saved NUMERIC(12, 2) DEFAULT 0 CHECK (current_saved >= 0),
  target_date DATE NOT NULL,
  notes TEXT,
  color TEXT DEFAULT '#2563eb',
  icon TEXT DEFAULT 'target',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);

-- ==============================================================================
-- TABLE 6: DOCUMENTS
-- Tracks financial document metadata stored in Supabase Storage (nexmoney-documents)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Expense Receipt', 'Salary Slip', 'Tax Document', 'Bank Statement', 'Invoice', 'Other')),
  upload_date TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Whenever a user registers through Supabase Auth, their profile is created automatically
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, currency)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'USD')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation: Users can only see, create, update, and delete their own records.
-- ==============================================================================

-- 1. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Incomes RLS
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own incomes"
  ON public.incomes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes"
  ON public.incomes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes"
  ON public.incomes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes"
  ON public.incomes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Expenses RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Budgets RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Savings Goals RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings goals"
  ON public.savings_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
  ON public.savings_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
  ON public.savings_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals"
  ON public.savings_goals FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Documents RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document metadata"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document metadata"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own document metadata"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- SUPABASE CLOUD STORAGE BUCKET: nexmoney-documents
-- Private bucket for receipt, statement, and tax documents
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('nexmoney-documents', 'nexmoney-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies: enforce user isolation by storing in user_id folder: {user_id}/{filename}
CREATE POLICY "Users can read own uploaded documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'nexmoney-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'nexmoney-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'nexmoney-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
