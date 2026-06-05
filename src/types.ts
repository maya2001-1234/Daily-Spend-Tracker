/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  notes?: string;
}

export type ExpenseCategory =
  | 'food'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'transport'
  | 'health'
  | 'education'
  | 'other';

export interface CategoryConfig {
  id: ExpenseCategory;
  label: string;
  color: string; // Hex or tailwind color name
  bgLight: string; // light background styling
  icon: string; // Name of Lucide icon to render
}

export interface Budget {
  monthlyLimit: number;
  categoryLimits: Record<ExpenseCategory, number | null>;
}

export interface MonthlyStats {
  monthKey: string; // YYYY-MM
  total: number;
  count: number;
  byCategory: Record<ExpenseCategory, number>;
}

export interface ComparisonRating {
  rating: 'excellent' | 'good' | 'fair' | 'warning' | 'critical';
  title: string;
  score: number; // 0-100 rating
  color: string; // text/border color
  bgClass: string; // lighter bg
  percentageDiff: number; // difference versus previous months average
  advice: string;
}

export type CurrencyCode = 'LKR' | 'USD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateVsUSD: number;
}

export interface User {
  username: string;
  email: string;
  passwordHash: string; // simulated stored hash
  createdAt: string;
}

export interface AuthSession {
  username: string;
  email: string;
}

