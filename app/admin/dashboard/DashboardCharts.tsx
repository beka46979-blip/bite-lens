'use client';

import { TrendingUp, Users, DollarSign } from 'lucide-react';

interface RegistrationData {
  date: string;
  count: number;
}

interface RevenueData {
  date: string;
  amount: number;
}

interface Props {
  registrations: RegistrationData[];
  revenue: RevenueData[];
}

export function DashboardCharts({ registrations, revenue }: Props) {
  // Линия графика
  const createLinePath = (data: number[], maxValue: number, width: number, height: number) => {
    if (data.length === 0) return '';
    const stepX = width / (data.length - 1 || 1);
    const points = data.map((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Область под графиком
  const createAreaPath = (data: number[], maxValue: number, width: number, height: number) => {
    if (data.length === 0) return '';
    const stepX = width / (data.length - 1 || 1);
    const points = data.map((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      return `${x},${y}`;
    });
    return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  };

  const registrationCounts = registrations.map((r) => r.count);
  const maxRegistrations = Math.max(...registrationCounts, 1);

  const revenueAmounts = revenue.map((r) => r.amount);
  const maxRevenue = Math.max(...revenueAmounts, 1);

  const totalRegistrations = registrationCounts.reduce((a, b) => a + b, 0);
  const totalRevenue = revenueAmounts.reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* График регистраций */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Регистрации
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Последние 7 дней</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {totalRegistrations}
            </span>
          </div>
        </div>

        {/* График */}
        <div className="relative h-48 -mx-2">
          <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
            {/* Сетка */}
            <line x1="0" y1="45" x2="400" y2="45" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1="90" x2="400" y2="90" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1="135" x2="400" y2="135" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="1" strokeDasharray="4" />

            {/* Область под графиком */}
            <path
              d={createAreaPath(registrationCounts, maxRegistrations, 400, 180)}
              fill="url(#registrationGradient)"
            />

            {/* Линия графика */}
            <path
              d={createLinePath(registrationCounts, maxRegistrations, 400, 180)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Точки */}
            {registrationCounts.map((value, index) => {
              const x = (index * 400) / (registrationCounts.length - 1 || 1);
              const y = 180 - (value / maxRegistrations) * 180;
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="6" fill="#3b82f6" opacity="0.2" />
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3b82f6"
                    className="stroke-white dark:stroke-gray-900"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            <defs>
              <linearGradient id="registrationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Дни */}
        <div className="grid grid-cols-7 gap-1 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {registrations.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase">
                {new Date(item.date).toLocaleDateString('ru', { weekday: 'short' })}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* График дохода */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Доход
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Последние 7 дней</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-md">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ${totalRevenue}
            </span>
          </div>
        </div>

        {/* График - bars */}
        <div className="relative h-48 -mx-2">
          <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
            {/* Сетка */}
            <line x1="0" y1="45" x2="400" y2="45" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1="90" x2="400" y2="90" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1="135" x2="400" y2="135" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="1" strokeDasharray="4" />

            {/* Столбцы */}
            {revenueAmounts.map((value, index) => {
              const totalBars = revenueAmounts.length;
              const gap = 8;
              const totalGap = gap * (totalBars - 1);
              const barWidth = (400 - totalGap) / totalBars;
              const x = index * (barWidth + gap);
              const height = (value / maxRevenue) * 170;
              const y = 180 - height;

              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    fill="url(#revenueGradient)"
                    rx="6"
                  />
                </g>
              );
            })}

            <defs>
              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Дни */}
        <div className="grid grid-cols-7 gap-1 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {revenue.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase">
                {new Date(item.date).toLocaleDateString('ru', { weekday: 'short' })}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                ${item.amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
