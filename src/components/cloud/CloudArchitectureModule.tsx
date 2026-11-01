import React, { useState } from 'react';
import {
  Cloud,
  Database,
  Lock,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Server,
  Layers,
  ArrowRight,
  ExternalLink,
  Cpu,
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SUPABASE_DOCUMENTS_BUCKET } from '../../lib/supabase';

const SCHEMA_SQL = `-- ==============================================================================
-- NEXMONEY: Cloud Finance Management System
-- College Cloud Computing CC-2 Mini-Project Database Schema
-- Target Platform: Supabase PostgreSQL with Row Level Security (RLS)
-- Bucket: nexmoney-documents (Private Cloud Storage)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TABLE 2: INCOMES
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('Salary', 'Business', 'Freelancing', 'Investments', 'Interest', 'Rental', 'Gifts', 'Other')),
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TABLE 3: EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL CHECK (category IN ('Food', 'Shopping', 'Travel', 'Education', 'Bills', 'Health', 'Entertainment', 'Housing', 'Groceries', 'Other')),
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TABLE 4: BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  monthly_budget NUMERIC(12, 2) NOT NULL CHECK (monthly_budget > 0),
  month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_user_category_month UNIQUE (user_id, category, month)
);

-- TABLE 5: SAVINGS_GOALS
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_name TEXT NOT NULL CHECK (char_length(trim(goal_name)) > 0),
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  current_saved NUMERIC(12, 2) DEFAULT 0 CHECK (current_saved >= 0),
  target_date DATE NOT NULL,
  notes TEXT,
  color TEXT DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TABLE 6: DOCUMENTS
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  upload_date TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AUTOMATIC PROFILE TRIGGER ON AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, currency)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'USD'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own incomes" ON public.incomes FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own savings_goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);

-- SUPABASE STORAGE: nexmoney-documents
INSERT INTO storage.buckets (id, name, public) VALUES ('nexmoney-documents', 'nexmoney-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users manage own storage docs" ON storage.objects
  FOR ALL USING (bucket_id = 'nexmoney-documents' AND (storage.foldername(name))[1] = auth.uid()::text);`;

export const CloudArchitectureModule: React.FC = () => {
  const { cloudMode, isConfigured } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'concepts' | 'sql' | 'architecture'>('concepts');

  const handleCopy = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cloudConcepts = [
    {
      title: '1. Cloud-Based Database',
      desc: 'High-availability PostgreSQL database hosted in Supabase Cloud with transactional consistency and ACID guarantees.',
      icon: Database,
    },
    {
      title: '2. Cloud Authentication',
      desc: 'Token-based authentication with session persistence, cryptographic password hashing, and user profile hooks.',
      icon: Key,
    },
    {
      title: '3. Cloud File Storage',
      desc: `Dedicated private object bucket (${SUPABASE_DOCUMENTS_BUCKET}) for financial bills, statements, and tax receipts.`,
      icon: Cloud,
    },
    {
      title: '4. Secure File Upload',
      desc: 'Direct authenticated multipart upload pipeline sending binary payloads into user-partitioned storage keys.',
      icon: FileText,
    },
    {
      title: '5. Secure File Download',
      desc: 'Pre-authenticated blob generation with strict token verification preventing unauthorized access to external links.',
      icon: Server,
    },
    {
      title: '6. Multi-Tenant Isolation',
      desc: 'Multiple concurrent users maintain independent financial balances without cross-tenant data leakage.',
      icon: Layers,
    },
    {
      title: '7. Data Persistence',
      desc: 'All records remain preserved across client browser refreshes, device switches, and network reconnects.',
      icon: Cpu,
    },
    {
      title: '8. Database Security & Constraints',
      desc: 'Enforces positive amount constraints (amount > 0), unique category constraints per month, and foreign keys.',
      icon: ShieldCheck,
    },
    {
      title: '9. Row Level Security (RLS)',
      desc: 'Every SQL query evaluates auth.uid() = user_id at the PostgreSQL engine level; clients cannot bypass access rules.',
      icon: Lock,
    },
    {
      title: '10. Cloud-Based Application Access',
      desc: 'Global CDN distribution and frontend delivery deployed with zero server maintenance overhead.',
      icon: ExternalLink,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Cloud Computing CC-2 Mini-Project
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% Supabase Only
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Cloud Architecture & PostgreSQL RLS Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Demonstrates real multi-tenant cloud storage, schema constraints, automated user triggers, and
              row-level isolation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'SQL Copied!' : 'Copy Supabase SQL'}</span>
            </button>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'concepts'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            10 Cloud Computing Concepts
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'sql'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Supabase SQL Schema & RLS
          </button>
        </div>
      </div>

      {/* Tab 1: 10 Concepts Grid */}
      {activeTab === 'concepts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cloudConcepts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex items-start gap-3.5 hover:border-slate-700 transition"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: SQL Schema Code Inspector */}
      {activeTab === 'sql' && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Database className="w-4 h-4 text-blue-400" />
              <span>supabase/schema.sql</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed selection:bg-blue-600 selection:text-white">
            {SCHEMA_SQL}
          </pre>
        </div>
      )}
    </div>
  );
};
