/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Trash2,
  FileSpreadsheet,
  Tag,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { Expense, ExpenseCategory, CurrencyCode } from '../types';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categoryConfig';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoney } from '../utils/financeUtils';

interface TransactionHistoryProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  selectedMonth: string;
  currency: CurrencyCode;
}

// Map Lucide icons explicitly
import {
  Utensils,
  Home,
  Tv,
  ShoppingBag,
  Car,
  HeartPulse,
  GraduationCap,
  Coins,
} from 'lucide-react';

const CATEGORY_ICONS: Record<ExpenseCategory, React.ComponentType<{ className?: string }>> = {
  food: Utensils,
  utilities: Home,
  entertainment: Tv,
  shopping: ShoppingBag,
  transport: Car,
  health: HeartPulse,
  education: GraduationCap,
  other: Coins,
};

export default function TransactionHistory({
  expenses,
  onDeleteExpense,
  selectedMonth,
  currency,
}: TransactionHistoryProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'current' | 'all'>('current');

  // Filter core logic
  const filteredExpenses = expenses.filter((exp) => {
    // 1. Filter by active selected month key ("YYYY-MM")
    if (scopeFilter === 'current') {
      const expMonth = exp.date.substring(0, 7);
      if (expMonth !== selectedMonth) return false;
    }

    // 2. Filter by Category
    if (categoryFilter !== 'all' && exp.category !== categoryFilter) {
      return false;
    }

    // 3. Search query match
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = exp.title.toLowerCase().includes(q);
      const matchNotes = exp.notes?.toLowerCase().includes(q) || false;
      return matchTitle || matchNotes;
    }

    return true;
  });

  // Calculate matching items statistics
  const filteredSpentSum = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    // Generate CSV contents
    const headers = 'ID,Date,Title,Category,Amount,Notes\n';
    const rows = filteredExpenses
      .map((e) => {
        const titleSafe = e.title.replace(/"/g, '""');
        const notesSafe = (e.notes || '').replace(/"/g, '""');
        return `"${e.id}","${e.date}","${titleSafe}","${CATEGORY_ITEMS[e.category] || e.category}",${e.amount},"${notesSafe}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DailySpends_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CATEGORY_ITEMS: Record<string, string> = {
    food: 'Food & Dining',
    utilities: 'Rent & Utilities',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    transport: 'Transport',
    health: 'Health',
    education: 'Education',
    other: 'Other/Misc',
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 font-sans tracking-tight">
            Transactions Registry
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Review, locate, filter, or delete logged daily logs.
          </p>
        </div>

        {/* CSV Export Button */}
        {filteredExpenses.length > 0 && (
          <button
            id="csv-export-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Interactive Filter Panel */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Term Input */}
          <div className="relative col-span-1">
            <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="search-exp-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="relative">
            <select
              id="filter-category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none transition-all cursor-pointer text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Categories</option>
              {CATEGORY_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Range Scope Filter (Current Month / All History) */}
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              id="filter-scope-current"
              onClick={() => setScopeFilter('current')}
              className={`flex-1 py-1 text-center text-xs font-medium rounded-md transition-all cursor-pointer ${
                scopeFilter === 'current'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Selected Month
            </button>
            <button
              id="filter-scope-all"
              onClick={() => setScopeFilter('all')}
              className={`flex-1 py-1 text-center text-xs font-medium rounded-md transition-all cursor-pointer ${
                scopeFilter === 'all'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              All History
            </button>
          </div>
        </div>

        {/* Dynamic Filter Counters */}
        <div className="bg-zinc-50/50 dark:bg-zinc-800/20 px-4 py-2 rounded-xl flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            Showing <b>{filteredExpenses.length}</b> matches
          </span>
          <span>
            Total Spent in subset:{' '}
            <b className="text-zinc-800 dark:text-zinc-200 font-mono">{formatMoney(filteredSpentSum, currency)}</b>
          </span>
        </div>
      </div>

      {/* Spends Feed */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {filteredExpenses.map((expense) => {
            const config = CATEGORIES[expense.category];
            const IconComponent = CATEGORY_ICONS[expense.category] || Tag;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                key={expense.id}
                id={`exp-card-${expense.id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-zinc-50/30 hover:bg-zinc-50/80 dark:bg-zinc-900/40 dark:hover:bg-zinc-850/60 border border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-750 rounded-xl transition-all gap-3"
              >
                {/* Information block */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div
                    className="p-2.5 rounded-lg shrink-0"
                    style={{
                      backgroundColor: `${config.color}15`,
                      color: config.color,
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-150 truncate max-w-[200px]">
                        {expense.title}
                      </span>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-md font-medium capitalize"
                        style={{
                          backgroundColor: `${config.color}10`,
                          color: config.color,
                        }}
                      >
                        {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {expense.date}
                      </span>
                      {expense.notes && (
                        <span className="flex items-center gap-1 truncate max-w-[190px]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          {expense.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Interactions Row */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-none border-zinc-100 dark:border-zinc-800 pt-2.5 md:pt-0">
                  <div className="text-right flex-1 md:flex-initial">
                    <span className="block text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                      -{formatMoney(expense.amount, currency)}
                    </span>
                  </div>

                  <button
                    id={`delete-btn-${expense.id}`}
                    onClick={() => onDeleteExpense(expense.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-100 md:opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400 italic bg-zinc-50/10">
            <Layers className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
            <span className="text-xs">No matching expenditures found.</span>
            <span className="text-[10px] text-zinc-500 mt-1">Try relaxing filters or log fresh spends.</span>
          </div>
        )}
      </div>
    </div>
  );
}
