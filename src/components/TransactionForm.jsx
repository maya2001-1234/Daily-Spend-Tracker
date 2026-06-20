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
  AlignLeft,
} from 'lucide-react';

import { CATEGORY_LIST } from '../utils/categoryConfig';
import { motion } from 'motion/react';

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

export default function TransactionForm({ onAddExpense, currency }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [category, setCategory] = useState('food');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successAnimation, setSuccessAnimation] = useState(false);

  const handleSubmit = (e) => {
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

    setTitle('');
    setAmount('');
    setNotes('');

    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 1200);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-6 shadow-sm">

      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
          <Plus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Log Spend</h2>
          <p className="text-xs text-zinc-500">
            Record a daily expense
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {errorMsg && (
          <div className="p-3 text-xs text-rose-600 bg-rose-50 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Title */}
        <input
          type="text"
          placeholder="Expense name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-4">

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />

        </div>

        {/* Category */}
        <div className="grid grid-cols-4 gap-2">
          {CATEGORY_LIST.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isSelected = category === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-2 rounded-lg border ${
                  isSelected ? 'bg-zinc-100 font-bold' : ''
                }`}
                style={{ borderColor: isSelected ? cat.color : undefined }}
              >
                <Icon className="w-4 h-4 mx-auto" />
                <div className="text-[10px]">{cat.label}</div>
              </button>
            );
          })}
        </div>

        {/* Notes */}
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className={`w-full p-2 rounded-lg text-white ${
            successAnimation ? 'bg-green-600' : 'bg-black'
          }`}
        >
          {successAnimation ? 'Saved!' : 'Log Transaction'}
        </motion.button>

      </form>
    </div>
  );
}