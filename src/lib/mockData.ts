import { UserProfile, Income, Expense, Budget, SavingsGoal, DocumentRecord } from '../types';

export interface SeedData {
  profile: UserProfile;
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  goals: SavingsGoal[];
  documents: DocumentRecord[];
}

export const DEMO_USERS: { email: string; name: string; role: string; id: string }[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-111122223333',
    name: 'Alex Morgan',
    email: 'alex.morgan@nexmoney.edu',
    role: 'Cloud Engineering Student',
  },
  {
    id: 'f6e5d4c3-b2a1-0f9e-8d7c-444455556666',
    name: 'Sarah Chen',
    email: 'sarah.chen@nexmoney.edu',
    role: 'Fintech Analyst',
  },
];

export function getInitialSeedForUser(userId: string, email: string, name: string): SeedData {
  const isSarah = (email && email.toLowerCase().includes('sarah')) || userId === 'f6e5d4c3-b2a1-0f9e-8d7c-444455556666';
  const currency = 'USD';
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const todayStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  if (isSarah) {
    return {
      profile: {
        id: userId,
        email,
        full_name: name || 'Sarah Chen',
        currency: 'USD',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      incomes: [
        {
          id: 'inc-s-1',
          user_id: userId,
          title: 'UX Consulting Retainer',
          amount: 3200,
          category: 'Freelancing',
          date: todayStr(4),
          payment_method: 'Bank Transfer',
          notes: 'Client payment for fintech mobile app sprint',
          created_at: todayStr(4),
        },
        {
          id: 'inc-s-2',
          user_id: userId,
          title: 'Design Workshop Speaker Honorarium',
          amount: 750,
          category: 'Other',
          date: todayStr(14),
          payment_method: 'UPI',
          notes: 'University tech talk on Cloud UI systems',
          created_at: todayStr(14),
        },
      ],
      expenses: [
        {
          id: 'exp-s-1',
          user_id: userId,
          title: 'Adobe Creative Cloud Subscription',
          amount: 54.99,
          category: 'Bills',
          date: todayStr(2),
          payment_method: 'Credit Card',
          notes: 'Monthly design suite subscription',
          created_at: todayStr(2),
        },
        {
          id: 'exp-s-2',
          user_id: userId,
          title: 'Design Research Books & Courses',
          amount: 140,
          category: 'Education',
          date: todayStr(9),
          payment_method: 'Debit Card',
          notes: 'Cloud architecture reference manuals',
          created_at: todayStr(9),
        },
        {
          id: 'exp-s-3',
          user_id: userId,
          title: 'Whole Foods Organic Groceries',
          amount: 185.50,
          category: 'Food',
          date: todayStr(5),
          payment_method: 'Credit Card',
          notes: 'Weekly pantry supplies',
          created_at: todayStr(5),
        },
      ],
      budgets: [
        {
          id: 'bud-s-1',
          user_id: userId,
          category: 'Food',
          monthly_budget: 600,
          month: currentMonth,
          created_at: todayStr(25),
        },
        {
          id: 'bud-s-2',
          user_id: userId,
          category: 'Bills',
          monthly_budget: 350,
          month: currentMonth,
          created_at: todayStr(25),
        },
      ],
      goals: [
        {
          id: 'goal-s-1',
          user_id: userId,
          goal_name: 'MacBook Pro M3 Max Studio',
          target_amount: 3200,
          current_saved: 2400,
          target_date: todayStr(-60),
          notes: 'Next hardware upgrade for mobile rendering',
          color: '#3b82f6',
          icon: 'laptop',
          created_at: todayStr(28),
        },
      ],
      documents: [
        {
          id: 'doc-s-1',
          user_id: userId,
          file_name: 'consulting_agreement_2026.pdf',
          file_path: `${userId}/consulting_agreement_2026.pdf`,
          file_size: 428000,
          file_type: 'application/pdf',
          category: 'Invoice',
          upload_date: todayStr(4),
        },
      ],
    };
  }

  // Default Alex Morgan data
  return {
    profile: {
      id: userId,
      email,
      full_name: name || 'Alex Morgan',
      currency: 'USD',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    },
    incomes: [
      {
        id: 'inc-a-1',
        user_id: userId,
        title: 'Monthly Tech Salary',
        amount: 5400,
        category: 'Salary',
        date: todayStr(1),
        payment_method: 'Bank Transfer',
        notes: 'Direct corporate deposit for November cycle',
        created_at: todayStr(1),
      },
      {
        id: 'inc-a-2',
        user_id: userId,
        title: 'Stock Dividend Payout',
        amount: 380,
        category: 'Investments',
        date: todayStr(8),
        payment_method: 'Bank Transfer',
        notes: 'Index Fund quarterly returns',
        created_at: todayStr(8),
      },
      {
        id: 'inc-a-3',
        user_id: userId,
        title: 'Cloud DevOps Consulting',
        amount: 1250,
        category: 'Freelancing',
        date: todayStr(15),
        payment_method: 'Bank Transfer',
        notes: 'Kubernetes CI/CD pipeline automation setup',
        created_at: todayStr(15),
      },
    ],
    expenses: [
      {
        id: 'exp-a-1',
        user_id: userId,
        title: 'High-Speed Fiber Internet & Electricity',
        amount: 195.0,
        category: 'Bills',
        date: todayStr(2),
        payment_method: 'Net Banking',
        notes: 'Home office utility invoice',
        created_at: todayStr(2),
      },
      {
        id: 'exp-a-2',
        user_id: userId,
        title: 'Metropolitan Apartment Rent',
        amount: 1650.0,
        category: 'Housing',
        date: todayStr(1),
        payment_method: 'Bank Transfer',
        notes: 'Monthly residential lease',
        created_at: todayStr(1),
      },
      {
        id: 'exp-a-3',
        user_id: userId,
        title: 'Supermarket Organic Groceries',
        amount: 345.8,
        category: 'Food',
        date: todayStr(5),
        payment_method: 'Credit Card',
        notes: 'Fresh veggies, produce, and dairy',
        created_at: todayStr(5),
      },
      {
        id: 'exp-a-4',
        user_id: userId,
        title: 'AWS & Cloud Sandbox Certifications',
        amount: 220.0,
        category: 'Education',
        date: todayStr(10),
        payment_method: 'Credit Card',
        notes: 'Cloud Computing CC-2 exam registration voucher',
        created_at: todayStr(10),
      },
      {
        id: 'exp-a-5',
        user_id: userId,
        title: 'Weekend Flight & Commuter Transit',
        amount: 280.0,
        category: 'Travel',
        date: todayStr(12),
        payment_method: 'Credit Card',
        notes: 'Commuter pass & rapid rail ticket',
        created_at: todayStr(12),
      },
      {
        id: 'exp-a-6',
        user_id: userId,
        title: 'Streaming & Cinema Subscriptions',
        amount: 45.0,
        category: 'Entertainment',
        date: todayStr(18),
        payment_method: 'Debit Card',
        notes: 'Family media bundle',
        created_at: todayStr(18),
      },
    ],
    budgets: [
      {
        id: 'bud-a-1',
        user_id: userId,
        category: 'Food',
        monthly_budget: 600,
        month: currentMonth,
        created_at: todayStr(28),
      },
      {
        id: 'bud-a-2',
        user_id: userId,
        category: 'Bills',
        monthly_budget: 300,
        month: currentMonth,
        created_at: todayStr(28),
      },
      {
        id: 'bud-a-3',
        user_id: userId,
        category: 'Travel',
        monthly_budget: 400,
        month: currentMonth,
        created_at: todayStr(28),
      },
      {
        id: 'bud-a-4',
        user_id: userId,
        category: 'Education',
        monthly_budget: 350,
        month: currentMonth,
        created_at: todayStr(28),
      },
    ],
    goals: [
      {
        id: 'goal-a-1',
        user_id: userId,
        goal_name: 'Emergency Cloud Reserve Fund',
        target_amount: 10000,
        current_saved: 8400,
        target_date: todayStr(-120),
        notes: '6 months of living expenses in high-yield account',
        color: '#10b981',
        icon: 'shield',
        created_at: todayStr(45),
      },
      {
        id: 'goal-a-2',
        user_id: userId,
        goal_name: 'Tokyo Tech Conference Trip',
        target_amount: 2500,
        current_saved: 1850,
        target_date: todayStr(-75),
        notes: 'Flights, hotel, and conference pass',
        color: '#f59e0b',
        icon: 'plane',
        created_at: todayStr(30),
      },
      {
        id: 'goal-a-3',
        user_id: userId,
        goal_name: 'New Home Equity Down Payment',
        target_amount: 25000,
        current_saved: 14200,
        target_date: todayStr(-365),
        notes: 'Targeting 20% down payment fund',
        color: '#6366f1',
        icon: 'home',
        created_at: todayStr(60),
      },
    ],
    documents: [
      {
        id: 'doc-a-1',
        user_id: userId,
        file_name: 'monthly_salary_slip_nov2026.pdf',
        file_path: `${userId}/monthly_salary_slip_nov2026.pdf`,
        file_size: 614000,
        file_type: 'application/pdf',
        category: 'Salary Slip',
        upload_date: todayStr(1),
      },
      {
        id: 'doc-a-2',
        user_id: userId,
        file_name: 'apartment_lease_receipt.pdf',
        file_path: `${userId}/apartment_lease_receipt.pdf`,
        file_size: 1024000,
        file_type: 'application/pdf',
        category: 'Expense Receipt',
        upload_date: todayStr(2),
      },
      {
        id: 'doc-a-3',
        user_id: userId,
        file_name: 'cc2_cloud_exam_voucher.pdf',
        file_path: `${userId}/cc2_cloud_exam_voucher.pdf`,
        file_size: 340000,
        file_type: 'application/pdf',
        category: 'Invoice',
        upload_date: todayStr(10),
      },
    ],
  };
}
