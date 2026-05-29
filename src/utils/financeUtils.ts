/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Expense, MonthlyStats, ComparisonRating, ExpenseCategory, CurrencyCode } from '../types';

export const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; name: string; rateVsUSD: number }> = {
  LKR: { symbol: 'Rs.', name: 'Sri Lankan Rupee', rateVsUSD: 300 },
  USD: { symbol: '$', name: 'US Dollar', rateVsUSD: 1 },
};

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_MAP[currency];
  return `${config.symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Groups expenses by year and month ("YYYY-MM")
 */
export function getMonthlyStats(expenses: Expense[]): MonthlyStats[] {
  const groups: Record<string, { total: number; count: number; byCategory: Record<ExpenseCategory, number> }> = {};

  expenses.forEach((expense) => {
    // Extract YYYY-MM from YYYY-MM-DD
    const monthKey = expense.date.substring(0, 7);
    if (!groups[monthKey]) {
      groups[monthKey] = {
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
        },
      };
    }

    groups[monthKey].total += expense.amount;
    groups[monthKey].count += 1;
    groups[monthKey].byCategory[expense.category] = (groups[monthKey].byCategory[expense.category] || 0) + expense.amount;
  });

  return Object.entries(groups)
    .map(([monthKey, data]) => ({
      monthKey,
      total: data.total,
      count: data.count,
      byCategory: data.byCategory,
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey)); // Newest first
}

/**
 * Format string month Key (e.g., "2026-05" -> "May 2026")
 */
export function formatMonthKey(monthKey: string): string {
  if (!monthKey || monthKey.length < 7) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Rates the target month's spending compared to all preceding months
 */
export function rateMonthlySpending(
  targetMonthKey: string,
  allMonthlyStats: MonthlyStats[],
  currency: CurrencyCode = 'LKR'
): ComparisonRating {
  const targetStats = allMonthlyStats.find(m => m.monthKey === targetMonthKey);
  const targetTotal = targetStats ? targetStats.total : 0;

  // Find all HISTORIC (earlier) months relative to targetMonthKey
  const earlierStats = allMonthlyStats.filter(m => m.monthKey < targetMonthKey);

  // If there are no earlier months to compare against, return a baseline rating
  if (earlierStats.length === 0) {
    return {
      rating: 'good',
      title: 'Baseline Month Locked',
      score: 80,
      color: 'text-emerald-500 border-emerald-500/20',
      bgClass: 'bg-emerald-500/[0.04]',
      percentageDiff: 0,
      advice: 'This is either your earliest recorded month or starting period. Log data in other months to generate dynamic financial flow ratings!',
    };
  }

  // Calculate Average of early months
  const sumEarlier = earlierStats.reduce((sum, stats) => sum + stats.total, 0);
  const avgEarlier = sumEarlier / earlierStats.length;

  if (avgEarlier === 0) {
    return {
      rating: 'fair',
      title: 'Awaiting Active Spend History',
      score: 70,
      color: 'text-blue-500 border-blue-500/20',
      bgClass: 'bg-blue-500/[0.04]',
      percentageDiff: 0,
      advice: 'Historical months represent zero expenditures. Add past spends to get month-over-month performance ratings.',
    };
  }

  // Percentage Difference: how much MORE/LESS is target total compared to average of earlier months
  const percentageDiff = ((targetTotal - avgEarlier) / avgEarlier) * 100;

  // Design modular rating triggers
  if (percentageDiff <= -15) {
    // Saved massive money (> 15% lower than early months avg)
    // Clamp score towards 100
    const score = Math.min(100, Math.round(85 + Math.abs(percentageDiff)));
    return {
      rating: 'excellent',
      title: 'Masterful Saver',
      score,
      color: 'text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
      bgClass: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02]',
      percentageDiff,
      advice: `Fantastic progress! Your spending this month is ${Math.abs(Math.round(percentageDiff))}% lower than your typical historical average of ${formatMoney(avgEarlier, currency)}. You are building strong financial muscle!`,
    };
  } else if (percentageDiff <= -5) {
    // Saved a solid amount (5% to 15% lower)
    const score = Math.round(75 + Math.abs(percentageDiff));
    return {
      rating: 'good',
      title: 'Efficient Optimizer',
      score,
      color: 'text-teal-500 dark:text-teal-400 border-teal-500/20',
      bgClass: 'bg-teal-500/[0.04] dark:bg-teal-500/[0.02]',
      percentageDiff,
      advice: `Congratulation! You are pacing ${Math.abs(Math.round(percentageDiff))}% below your historical averages (${formatMoney(avgEarlier, currency)}). Keep managing your discretionary spending!`,
    };
  } else if (percentageDiff <= 5) {
    // Flat spending (-5% to +5%)
    const score = Math.round(60 - percentageDiff);
    return {
      rating: 'fair',
      title: 'Stable Balance',
      score,
      color: 'text-blue-500 dark:text-blue-400 border-blue-500/20',
      bgClass: 'bg-blue-500/[0.04] dark:bg-blue-500/[0.02]',
      percentageDiff,
      advice: `Your spend flow is in perfect alignment with historical patterns (${formatMoney(avgEarlier, currency)}). You are tracking standard expenditures without significant variance.`,
    };
  } else if (percentageDiff <= 20) {
    // Slightly elevated (5% to 20% higher)
    const score = Math.max(30, Math.round(50 - percentageDiff));
    return {
      rating: 'warning',
      title: 'Elevated Outflow',
      score,
      color: 'text-amber-500 dark:text-amber-400 border-amber-500/20',
      bgClass: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.02]',
      percentageDiff,
      advice: `Caution: Spending is ${Math.round(percentageDiff)}% above your historical average (${formatMoney(avgEarlier, currency)}). Investigate your shopping or travel bills to locate the leak.`,
    };
  } else {
    // Super high spending (> 20% higher)
    const score = Math.max(10, Math.round(30 - (percentageDiff - 20) / 2));
    return {
      rating: 'critical',
      title: 'Overspending Detected',
      score,
      color: 'text-rose-500 dark:text-rose-400 border-rose-500/20',
      bgClass: 'bg-rose-500/[0.04] dark:bg-rose-500/[0.02]',
      percentageDiff,
      advice: `Alert: Spending has shot up by ${Math.round(percentageDiff)}% compared to your historical average which sits at ${formatMoney(avgEarlier, currency)}. It is highly advised to cut non-essential items immediately!`,
    };
  }
}
