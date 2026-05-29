/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExpenseCategory, CategoryConfig } from '../types';

export const CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  food: {
    id: 'food',
    label: 'Food & Dining',
    color: '#10b981', // Emerald
    bgLight: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    icon: 'Utensils',
  },
  utilities: {
    id: 'utilities',
    label: 'Rent & Utilities',
    color: '#3b82f6', // Blue
    bgLight: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    icon: 'Home',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    color: '#8b5cf6', // Violet
    bgLight: 'bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
    icon: 'Tv',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping & Apparel',
    color: '#ec4899', // Pink
    bgLight: 'bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
    icon: 'ShoppingBag',
  },
  transport: {
    id: 'transport',
    label: 'Transport & Travel',
    color: '#eab308', // Yellow/Amber
    bgLight: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    icon: 'Car',
  },
  health: {
    id: 'health',
    label: 'Health & Wellness',
    color: '#f43f5e', // Rose
    bgLight: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
    icon: 'HeartPulse',
  },
  education: {
    id: 'education',
    label: 'Education',
    color: '#06b6d4', // Cyan
    bgLight: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400',
    icon: 'GraduationCap',
  },
  other: {
    id: 'other',
    label: 'Other/Misc',
    color: '#64748b', // Slate
    bgLight: 'bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400',
    icon: 'Coins',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
