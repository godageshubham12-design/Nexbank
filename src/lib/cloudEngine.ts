import { getLiveSupabaseClient, getStoredSupabaseConfig, SUPABASE_DOCUMENTS_BUCKET } from './supabase';
import { UserProfile, Income, Expense, Budget, SavingsGoal, DocumentRecord, Transaction } from '../types';
import { getInitialSeedForUser } from './mockData';

// Storage keys for Cloud Sandbox simulation
const SANDBOX_USERS_KEY = 'nexmoney_sandbox_users';
const SANDBOX_DATA_KEY_PREFIX = 'nexmoney_sandbox_data_';
const SANDBOX_FILES_KEY_PREFIX = 'nexmoney_sandbox_files_';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  full_name: string;
  created_at: string;
}

// Helper to get local sandbox users
function getSandboxUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(SANDBOX_USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSandboxUsers(users: StoredUser[]) {
  localStorage.setItem(SANDBOX_USERS_KEY, JSON.stringify(users));
}

// Helper to get or init sandbox database for a user
function getSandboxDb(userId: string, email?: string, name?: string) {
  const key = `${SANDBOX_DATA_KEY_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading sandbox db:', err);
  }
  let resolvedEmail = email || '';
  let resolvedName = name || '';
  if (!resolvedEmail) {
    const users = getSandboxUsers();
    const u = users.find(x => x.id === userId);
    if (u) {
      resolvedEmail = u.email;
      resolvedName = u.full_name;
    }
  }
  // Initialize from seed
  const seed = getInitialSeedForUser(userId, resolvedEmail, resolvedName);
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function saveSandboxDb(userId: string, data: any) {
  const key = `${SANDBOX_DATA_KEY_PREFIX}${userId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

// -------------------------------------------------------------
// CLOUD AUTH SERVICE
// -------------------------------------------------------------
export const CloudAuth = {
  async getCurrentSession() {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();
    
    if (config.mode === 'live' && client) {
      try {
        const { data, error } = await client.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
          return null;
        }
        if (data.session?.user) {
          const { data: userData, error: userError } = await client.auth.getUser();
          if (userError || !userData?.user) {
            console.warn('Supabase active user validation note:', userError?.message);
            return null;
          }
          const user = userData.user;
          return {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          };
        }
        // In live mode with no active Supabase session, do NOT fall back to sandbox user!
        return null;
      } catch (err) {
        console.warn('Supabase live session fetch failed:', err);
        return null;
      }
    }

    // Cloud Sandbox session (only when in simulation mode)
    const currentUserId = localStorage.getItem('nexmoney_current_user_id');
    if (!currentUserId) return null;
    const users = getSandboxUsers();
    const user = users.find(u => u.id === currentUserId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    };
  },

  async signUp(email: string, password: string, fullName: string) {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      
      const hasActiveSession = Boolean(data.session);

      // Upsert profile in Supabase if session active
      if (data.user && hasActiveSession) {
        try {
          await client.from('profiles').upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            currency: 'USD',
            created_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch (profileErr) {
          console.warn('Profile upsert note:', profileErr);
        }
      }
      return {
        id: data.user?.id || '',
        email: data.user?.email || email,
        full_name: fullName,
        hasActiveSession,
        needsVerification: !hasActiveSession,
      };
    }

    // Cloud Sandbox registration
    const users = getSandboxUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    const newId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newUser: StoredUser = {
      id: newId,
      email,
      passwordHash: btoa(password), // basic representation for client demo
      full_name: fullName,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    saveSandboxUsers(users);

    // Initialize sandbox database with empty or fresh seed
    const initialData = {
      profile: {
        id: newId,
        email,
        full_name: fullName,
        currency: 'USD',
        created_at: new Date().toISOString(),
      },
      incomes: [],
      expenses: [],
      budgets: [],
      goals: [],
      documents: [],
    };
    saveSandboxDb(newId, initialData);
    localStorage.setItem('nexmoney_current_user_id', newId);

    return {
      id: newId,
      email,
      full_name: fullName,
      needsVerification: false,
    };
  },

  async signIn(email: string, password: string) {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!data.session || !data.user) {
        throw new Error('Supabase authentication succeeded but no session token was issued.');
      }

      // Upsert profile row upon login
      try {
        const resolvedName = data.user.user_metadata?.full_name || email.split('@')[0];
        await client.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email || email,
            full_name: resolvedName,
            currency: 'USD',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('Profile sync on sign in note:', profileErr);
      }

      return {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0],
      };
    }

    // Cloud Sandbox login
    const users = getSandboxUsers();
    
    // Auto-seed demo personas if users array is empty
    if (users.length === 0) {
      const demo1: StoredUser = {
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-111122223333',
        email: 'alex.morgan@nexmoney.edu',
        passwordHash: btoa('demo1234'),
        full_name: 'Alex Morgan',
        created_at: new Date().toISOString(),
      };
      const demo2: StoredUser = {
        id: 'f6e5d4c3-b2a1-0f9e-8d7c-444455556666',
        email: 'sarah.chen@nexmoney.edu',
        passwordHash: btoa('demo1234'),
        full_name: 'Sarah Chen',
        created_at: new Date().toISOString(),
      };
      users.push(demo1, demo2);
      saveSandboxUsers(users);
      getSandboxDb(demo1.id, demo1.email, demo1.full_name);
      getSandboxDb(demo2.id, demo2.email, demo2.full_name);
    }

    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }
    if (matched.passwordHash !== btoa(password)) {
      throw new Error('Invalid email or password.');
    }

    localStorage.setItem('nexmoney_current_user_id', matched.id);
    return {
      id: matched.id,
      email: matched.email,
      full_name: matched.full_name,
    };
  },

  async signOut() {
    const client = getLiveSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    localStorage.removeItem('nexmoney_current_user_id');
  },

  async resetPassword(email: string) {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();
    if (config.mode === 'live' && client) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      return true;
    }
    // Simulation
    await new Promise(res => setTimeout(res, 500));
    return true;
  },
};

// Helper to securely verify active Supabase Auth session and retrieve verified user ID
async function getVerifiedAuthUserId(client: any): Promise<string> {
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    throw new Error(`Supabase session error: ${sessionError.message}`);
  }
  if (!sessionData?.session) {
    throw new Error('No active Supabase authentication session found. Please sign in to authenticate before performing cloud operations.');
  }

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Supabase authentication verification failed. Your session may be invalid or expired. Please sign in again.');
  }

  return userData.user.id;
}

// -------------------------------------------------------------
// CLOUD DATABASE SERVICE (POSTGRESQL + RLS)
// -------------------------------------------------------------
export const CloudDatabase = {
  // Profiles
  async getProfile(userId: string): Promise<UserProfile> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', authenticatedUserId)
        .maybeSingle();

      if (data) return data as UserProfile;

      // Auto-create initial profile row for verified user if missing
      const { data: userData } = await client.auth.getUser();
      const newProfile: UserProfile = {
        id: authenticatedUserId,
        email: userData?.user?.email || '',
        full_name: userData?.user?.user_metadata?.full_name || userData?.user?.email?.split('@')[0] || 'User',
        currency: 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      try {
        await client.from('profiles').upsert(newProfile, { onConflict: 'id' });
      } catch (err) {
        console.warn('Profile auto-creation note:', err);
      }
      return newProfile;
    }

    const db = getSandboxDb(userId, '', '');
    return db.profile || {
      id: userId,
      email: '',
      full_name: 'User',
      currency: 'USD',
      created_at: new Date().toISOString(),
    };
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', authenticatedUserId)
        .select()
        .single();
      if (error) throw error;
      return data as UserProfile;
    }

    const db = getSandboxDb(userId, '', '');
    db.profile = { ...db.profile, ...updates, updated_at: new Date().toISOString() };
    saveSandboxDb(userId, db);
    return db.profile;
  },

  // Incomes
  async getIncomes(userId: string): Promise<Income[]> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('incomes')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []) as Income[];
    }

    const db = getSandboxDb(userId, '', '');
    return (db.incomes || []).sort((a: Income, b: Income) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createIncome(userId: string, income: Omit<Income, 'id' | 'user_id' | 'created_at'>): Promise<Income> {
    if (income.amount <= 0) throw new Error('Income amount must be greater than zero.');
    if (!income.title.trim()) throw new Error('Income title is required.');

    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      // 1. Strictly verify the active Supabase session and get authenticated user ID
      const authenticatedUserId = await getVerifiedAuthUserId(client);

      // 2. Perform INSERT query using the verified auth.uid()
      const { data, error } = await client
        .from('incomes')
        .insert({
          title: income.title.trim(),
          amount: income.amount,
          category: income.category,
          date: income.date,
          payment_method: income.payment_method,
          notes: income.notes ? income.notes.trim() : null,
          user_id: authenticatedUserId,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase income insert error:', error);
        throw error;
      }
      return data as Income;
    }

    const db = getSandboxDb(userId, '', '');
    const newRecord: Income = {
      ...income,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    db.incomes = [newRecord, ...(db.incomes || [])];
    saveSandboxDb(userId, db);
    return newRecord;
  },

  async updateIncome(userId: string, id: string, updates: Partial<Income>): Promise<Income> {
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Income amount must be greater than zero.');
    }
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('incomes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', authenticatedUserId) // Enforce RLS
        .select()
        .single();
      if (error) throw error;
      return data as Income;
    }

    const db = getSandboxDb(userId, '', '');
    const idx = (db.incomes || []).findIndex((i: Income) => i.id === id && i.user_id === userId);
    if (idx === -1) throw new Error('Income record not found or access denied (RLS).');
    db.incomes[idx] = { ...db.incomes[idx], ...updates, updated_at: new Date().toISOString() };
    saveSandboxDb(userId, db);
    return db.incomes[idx];
  },

  async deleteIncome(userId: string, id: string): Promise<boolean> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { error } = await client
        .from('incomes')
        .delete()
        .eq('id', id)
        .eq('user_id', authenticatedUserId);
      if (error) throw error;
      return true;
    }

    const db = getSandboxDb(userId, '', '');
    db.incomes = (db.incomes || []).filter((i: Income) => !(i.id === id && i.user_id === userId));
    saveSandboxDb(userId, db);
    return true;
  },

  // Expenses
  async getExpenses(userId: string): Promise<Expense[]> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('expenses')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []) as Expense[];
    }

    const db = getSandboxDb(userId, '', '');
    return (db.expenses || []).sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async createExpense(userId: string, expense: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> {
    if (expense.amount <= 0) throw new Error('Expense amount must be greater than zero.');
    if (!expense.title.trim()) throw new Error('Expense title is required.');

    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);

      const { data, error } = await client
        .from('expenses')
        .insert({
          title: expense.title.trim(),
          amount: expense.amount,
          category: expense.category,
          date: expense.date,
          payment_method: expense.payment_method,
          notes: expense.notes ? expense.notes.trim() : null,
          user_id: authenticatedUserId,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Expense;
    }

    const db = getSandboxDb(userId, '', '');
    const newRecord: Expense = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    db.expenses = [newRecord, ...(db.expenses || [])];
    saveSandboxDb(userId, db);
    return newRecord;
  },

  async updateExpense(userId: string, id: string, updates: Partial<Expense>): Promise<Expense> {
    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Expense amount must be greater than zero.');
    }
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', authenticatedUserId)
        .select()
        .single();
      if (error) throw error;
      return data as Expense;
    }

    const db = getSandboxDb(userId, '', '');
    const idx = (db.expenses || []).findIndex((e: Expense) => e.id === id && e.user_id === userId);
    if (idx === -1) throw new Error('Expense record not found or access denied (RLS).');
    db.expenses[idx] = { ...db.expenses[idx], ...updates, updated_at: new Date().toISOString() };
    saveSandboxDb(userId, db);
    return db.expenses[idx];
  },

  async deleteExpense(userId: string, id: string): Promise<boolean> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { error } = await client
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', authenticatedUserId);
      if (error) throw error;
      return true;
    }

    const db = getSandboxDb(userId, '', '');
    db.expenses = (db.expenses || []).filter((e: Expense) => !(e.id === id && e.user_id === userId));
    saveSandboxDb(userId, db);
    return true;
  },

  // Budgets
  async getBudgets(userId: string, month?: string): Promise<Budget[]> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      let query = client.from('budgets').select('*').eq('user_id', authenticatedUserId);
      if (month) query = query.eq('month', month);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Budget[];
    }

    const db = getSandboxDb(userId, '', '');
    let list = db.budgets || [];
    if (month) list = list.filter((b: Budget) => b.month === month);
    return list;
  },

  async upsertBudget(userId: string, budget: Omit<Budget, 'id' | 'user_id' | 'created_at'>): Promise<Budget> {
    if (budget.monthly_budget <= 0) throw new Error('Budget amount must be greater than zero.');

    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('budgets')
        .upsert(
          {
            ...budget,
            user_id: authenticatedUserId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,category,month' }
        )
        .select()
        .single();
      if (error) throw error;
      return data as Budget;
    }

    const db = getSandboxDb(userId, '', '');
    const list = db.budgets || [];
    const idx = list.findIndex(
      (b: Budget) => b.user_id === userId && b.category === budget.category && b.month === budget.month
    );

    if (idx >= 0) {
      list[idx] = { ...list[idx], ...budget, updated_at: new Date().toISOString() };
      db.budgets = list;
      saveSandboxDb(userId, db);
      return list[idx];
    } else {
      const newBudget: Budget = {
        ...budget,
        id: `bud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      db.budgets = [newBudget, ...list];
      saveSandboxDb(userId, db);
      return newBudget;
    }
  },

  async deleteBudget(userId: string, id: string): Promise<boolean> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { error } = await client.from('budgets').delete().eq('id', id).eq('user_id', authenticatedUserId);
      if (error) throw error;
      return true;
    }

    const db = getSandboxDb(userId, '', '');
    db.budgets = (db.budgets || []).filter((b: Budget) => !(b.id === id && b.user_id === userId));
    saveSandboxDb(userId, db);
    return true;
  },

  // Savings Goals
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('savings_goals')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SavingsGoal[];
    }

    const db = getSandboxDb(userId, '', '');
    return db.goals || [];
  },

  async createSavingsGoal(userId: string, goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at'>): Promise<SavingsGoal> {
    if (goal.target_amount <= 0) throw new Error('Target amount must be greater than zero.');
    if (!goal.goal_name.trim()) throw new Error('Goal name is required.');

    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('savings_goals')
        .insert({
          ...goal,
          user_id: authenticatedUserId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as SavingsGoal;
    }

    const db = getSandboxDb(userId, '', '');
    const newRecord: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    db.goals = [newRecord, ...(db.goals || [])];
    saveSandboxDb(userId, db);
    return newRecord;
  },

  async updateSavingsGoal(userId: string, id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> {
    if (updates.target_amount !== undefined && updates.target_amount <= 0) {
      throw new Error('Target amount must be greater than zero.');
    }
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('savings_goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', authenticatedUserId)
        .select()
        .single();
      if (error) throw error;
      return data as SavingsGoal;
    }

    const db = getSandboxDb(userId, '', '');
    const idx = (db.goals || []).findIndex((g: SavingsGoal) => g.id === id && g.user_id === userId);
    if (idx === -1) throw new Error('Goal not found or access denied.');
    db.goals[idx] = { ...db.goals[idx], ...updates, updated_at: new Date().toISOString() };
    saveSandboxDb(userId, db);
    return db.goals[idx];
  },

  async deleteSavingsGoal(userId: string, id: string): Promise<boolean> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { error } = await client
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', authenticatedUserId);
      if (error) throw error;
      return true;
    }

    const db = getSandboxDb(userId, '', '');
    db.goals = (db.goals || []).filter((g: SavingsGoal) => !(g.id === id && g.user_id === userId));
    saveSandboxDb(userId, db);
    return true;
  },

  // -----------------------------------------------------------
  // SUPABASE CLOUD STORAGE SERVICE (nexmoney-documents)
  // -----------------------------------------------------------
  async getDocuments(userId: string): Promise<DocumentRecord[]> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const { data, error } = await client
        .from('documents')
        .select('*')
        .eq('user_id', authenticatedUserId)
        .order('upload_date', { ascending: false });
      if (error) throw error;
      return (data || []) as DocumentRecord[];
    }

    const db = getSandboxDb(userId, '', '');
    return db.documents || [];
  },

  async uploadDocument(
    userId: string,
    file: File,
    category: DocumentRecord['category']
  ): Promise<DocumentRecord> {
    if (!file) throw new Error('No file provided for upload.');
    if (file.size > 15 * 1024 * 1024) throw new Error('File exceeds 15MB limit.');

    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${authenticatedUserId}/${Date.now()}_${sanitizedName}`;

      // 1. Upload to Supabase Storage Bucket
      const { error: uploadError } = await client.storage
        .from(SUPABASE_DOCUMENTS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      if (uploadError) throw new Error(`Supabase Storage upload error: ${uploadError.message}`);

      // 2. Insert metadata into PostgreSQL 'documents' table
      const { data, error: dbError } = await client
        .from('documents')
        .insert({
          user_id: authenticatedUserId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          category,
          upload_date: new Date().toISOString(),
        })
        .select()
        .single();
      if (dbError) throw dbError;
      return data as DocumentRecord;
    }

    // Cloud Sandbox simulated upload
    // Store file in IndexedDB or base64 representation for simulated download
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const sandboxFilePath = `${userId}/${Date.now()}_${sanitizedName}`;

    const fileReader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      fileReader.onload = () => resolve(fileReader.result as string);
      fileReader.readAsDataURL(file);
    });
    const base64Content = await base64Promise;

    const fileStorageKey = `${SANDBOX_FILES_KEY_PREFIX}${sandboxFilePath}`;
    try {
      localStorage.setItem(fileStorageKey, base64Content);
    } catch {
      // Storage quota fallback
      console.warn('Sandbox file storage quota exceeded, storing metadata only');
    }

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      file_name: file.name,
      file_path: sandboxFilePath,
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      category,
      upload_date: new Date().toISOString(),
    };

    const db = getSandboxDb(userId, '', '');
    db.documents = [newDoc, ...(db.documents || [])];
    saveSandboxDb(userId, db);
    return newDoc;
  },

  async downloadDocument(userId: string, doc: DocumentRecord): Promise<void> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      await getVerifiedAuthUserId(client);
      const { data, error } = await client.storage
        .from(SUPABASE_DOCUMENTS_BUCKET)
        .download(doc.file_path);
      if (error) throw new Error(`Failed to download from Supabase Storage: ${error.message}`);
      
      const blobUrl = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return;
    }

    // Cloud Sandbox simulated download
    const fileStorageKey = `${SANDBOX_FILES_KEY_PREFIX}${doc.file_path}`;
    const base64Data = localStorage.getItem(fileStorageKey);
    let downloadUrl: string;

    if (base64Data) {
      downloadUrl = base64Data;
    } else {
      // Generate standard mock receipt file
      const mockText = `NEXMONEY SECURE CLOUD STORAGE RECEIPT
=================================================
Document: ${doc.file_name}
Category: ${doc.category}
Uploaded By User ID: ${doc.user_id}
Timestamp: ${doc.upload_date}
File Size: ${(doc.file_size / 1024).toFixed(1)} KB
Security Verification: Supabase RLS Validated
Cloud Storage Bucket: ${SUPABASE_DOCUMENTS_BUCKET}
=================================================`;
      const blob = new Blob([mockText], { type: 'text/plain' });
      downloadUrl = URL.createObjectURL(blob);
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async deleteDocument(userId: string, doc: DocumentRecord): Promise<boolean> {
    const client = getLiveSupabaseClient();
    const config = getStoredSupabaseConfig();

    if (config.mode === 'live' && client) {
      const authenticatedUserId = await getVerifiedAuthUserId(client);
      // 1. Delete file from Supabase Storage
      await client.storage.from(SUPABASE_DOCUMENTS_BUCKET).remove([doc.file_path]);

      // 2. Delete metadata row
      const { error } = await client
        .from('documents')
        .delete()
        .eq('id', doc.id)
        .eq('user_id', authenticatedUserId);
      if (error) throw error;
      return true;
    }

    const fileStorageKey = `${SANDBOX_FILES_KEY_PREFIX}${doc.file_path}`;
    localStorage.removeItem(fileStorageKey);

    const db = getSandboxDb(userId, '', '');
    db.documents = (db.documents || []).filter((d: DocumentRecord) => !(d.id === doc.id && d.user_id === userId));
    saveSandboxDb(userId, db);
    return true;
  },

  // Reset/Seed Database utility for presentation demonstrations
  async resetAndSeedUser(userId: string, email: string, name: string) {
    const freshSeed = getInitialSeedForUser(userId, email, name);
    saveSandboxDb(userId, freshSeed);
    return freshSeed;
  },
};
