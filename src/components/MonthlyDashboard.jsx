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

import { CATEGORIES } from '../utils/categoryConfig';
import { rateMonthlySpending, formatMonthKey, formatMoney } from '../utils/financeUtils';
import { motion } from 'motion/react';

export default function MonthlyDashboard({
  expenses,
  allMonthlyStats,
  selectedMonth,
  onSelectMonth,
  monthlyBudget,
  onUpdateBudget,
  currency,
}) {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState(String(monthlyBudget));

  const activeMonthStats =
    allMonthlyStats.find((s) => s.monthKey === selectedMonth) || {
      monthKey: selectedMonth,
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

  const categoryKeys = Object.keys(CATEGORIES);

  const ratingDetails = rateMonthlySpending(selectedMonth, allMonthlyStats, currency);

  const daysInMonth = (monthStr) => {
    if (!monthStr) return 30;
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const activeDays = daysInMonth(selectedMonth);
  const dailyAverage = activeMonthStats.total / activeDays;

  const budgetUtilization = Math.min(
    100,
    (activeMonthStats.total / monthlyBudget) * 100
  );

  const budgetOverage = activeMonthStats.total - monthlyBudget;

  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(parsed);
      setEditingBudget(false);
    }
  };

  const chartData = [...allMonthlyStats].reverse().slice(-6);
  const maxSpendVal = Math.max(
    ...chartData.map((d) => d.total),
    monthlyBudget,
    200
  );

  const getRatingIcon = (rate) => {
    switch (rate) {
      case 'excellent':
        return <Award className="w-5 h-5 text-emerald-500" />;
      case 'good':
        return <CheckCircle2 className="w-5 h-5 text-teal-400" />;
      case 'fair':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <TrendingUp className="w-5 h-5 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Month Selector */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" />
          <div>
            <div className="text-xs uppercase text-zinc-400 font-bold">
              Selected Period
            </div>
            <div className="font-bold">
              {formatMonthKey(selectedMonth)}
            </div>
          </div>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => onSelectMonth(e.target.value)}
          className="px-3 py-1 border rounded-lg"
        >
          {allMonthlyStats.map((s) => (
            <option key={s.monthKey} value={s.monthKey}>
              {formatMonthKey(s.monthKey)} - {currency} {s.total.toFixed(0)}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Total Spend */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border">
          <div className="flex justify-between">
            <span className="text-xs text-zinc-500">Total Spend</span>
            <DollarSign />
          </div>

          <div className="text-3xl font-bold mt-3">
            {formatMoney(activeMonthStats.total, currency)}
          </div>

          <div className="text-xs mt-2 text-zinc-500">
            {formatMoney(dailyAverage, currency)} / day
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border">
          <div className="flex justify-between">
            <span className="text-xs text-zinc-500">Budget</span>
            <Sliders onClick={() => setEditingBudget(!editingBudget)} />
          </div>

          {editingBudget ? (
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="border px-2 py-1 w-24"
              />
              <button onClick={handleSaveBudget}>Save</button>
            </div>
          ) : (
            <div className="text-2xl font-bold mt-3">
              {formatMoney(monthlyBudget, currency)}
            </div>
          )}

          <div className="text-xs mt-2">
            {budgetUtilization.toFixed(0)}% used
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border">
          <div className="flex justify-between">
            <span className="text-xs text-zinc-500">Performance</span>
            {getRatingIcon(ratingDetails.rating)}
          </div>

          <div className="text-xl font-bold mt-3">
            {ratingDetails.title}
          </div>

          <div className="text-xs mt-2 text-zinc-500">
            {ratingDetails.percentageDiff.toFixed(0)}% change
          </div>
        </div>

      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4" />
          <h3 className="font-bold">Category Breakdown</h3>
        </div>

        {categoryKeys.map((cat) => {
          const total = activeMonthStats.byCategory?.[cat] || 0;
          const ratio =
            activeMonthStats.total > 0
              ? (total / activeMonthStats.total) * 100
              : 0;

          return (
            <div key={cat} className="mb-3">
              <div className="flex justify-between text-xs">
                <span>{cat}</span>
                <span>{formatMoney(total, currency)}</span>
              </div>

              <div className="h-2 bg-zinc-100 rounded">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}