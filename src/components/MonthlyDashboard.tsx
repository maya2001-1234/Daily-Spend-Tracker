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
