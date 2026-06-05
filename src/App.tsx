/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Github,
  PiggyBank,
  User as UserIcon,
  LogOut,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { Expense, MonthlyStats, CurrencyCode, AuthSession, User } from './types';
import TransactionForm from './components/TransactionForm';
import MonthlyDashboard from './components/MonthlyDashboard';
import TransactionHistory from './components/TransactionHistory';
import AuthPage from './components/AuthPage';
import { getMonthlyStats, formatMonthKey } from './utils/financeUtils';
import { motion, AnimatePresence } from 'motion/react';

// Prepopulate baseline historical values so MoM analyzer rates spending immediately
const HISTORICAL_SEEDS: Expense[] = [
  // March 2026 (Historic 1)
  { id: '1', title: 'Whole Foods Grocery', amount: 185.50, date: '2026-03-05', category: 'food', notes: 'Monthly groceries stock' },
  { id: '2', title: 'Netflix & Spotify Premium', amount: 35.40, date: '2026-03-10', category: 'entertainment', notes: 'Entertainment subscriptions' },
  { id: '3', title: 'Power Grid Utility Bill', amount: 110.00, date: '2026-03-15', category: 'utilities', notes: 'Heating and lights charges' },
  { id: '4', title: 'Mobil Gas Station', amount: 65.00, date: '2026-03-22', category: 'transport', notes: 'Diesel refill' },
  { id: '5', title: 'New Sports Running Shoes', amount: 120.00, date: '2026-03-25', category: 'shopping', notes: 'Discretionary retail purchase' },
  { id: '6', title: 'Downtown Pharmacy', amount: 45.00, date: '2026-03-28', category: 'health', notes: 'Essential prescriptions' },

  // April 2026 (Historic 2)
  { id: '7', title: 'Gourmet Steakhouse Diner', amount: 140.00, date: '2026-04-02', category: 'food', notes: 'Dinner with coworkers' },
  { id: '8', title: 'Monthly Apartment Highspeed Rent', amount: 220.00, date: '2026-04-05', category: 'utilities', notes: 'Rent and high-speed fiber fee' },
  { id: '9', title: 'Airport Shuttle Ticket', amount: 80.00, date: '2026-04-12', category: 'transport', notes: 'Business travel transit' },
  { id: '10', title: 'Tech Gadget Cover Upgrade', amount: 48.00, date: '2026-04-18', category: 'shopping', notes: 'Silicone shell cover' },
  { id: '11', title: 'Udemy React Bootcamp', amount: 95.00, date: '2026-04-20', category: 'education', notes: 'Dynamic TypeScript skills' },
  { id: '12', title: 'IMAX Cinema Seats', amount: 38.50, date: '2026-04-26', category: 'entertainment', notes: 'Blockbuster sci-fi movie' },

  // May 2026 (Active period)
  { id: '13', title: 'Local Farmers Market', amount: 92.20, date: '2026-05-04', category: 'food', notes: 'Organic vegetable supply' },
  { id: '14', title: 'Subway Monthly Pass', amount: 60.00, date: '2026-05-08', category: 'transport', notes: 'City metro lines' },
  { id: '15', title: 'Utility Water and Drainage', amount: 75.00, date: '2026-05-12', category: 'utilities', notes: 'Water supply charges' },
  { id: '16', title: 'Coffee and Bakeries', amount: 32.50, date: '2026-05-18', category: 'food', notes: 'Weekly espresso breaks' },
];
