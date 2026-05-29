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
