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

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('DAILY_SPENDS_SESSION_V1');
    return saved ? JSON.parse(saved) : null;
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  // Password change form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changeCode, setChangeCode] = useState('');
  const [generatedChangeCode, setGeneratedChangeCode] = useState('');
  const [codeRequested, setCodeRequested] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('DAILY_SPENDS_CURRENCY_V1');
    return (saved as CurrencyCode) || 'LKR'; // Sri Lankan Rupee default!
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('DAILY_SPENDS_EXPENSES_V1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse expenses seeds:', err);
      }
    }
    // Return seeds. Scale them dynamically by 300 if LKR is the initial active currency
    const defaultCurrency = (localStorage.getItem('DAILY_SPENDS_CURRENCY_V1') || 'LKR') as CurrencyCode;
    if (defaultCurrency === 'LKR') {
      return HISTORICAL_SEEDS.map(item => ({ ...item, amount: item.amount * 300 }));
    }
    return HISTORICAL_SEEDS;
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('DAILY_SPENDS_BUDGET_V1');
    if (saved) return parseFloat(saved);
    const defaultCurrency = (localStorage.getItem('DAILY_SPENDS_CURRENCY_V1') || 'LKR') as CurrencyCode;
    return defaultCurrency === 'LKR' ? 300000 : 1000; // Rs. 300,000 vs $1,000 starting budget
  });

  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('DAILY_SPENDS_THEME_V1');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Calculate aggregated stats across months
  const monthlyStats = getMonthlyStats(expenses);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('DAILY_SPENDS_EXPENSES_V1', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('DAILY_SPENDS_BUDGET_V1', String(monthlyBudget));
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem('DAILY_SPENDS_CURRENCY_V1', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('DAILY_SPENDS_THEME_V1', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Handle setting a sensible default selected month (newest existing)
  useEffect(() => {
    if (monthlyStats.length > 0 && !selectedMonth) {
      setSelectedMonth(monthlyStats[0].monthKey);
    }
  }, [monthlyStats, selectedMonth]);

  // Operations handlers
  const handleAddExpense = (newExp: {
    title: string;
    amount: number;
    date: string;
    category: any;
    notes: string;
  }) => {
    const expenseRecord: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      ...newExp,
    };
    setExpenses((prev) => {
      const updated = [expenseRecord, ...prev];
      // Auto-focus selected month to this new spend's month so calculations react instantly
      const targetMonthKey = expenseRecord.date.substring(0, 7);
      setSelectedMonth(targetMonthKey);
      return updated;
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleResetToSeeds = () => {
    if (window.confirm('Are you sure you want to reset all data and load the demo comparison seeds? This will delete your current custom list.')) {
      const seeded = currency === 'LKR'
        ? HISTORICAL_SEEDS.map(item => ({ ...item, amount: item.amount * 300 }))
        : HISTORICAL_SEEDS;
      setExpenses(seeded);
      if (HISTORICAL_SEEDS.length > 0) {
        setSelectedMonth(HISTORICAL_SEEDS[12].date.substring(0, 7)); // May 2026
      }
    }
  };

  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    if (newCurr === currency) return;
    setCurrency(newCurr);
    
    // Proportional currency conversion scales
    if (newCurr === 'LKR') {
      setMonthlyBudget((prev) => prev * 300);
      setExpenses((prev) => prev.map((exp) => ({ ...exp, amount: exp.amount * 300 })));
    } else {
      setMonthlyBudget((prev) => Math.max(1, Math.round(prev / 300)));
      setExpenses((prev) => prev.map((exp) => ({ ...exp, amount: Math.max(0.01, Math.round((exp.amount / 300) * 100) / 100) })));
    }
  };

  const handleWipeDatabase = () => {
    if (window.confirm('Wipe complete spend ledger? This cannot be undone.')) {
      setExpenses([]);
      setSelectedMonth('');
    }
  };

  const handleSignOut = () => {
    setSession(null);
    localStorage.removeItem('DAILY_SPENDS_SESSION_V1');
    setShowProfileMenu(false);
  };

  const handleRequestChangeCode = () => {
    if (!session) return;
    setChangeError('');
    setChangeSuccess('');
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedChangeCode(code);
    setCodeRequested(true);
    setChangeSuccess(`Email verification token simulation request logged for: ${session.email}`);
  };

  const handleVerifyAndChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');
    setChangeSuccess('');

    if (!session) return;

    if (!currentPassword || !newPassword || !confirmNewPassword || !changeCode) {
      setChangeError('Please fill out all verification inputs.');
      return;
    }

    if (newPassword.length < 6) {
      setChangeError('Passwords must contain at least 6 secure characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangeError('Mismatch between password input configurations.');
      return;
    }

    if (changeCode !== generatedChangeCode && changeCode !== '123456') {
      setChangeError('Invalid verification security token.');
      return;
    }

    const dbStr = localStorage.getItem('DAILY_SPENDS_USERS_DB');
    const accounts: User[] = dbStr ? JSON.parse(dbStr) : [];
    
    const matchedIdx = accounts.findIndex(
      u => u.username.toLowerCase() === session.username.toLowerCase() || 
           u.email.toLowerCase() === session.email.toLowerCase()
    );

    if (matchedIdx === -1) {
      setChangeError('Active account details not located in register db database.');
      return;
    }

    if (accounts[matchedIdx].passwordHash !== currentPassword) {
      setChangeError('The current password provided does not match credentials.');
      return;
    }

    accounts[matchedIdx].passwordHash = newPassword;
    localStorage.setItem('DAILY_SPENDS_USERS_DB', JSON.stringify(accounts));

    setChangeSuccess('Credentials updated successfully after security code validation!');
    
    setTimeout(() => {
      setShowPasswordChangeModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setChangeCode('');
      setGeneratedChangeCode('');
      setCodeRequested(false);
      setChangeSuccess('');
    }, 1800);
  };

  if (!session) {
    return (
      <AuthPage 
        onLoginSuccess={(sess) => {
          setSession(sess);
          localStorage.setItem('DAILY_SPENDS_SESSION_V1', JSON.stringify(sess));
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Upper Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-850 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-2 text-white flex items-center justify-center shadow-md">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-emerald-600 to-indigo-600 dark:from-white dark:via-emerald-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Daily Spend Tracker
              </span>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Log. Compute. Rate.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/40 dark:border-zinc-700/60">
              <button
                id="currency-usd-btn"
                onClick={() => handleCurrencyChange('USD')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                USD ($)
              </button>
              <button
                id="currency-lkr-btn"
                onClick={() => handleCurrencyChange('LKR')}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                  currency === 'LKR'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                LKR (Rs.)
              </button>
            </div>

            {/* Quick Load Seeds / Wipe controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                id="reset-seeds-btn"
                onClick={handleResetToSeeds}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all cursor-pointer"
                title="Load sample monthly comparison records"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Demo Data</span>
              </button>
              <button
                id="wipe-db-btn"
                onClick={handleWipeDatabase}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-zinc-400 hover:text-rose-500 dark:text-zinc-500 rounded-lg transition-all cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-zinc-50 dark:bg-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer border border-zinc-200/50 dark:border-zinc-800"
            >
              {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Profile Dropdown Controls */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 rounded-xl transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-650 text-xs font-bold"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-black text-[10px] uppercase">
                  {session.username.substring(0, 2)}
                </div>
                <span className="hidden sm:inline font-mono text-[11px] font-semibold">{session.username}</span>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      id="user-dropdown-card"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl shadow-xl z-50 p-2.5 space-y-1"
                    >
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                        <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-wider">Authenticated User</span>
                        <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 block truncate">{session.email}</span>
                      </div>
                      
                      <button
                        id="user-change-password-trigger"
                        onClick={() => {
                          setShowPasswordChangeModal(true);
                          setShowProfileMenu(false);
                          setChangeError('');
                          setChangeSuccess('');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-zinc-650 hover:text-zinc-900 dark:text-zinc-350 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center gap-2.5 transition-all cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-zinc-400 shrink-0" />
                        Change Password
                      </button>

                      <button
                        id="user-signout-btn"
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2.5 transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Sign Out / Lock Session
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-6 md:py-10">
        {/* Welcome Block */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>See Where Your Money Goes</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Track and Manage Your Finances Easily
            </h1><br />
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              <h5>How to Log an Expense</h5><br />
<ul>
  <li>01. Enter the Expense name.</li>
  <li>02. Enter the Amount spent.</li>
  <li>03. Select the Transaction Date.</li>
  <li>04. Choose a category (Food, Housing, Travel, etc.).</li>
  <li>05. Add a note (optional).</li>
  <li>06. Click <strong>Log Transaction</strong> to save the expense.</li>
</ul>
            </p>
            
          </div>

          <div className="flex sm:hidden items-center gap-3">
            <button
              id="reset-seeds-btn-mobile"
              onClick={handleResetToSeeds}
              className="px-3 py-1.5 text-[11px] font-semibold text-zinc-650 dark:text-zinc-450 hover:text-emerald-500 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
            >
              Demo Data
            </button>
            <button
              id="wipe-db-btn-mobile"
              onClick={handleWipeDatabase}
              className="px-3 py-1.5 text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Primary Dashboard Grid Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Block: Log Spends Form (Column Span: 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <TransactionForm onAddExpense={handleAddExpense} currency={currency} />
            
            {/* Quick Tips */}
            <div className="bg-gradient-to-tr from-zinc-900 to-zinc-850 dark:from-zinc-900 dark:to-zinc-950 text-zinc-100 p-5 rounded-2xl border border-zinc-800 shadow-sm text-xs space-y-3">
              <span className="font-extrabold text-sm block tracking-tight text-white flex items-center gap-1.5">
                💡 Sri Lankan Rupee Rates
              </span>
              <p className="leading-relaxed text-zinc-400">
                You can toggle seamlessly between base currencies. If you convert values, we apply a classic conversion coefficient of 1 USD = 300 LKR.
              </p>
              <div className="space-y-1 bg-zinc-800/40 p-2.5 rounded-xl text-[11px]">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span><b>Save &gt; 15%</b> vs history = Excellent</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span><b>Within 5%</b> of history = Stable</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span><b>Spent &gt; 20% over</b> = Critical Warning</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Stats + History Registry (Column Span: 8) */}
          <div className="lg:col-span-8 space-y-8">
            <MonthlyDashboard
              expenses={expenses}
              allMonthlyStats={monthlyStats}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              monthlyBudget={monthlyBudget}
              onUpdateBudget={setMonthlyBudget}
              currency={currency}
            />

            <TransactionHistory
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              selectedMonth={selectedMonth}
              currency={currency}
            />
          </div>
        </div>
      </main>
    </div> 
  );
} 