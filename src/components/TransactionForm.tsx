/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Utensils,
  Home,
  Tv,
  ShoppingBag,
  Car,
  HeartPulse,
  GraduationCap,
  Coins,
  Plus,
  Calendar,
  DollarSign,
  AlignLeft,
} from 'lucide-react';
import { ExpenseCategory, CurrencyCode } from '../types';
import { CATEGORY_LIST } from '../utils/categoryConfig';
import { motion } from 'motion/react';

interface TransactionFormProps {
  onAddExpense: (expense: {
    title: string;
    amount: number;
    date: string;
    category: ExpenseCategory;
    notes: string;
  }) => void;
  currency: CurrencyCode;
}

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

export default function TransactionForm({ onAddExpense, currency }: TransactionFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please specify what you spent this money on.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than 0.');
      return;
    }

    if (!date) {
      setErrorMsg('Please choose a transaction date.');
      return;
    }

    setErrorMsg('');
    onAddExpense({
      title: title.trim(),
      amount: parsedAmount,
      date,
      category,
      notes: notes.trim(),
    });
    
    // Reset simple values
    setTitle('');
    setAmount('');
    setNotes('');

    // Highlight visual success feedback
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 1200);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 font-sans tracking-tight">
            Log Spend
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Record a daily expense to update the monthly comparisons.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950/40 rounded-lg">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Expense Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="spend-title"
              placeholder="e.g. Weekly Groceries, Gas bill, Movie night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Amount ({currency === 'LKR' ? 'Rs.' : '$'}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-black text-zinc-400 dark:text-zinc-500 font-mono">
                {currency === 'LKR' ? 'Rs.' : '$'}
              </span>
              <input
                type="number"
                id="spend-amount"
                step="0.01"
                min="0.01"
                placeholder={currency === 'LKR' ? '1500' : '42.50'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200 ${
                  currency === 'LKR' ? 'pl-11' : 'pl-9'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
              Date *
            </label>
            <div className="relative font-mono">
              <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                id="spend-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
            Select Category *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORY_LIST.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.id];
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => setCategory(cat.id)}
                  style={{ borderColor: isSelected ? cat.color : undefined }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-50 dark:bg-zinc-800/80 font-semibold shadow-sm scale-[1.02]'
                      : 'bg-transparent border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 hover:border-zinc-200 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <div
                    className="p-1.5 rounded-lg mb-1"
                    style={{
                      backgroundColor: isSelected ? `${cat.color}15` : 'transparent',
                      color: cat.color,
                    }}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-zinc-700 dark:text-zinc-300">
                    {cat.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Notes (Optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
              <AlignLeft className="w-4 h-4" />
            </span>
            <textarea
              id="spend-notes"
              rows={2}
              placeholder="Store name, special description..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200 resize-none"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          id="btn-submit-spend"
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors ${
            successAnimation
              ? 'bg-emerald-600 dark:bg-emerald-700'
              : 'bg-zinc-900 hover:bg-zinc-855 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
          }`}
        >
          {successAnimation ? (
            <span className="flex items-center gap-1 text-sm font-semibold">Saved Successfully!</span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" /> Log Transaction
            </span>
          )}
        </motion.button>
      </form>
    </div>
  );
}
