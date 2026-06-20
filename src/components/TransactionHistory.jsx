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

import { CATEGORIES, CATEGORY_LIST } from '../utils/categoryConfig';
import { motion, AnimatePresence } from 'motion/react';
import { formatMoney } from '../utils/financeUtils';

const CATEGORY_ICONS = {
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
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('current');

  const CATEGORY_ITEMS = {
    food: 'Food & Dining',
    utilities: 'Rent & Utilities',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    transport: 'Transport',
    health: 'Health',
    education: 'Education',
    other: 'Other/Misc',
  };

  const filteredExpenses = expenses.filter((exp) => {
    if (scopeFilter === 'current') {
      const expMonth = exp.date.substring(0, 7);
      if (expMonth !== selectedMonth) return false;
    }

    if (categoryFilter !== 'all' && exp.category !== categoryFilter) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = exp.title.toLowerCase().includes(q);
      const matchNotes = exp.notes?.toLowerCase().includes(q);
      return matchTitle || matchNotes;
    }

    return true;
  });

  const filteredSpentSum = filteredExpenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;

    const headers = 'ID,Date,Title,Category,Amount,Notes\n';

    const rows = filteredExpenses
      .map((e) => {
        const titleSafe = e.title.replace(/"/g, '""');
        const notesSafe = (e.notes || '').replace(/"/g, '""');

        return `"${e.id}","${e.date}","${titleSafe}","${
          CATEGORY_ITEMS[e.category] || e.category
        }",${e.amount},"${notesSafe}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute(
      'download',
      `DailySpends_Export_${new Date().toISOString().substring(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6 shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-bold text-lg">Transactions</h2>
          <p className="text-xs text-zinc-500">
            Manage your expense history
          </p>
        </div>

        {filteredExpenses.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3 mb-4">

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-lg text-xs"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border p-2 rounded-lg text-xs"
        >
          <option value="all">All Categories</option>
          {CATEGORY_LIST.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <div className="flex gap-1">
          <button
            onClick={() => setScopeFilter('current')}
            className={`flex-1 p-1 text-xs border rounded ${
              scopeFilter === 'current' ? 'bg-black text-white' : ''
            }`}
          >
            Month
          </button>

          <button
            onClick={() => setScopeFilter('all')}
            className={`flex-1 p-1 text-xs border rounded ${
              scopeFilter === 'all' ? 'bg-black text-white' : ''
            }`}
          >
            All
          </button>
        </div>

      </div>

      {/* Stats */}
      <div className="text-xs mb-4 text-zinc-500 flex justify-between">
        <span>Matches: {filteredExpenses.length}</span>
        <span>Total: {formatMoney(filteredSpentSum, currency)}</span>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[450px] overflow-y-auto">

        <AnimatePresence>
          {filteredExpenses.map((expense) => {
            const config = CATEGORIES[expense.category];
            const Icon = CATEGORY_ICONS[expense.category] || Tag;

            return (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex justify-between p-3 border rounded-lg"
              >

                <div className="flex gap-3">
                  <Icon className="w-5 h-5" />

                  <div>
                    <div className="font-medium text-sm">
                      {expense.title}
                    </div>

                    <div className="text-[10px] text-zinc-500">
                      {expense.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-rose-500 text-sm">
                    -{formatMoney(expense.amount, currency)}
                  </span>

                  <button onClick={() => onDeleteExpense(expense.id)}>
                    <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-500" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </AnimatePresence>

      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center text-xs text-zinc-400 mt-6">
          No transactions found
        </div>
      )}

    </div>
  );
}