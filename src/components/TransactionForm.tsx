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
