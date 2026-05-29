/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Award,
  CheckCircle2,
  Calendar,
  DollarSign,
  Activity,
  Sliders,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { MonthlyStats, Expense, CurrencyCode } from '../types';
import { CATEGORIES } from '../utils/categoryConfig';
import { rateMonthlySpending, formatMonthKey, formatMoney } from '../utils/financeUtils';
import { motion } from 'motion/react';

interface MonthlyDashboardProps {
  expenses: Expense[];
  allMonthlyStats: MonthlyStats[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  monthlyBudget: number;
  onUpdateBudget: (newBudget: number) => void;
  currency: CurrencyCode;
}

export default function MonthlyDashboard({
  expenses,
  allMonthlyStats,
  selectedMonth,
  onSelectMonth,
  monthlyBudget,
  onUpdateBudget,
  currency,
}: MonthlyDashboardProps) {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState(String(monthlyBudget));

  // Find Stats for current selected month
  const activeMonthStats = allMonthlyStats.find((s) => s.monthKey === selectedMonth) || {
    monthKey: selectedMonth,
    total: 0,
    count: 0,
    byCategory: {
      food: 0,
      utilities: 0,
      entertainment: 0,
      shopping: 0,
      transport: 0,
      health: 0,
      education: 0,
      other: 0,
    } as Record<string, number>,
  };

  // Safe cast for categories
  const categoryKeys = Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>;

  // Compute rating compared to earlier months
  const ratingDetails = rateMonthlySpending(selectedMonth, allMonthlyStats, currency);

  // Quick auxiliary computations
  const daysInMonth = (monthStr: string) => {
    if (!monthStr) return 30;
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };
  const activeDays = daysInMonth(selectedMonth);
  const dailyAverage = activeMonthStats.total / activeDays;

  // Budget calculations
  const budgetUtilization = Math.min(100, (activeMonthStats.total / monthlyBudget) * 100);
  const budgetOverage = activeMonthStats.total - monthlyBudget;

  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(parsed);
      setEditingBudget(false);
    }
  };

  
