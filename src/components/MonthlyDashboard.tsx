/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
import { MonthlyStats, Expense, CurrencyCode } from '../types';
import { CATEGORIES } from '../utils/categoryConfig';
import { rateMonthlySpending, formatMonthKey, formatMoney } from '../utils/financeUtils';
import { motion } from 'motion/react';

interface MonthlyDashboardProps {
  expenses: Expense[];
  allMonthlyStats: MonthlyStats[];
  selectedMonth: string;
  onSelectMonth: (monthKey: string) => void;
  monthlyBudget: number;
  onUpdateBudget: (newBudget: number) => void;
  currency: CurrencyCode;
}

export default function MonthlyDashboard({
  expenses,
  allMonthlyStats,
  selectedMonth,
  onSelectMonth,
  monthlyBudget,
  onUpdateBudget,
  currency,
}: MonthlyDashboardProps) {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetVal, setBudgetVal] = useState(String(monthlyBudget));

  // Find Stats for current selected month
  const activeMonthStats = allMonthlyStats.find((s) => s.monthKey === selectedMonth) || {
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
    } as Record<string, number>,
  };

  // Safe cast for categories
  const categoryKeys = Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>;

  // Compute rating compared to earlier months
  const ratingDetails = rateMonthlySpending(selectedMonth, allMonthlyStats, currency);

  // Quick auxiliary computations
  const daysInMonth = (monthStr: string) => {
    if (!monthStr) return 30;
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };
  const activeDays = daysInMonth(selectedMonth);
  const dailyAverage = activeMonthStats.total / activeDays;

  // Budget calculations
  const budgetUtilization = Math.min(100, (activeMonthStats.total / monthlyBudget) * 100);
  const budgetOverage = activeMonthStats.total - monthlyBudget;

  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateBudget(parsed);
      setEditingBudget(false);
    }
  };

// SVG Chart Computations: Trend chart for the last 6 months
  const chartData = [...allMonthlyStats].reverse().slice(-6); // last 6 months chronologically
  const maxSpendVal = Math.max(...chartData.map((d) => d.total), monthlyBudget, 200);

  // Rating Badge/Color helper icon
  const getRatingIcon = (rate: string) => {
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
      {/* Month Selection Bar & Quick Configuration */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-emerald-500/[0.08] text-emerald-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-left">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-500">
              Selected Period
            </label>
            <span className="text-base font-bold text-zinc-850 dark:text-zinc-50">
              {formatMonthKey(selectedMonth) || 'No Transactions Logged'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {allMonthlyStats.length > 0 ? (
            <select
              id="month-key-selector"
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="px-3.5 py-1.5 text-sm bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none transition-all cursor-pointer font-medium"
            >
              {allMonthlyStats.map((stats) => (
                <option key={stats.monthKey} value={stats.monthKey}>
                  {formatMonthKey(stats.monthKey)} ({currency === 'LKR' ? 'Rs.' : '$'}{stats.total.toFixed(0)})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-zinc-400 font-mono italic">Awaiting records...</span>
          )}
        </div>
      </div>

      {/* Core Analytic KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KPI: Total Spending */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-[155px]">
          <div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Month Spend</span>
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/[0.08] text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight font-mono">
                {formatMoney(activeMonthStats.total, currency)}
              </span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg mt-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">
              {formatMoney(dailyAverage, currency)}/day
            </span>
            <span>avg over {activeDays} days</span>
          </div>
        </div>

        {/* KPI: Spend Limit Progress */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm flex flex-col justify-between h-[155px]">
          <div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target Budget Control</span>
              <button
                id="edit-budget-toggle"
                onClick={() => setEditingBudget(!editingBudget)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/[0.08] text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
            {editingBudget ? (
              <div className="flex items-center gap-1.5 mt-2">
                <input
                  type="number"
                  id="target-budget-input"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(e.target.value)}
                  className="w-24 px-2 py-0.5 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 outline-none"
                />
                <button
                  id="budget-save-btn"
                  onClick={handleSaveBudget}
                  className="px-2.5 py-0.5 text-xs bg-emerald-600 text-white rounded cursor-pointer hover:bg-emerald-700 font-medium"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-mono">
                  {formatMoney(monthlyBudget, currency)}
                </span>
                <span className="text-xs text-zinc-400 ml-1.5">limit</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>{budgetUtilization.toFixed(0)}% Utilized</span>
              {budgetOverage > 0 ? (
                <span className="text-rose-600 font-bold font-mono">+{formatMoney(budgetOverage, currency)} over</span>
              ) : (
                <span className="text-emerald-600 font-bold font-mono">{formatMoney(Math.abs(budgetOverage), currency)} left</span>
              )}
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization >= 100
                    ? 'bg-rose-500'
                    : budgetUtilization >= 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetUtilization}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-panels for Comparison Details & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Dynamic Advice & Rating Explanation Card */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/[0.08] text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 tracking-tight">
                  Historical Comparison Rating
                </h3>
                <p className="text-[11px] text-zinc-400">Smart analysis of your current monthly capital outflow.</p>
              </div>
            </div>

            <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/[0.4] dark:bg-zinc-900/30">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-zinc-500">Stability Index</span>
                <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {ratingDetails.score}/100 Score
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${ratingDetails.score}%` }}
                />
              </div>

              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 mt-4 italic">
                "{ratingDetails.advice}"
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800 pt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5">
                Target Period
              </span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 font-mono">
                {formatMoney(activeMonthStats.total, currency)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5">
                Past Monthly Avg
              </span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 font-mono">
                {formatMoney(
                  allMonthlyStats.filter((m) => m.monthKey < selectedMonth).reduce((sum, s) => sum + s.total, 0) /
                    Math.max(1, allMonthlyStats.filter((m) => m.monthKey < selectedMonth).length) || 0,
                  currency
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Category Breakdown Progress list */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-500/[0.08] text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 tracking-tight">
                Category Breakdown
              </h3>
              <p className="text-[11px] text-zinc-400">Total spent across individual verticals.</p>
            </div>
          </div>

          <div className="space-y-3.5 mt-2">
            {categoryKeys.map((catKey) => {
              const config = CATEGORIES[catKey];
              const categoryTotal = activeMonthStats.byCategory[catKey] || 0;
              const ratio = activeMonthStats.total > 0 ? (categoryTotal / activeMonthStats.total) * 100 : 0;

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                      {config.label}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                      {formatMoney(categoryTotal, currency)} <span className="text-zinc-400 text-[10px]">({ratio.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: config.color,
                        width: `${ratio}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {activeMonthStats.total === 0 && (
              <div className="text-center py-6 text-xs text-zinc-400 italic">No spends logged for this month.</div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Historical Outflow Trend Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/[0.08] text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 tracking-tight">
                Historical Outflow Trend
              </h3>
              <p className="text-[11px] text-zinc-400">Compare your month-over-month performance over time.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-zinc-900 dark:bg-emerald-500" />
              <span className="text-zinc-500 dark:text-zinc-400">Total Spend</span>
            </div>
            <div className="flex items-center gap-1.5 ml-2">
              <span className="w-2.5 h-0.5 bg-red-400 dark:bg-red-500 font-bold block" />
              <span className="text-zinc-500 dark:text-zinc-400">Monthly Budget</span>
            </div>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="w-full">
            {/* SVG responsive box */}
            <svg viewBox="0 0 500 220" className="w-full h-auto overflow-visible select-none">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                const y = 10 + (1 - p) * 150;
                const valueLine = p * maxSpendVal;
                return (
                  <g key={idx} className="opacity-40">
                    <line x1="40" y1={y} x2="480" y2={y} stroke="#e4e4e7" strokeWidth="1" strokeDasharray="3,3" className="dark:stroke-zinc-800" />
                    <text x="35" y={y + 3} textAnchor="end" fontSize="8" className="fill-zinc-400 font-mono">
                      {(currency === 'LKR' ? 'Rs.' : '$') + valueLine.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Dynamic Budget Limit Line (Red Dash) */}
              {(() => {
                const budgetY = 10 + (1 - monthlyBudget / maxSpendVal) * 150;
                return (
                  <line
                    x1="40"
                    y1={budgetY}
                    x2="480"
                    y2={budgetY}
                    stroke="#f87171"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    className="opacity-70"
                  />
                );
              })()}

              {/* Bars and Data points */}
              {chartData.map((data, index) => {
                const colWidth = (440) / chartData.length;
                const barWidth = Math.max(16, Math.min(32, colWidth * 0.45));
                const colCenter = 40 + index * colWidth + colWidth / 2;
                const barHeight = (data.total / maxSpendVal) * 150;
                const barY = 160 - barHeight;
                const isSelected = data.monthKey === selectedMonth;

                return (
                  <g key={data.monthKey} className="group cursor-pointer" onClick={() => onSelectMonth(data.monthKey)}>
                    {/* Tooltip background on hover */}
                    <rect
                      x={colCenter - colWidth / 2 + 2}
                      y="5"
                      width={colWidth - 4}
                      height="190"
                      fill="transparent"
                      className="hover:fill-zinc-400/[0.03] transition-all"
                    />

                    {/* Spend bar */}
                    <rect
                      x={colCenter - barWidth / 2}
                      y={barY}
                      width={barWidth}
                      height={Math.max(2, barHeight)}
                      rx="4"
                      className={`transition-all duration-300 ${
                        isSelected
                          ? 'fill-emerald-600 dark:fill-emerald-500'
                          : 'fill-zinc-300 group-hover:fill-zinc-400 dark:fill-zinc-700 dark:group-hover:fill-zinc-600'
                      }`}
                    />

                    {/* Text above bar */}
                    <text
                      x={colCenter}
                      y={barY - 6}
                      textAnchor="middle"
                      fontSize="9"
                      className={`font-semibold font-mono ${
                        isSelected
                          ? 'fill-emerald-600 dark:fill-emerald-400 font-bold'
                          : 'fill-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity'
                      }`}
                    >
                      {(currency === 'LKR' ? 'Rs.' : '$') + data.total.toFixed(0)}
                    </text>

                    {/* Simple X Axis Label */}
                    <text
                      x={colCenter}
                      y="180"
                      textAnchor="middle"
                      fontSize="9"
                      className={`font-sans ${
                        isSelected
                          ? 'fill-zinc-900 dark:fill-zinc-100 font-bold'
                          : 'fill-zinc-400'
                      }`}
                    >
                      {formatMonthKey(data.monthKey).split(' ')[0]}
                    </text>

                    <text
                      x={colCenter}
                      y="192"
                      textAnchor="middle"
                      fontSize="7"
                      className="fill-zinc-400 font-mono"
                    >
                      {data.monthKey.split('-')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="h-40 flex flex-col justify-center items-center text-zinc-400 text-xs italic bg-zinc-50 dark:bg-zinc-950/20 rounded-xl">
            <span>Graph represents month-over-month comparisons.</span>
            <span className="text-[10px] text-zinc-500">Log at least one daily spend to activate.</span>
          </div>
        )}
      </div>
    </div>
  );
}

