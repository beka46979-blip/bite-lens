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
  console.log('DashboardCharts received registrations:', registrations);
  console.log('DashboardCharts received revenue:', revenue);
  
  // Функция для создания точек линии графика
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

  // Функция для создания области под графиком
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

  // Данные для графика регистраций
  const registrationCounts = registrations.map(r => r.count);
  const maxRegistrations = Math.max(...registrationCounts, 1);
  
  // Данные для графика дохода
  const revenueAmounts = revenue.map(r => r.amount);
  const maxRevenue = Math.max(...revenueAmounts, 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* График регистраций */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Регистрации</h3>
              <p className="text-sm text-gray-500">Последние 7 дней</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {registrationCounts.reduce((a, b) => a + b, 0)} всего
            </span>
          </div>
        </div>

        {/* График */}
        <div className="relative h-48">
          <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
            {/* Сетка */}
            <line x1="0" y1="0" x2="400" y2="0" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="45" x2="400" y2="45" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="90" x2="400" y2="90" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="135" x2="400" y2="135" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="180" x2="400" y2="180" stroke="#e5e7eb" strokeWidth="1" />

            {/* Область под графиком */}
            <path
              d={createAreaPath(registrationCounts, maxRegistrations, 400, 180)}
              fill="url(#registrationGradient)"
              opacity="0.3"
            />

            {/* Линия графика */}
            <path
              d={createLinePath(registrationCounts, maxRegistrations, 400, 180)}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Точки на графике */}
            {registrationCounts.map((value, index) => {
              const x = (index * 400) / (registrationCounts.length - 1 || 1);
              const y = 180 - (value / maxRegistrations) * 180;
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    fill="white"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#10b981"
                  />
                </g>
              );
            })}

            {/* Градиент */}
            <defs>
              <linearGradient id="registrationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Легенда */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {registrations.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-gray-500 mb-1">
                {new Date(item.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              </p>
              <p className="text-sm font-semibold text-gray-900">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* График дохода */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Доход</h3>
              <p className="text-sm text-gray-500">Последние 7 дней</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">
              ${revenueAmounts.reduce((a, b) => a + b, 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* График */}
        <div className="relative h-48">
          <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
            {/* Сетка */}
            <line x1="0" y1="0" x2="400" y2="0" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="45" x2="400" y2="45" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="90" x2="400" y2="90" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="135" x2="400" y2="135" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="180" x2="400" y2="180" stroke="#e5e7eb" strokeWidth="1" />

            {/* Столбцы */}
            {revenueAmounts.map((value, index) => {
              const barWidth = 400 / revenueAmounts.length - 10;
              const x = (index * 400) / revenueAmounts.length + 5;
              const height = (value / maxRevenue) * 180;
              const y = 180 - height;
              
              return (
                <g key={index}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={height}
                    fill="url(#revenueGradient)"
                    rx="4"
                  />
                </g>
              );
            })}

            {/* Градиент */}
            <defs>
              <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Легенда */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          {revenue.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-gray-500 mb-1">
                {new Date(item.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              </p>
              <p className="text-sm font-semibold text-gray-900">${item.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
