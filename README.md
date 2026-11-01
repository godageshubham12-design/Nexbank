# NEXMONEY – Cloud Finance Management System
### College Cloud Computing CC-2 Mini-Project
**Strict Backend Requirement: Supabase Only (PostgreSQL, Auth, Storage, RLS)**

---

## 🌟 Project Overview
**NEXMONEY** is a banking-grade personal finance management web application engineered for the **Cloud Computing CC-2** mini-project. It showcases modern cloud application design patterns:
- Multi-tenant cloud databases with PostgreSQL
- Row Level Security (RLS) policies for complete user data isolation
- Cloud authentication with JWT session lifecycle & automatic triggers
- Secure private cloud object storage (`nexmoney-documents`) for financial documents & bills
- Real-time client analytics, spending thresholds, and budget alerts

---

## 🏗️ 10 Cloud Computing Concepts Demonstrated
1. **Cloud-Based Relational Database**: Managed PostgreSQL cluster hosted on Supabase Cloud.
2. **Cloud Authentication**: Cryptographic token management, secure user registration, session refresh, and password recovery.
3. **Cloud File Storage**: Private cloud bucket (`nexmoney-documents`) for sensitive receipt storage.
4. **Secure Multipart File Upload**: Streaming user documents to authenticated cloud storage keys (`{auth.uid()}/...`).
5. **Secure File Download**: Authenticated blob generation preventing unauthorized link sharing.
6. **Multi-User Multi-Tenant Access**: Real-time isolation where multiple accounts coexist without data leakage.
7. **Cloud Data Persistence**: High durability with PostgreSQL ACID compliance and automated schema backups.
8. **Database Integrity & Constraints**: Checks for non-negative amounts, foreign key cascades, and unique category constraints.
9. **Row Level Security (RLS)**: Enforced directly at the database engine level via `auth.uid() = user_id`.
10. **Global Cloud Deployment**: Cloud-native SPA ready for Netlify and global CDN edge distribution.

---

## 🚀 Supabase Cloud Setup Instructions

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Note your **Project URL** and **Anon Public Key** from `Project Settings -> API`.

### Step 2: Run Database Schema Script
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Open `/supabase/schema.sql` from this repository or click the **"Copy Supabase SQL"** button inside the app's **Cloud CC-2 Arch** tab.
3. Paste the entire SQL script and execute it.
4. This script automatically generates:
   - `profiles` table with automatic user creation trigger
   - `incomes` table with check constraints and RLS
   - `expenses` table with check constraints and RLS
   - `budgets` table with unique month constraints and RLS
   - `savings_goals` table with progress tracking
   - `documents` table for storage metadata
   - `nexmoney-documents` private storage bucket with storage RLS policies

### Step 3: Configure Environment Variables
Set these variables in your deployment environment or in `.env`:
```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"
```
*(Alternatively, you can enter them directly into the in-app Settings panel!)*

---

## 🧪 Evaluation Test Sequence
1. **Register User**: Create an account with Full Name, Email, and Password. Verify automatic profile creation.
2. **Dashboard Verification**: Check KPI cards showing Available Balance = Total Income - Total Expenses.
3. **Income & Expense CRUD**: Add records and observe instant recalculation of Available Balance and Savings Rate.
4. **Budget Guardrails**: Set a category budget. Watch progress bar turn green (<80%), yellow warning (80%), and red alert (>=100%).
5. **Savings Milestones**: Create a savings goal and deposit funds. Reach 100% to trigger confetti celebration!
6. **Document Vault**: Upload a receipt to `nexmoney-documents`. Verify download and delete capabilities.
7. **Statement Generation**: Filter transactions and click "Print / Save PDF" to generate a formal bank statement.
8. **RLS Multi-User Test**: Use the sidebar quick-switcher to switch between **Alex Morgan** and **Sarah Chen**. Confirm neither user can view or modify the other's records.

---

## 🛡️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti
- **Backend & Cloud**: Supabase PostgreSQL, Supabase Auth, Supabase Cloud Storage, Supabase RLS
- **Hosting**: Netlify (Frontend SPA)
