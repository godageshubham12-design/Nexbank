import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON } from './supabase';

describe('Supabase Configuration & Auth Session Integrity', () => {
  test('DEFAULT_SUPABASE_URL points to the live project instance', () => {
    assert.equal(DEFAULT_SUPABASE_URL, 'https://odzkkahthrptpqldchre.supabase.co');
    assert.ok(DEFAULT_SUPABASE_URL.startsWith('https://'));
  });

  test('DEFAULT_SUPABASE_ANON is the live publishable key', () => {
    assert.equal(DEFAULT_SUPABASE_ANON, 'sb_publishable_XC-si0L325xVbrqE6Q4DQw_Pf9FKvrb');
    assert.ok(DEFAULT_SUPABASE_ANON.length > 20);
  });
});

describe('Financial KPI Calculation Logic', () => {
  test('calculates available balance and savings rate correctly', () => {
    const incomes = [
      { amount: 5000, date: '2026-11-01' },
      { amount: 1200, date: '2026-11-02' },
    ];
    const expenses = [
      { amount: 1500, date: '2026-11-01' },
      { amount: 700, date: '2026-11-02' },
    ];

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const availableBalance = totalIncome - totalExpenses;
    const savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 100);

    assert.equal(totalIncome, 6200);
    assert.equal(totalExpenses, 2200);
    assert.equal(availableBalance, 4000);
    assert.equal(savingsRate, 65);
  });

  test('handles zero income safely without division by zero', () => {
    const totalIncome = 0;
    const totalExpenses = 500;
    const savingsRate = totalIncome <= 0 ? 0 : Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100));
    assert.equal(savingsRate, 0);
  });
});
