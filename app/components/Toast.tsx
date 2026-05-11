'use client';

import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'error', onClose, duration = 4000 }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      gradient: 'from-green-500 to-emerald-600',
      bg: 'bg-white dark:bg-gray-800',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      textColor: 'text-gray-800 dark:text-gray-100',
      border: 'border-green-200 dark:border-green-800',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5" />,
      gradient: 'from-red-600 to-red-700',
      bg: 'bg-white dark:bg-gray-800',
      iconBg: 'bg-gradient-to-br from-red-600 to-red-700',
      textColor: 'text-gray-800 dark:text-gray-100',
      border: 'border-red-500 dark:border-red-700',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-white dark:bg-gray-800',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      textColor: 'text-gray-800 dark:text-gray-100',
      border: 'border-blue-200 dark:border-blue-800',
    },
  };

  const currentConfig = config[type];

  return (
    <div 
      className={`fixed top-4 right-4 z-50 ${
        isClosing ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
    >
      <div className={`${currentConfig.bg} ${currentConfig.border} border-l-4 rounded-lg shadow-xl backdrop-blur-sm max-w-sm overflow-hidden`}>
        {/* Градиентная полоска сверху */}
        <div className={`h-0.5 bg-gradient-to-r ${currentConfig.gradient}`}></div>
        
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Иконка с градиентом */}
            <div className={`flex-shrink-0 ${currentConfig.iconBg} rounded-md p-1.5 text-white shadow-md`}>
              {currentConfig.icon}
            </div>
            
            {/* Текст сообщения */}
            <div className="flex-1 pt-0.5">
              <p className={`${currentConfig.textColor} text-xs font-medium leading-relaxed pr-6`}>
                {message}
              </p>
            </div>

            {/* Кнопка закрытия */}
            <button
              onClick={handleClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Прогресс-бар */}
          <div className="mt-2 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${currentConfig.gradient} animate-progress`}
              style={{ animationDuration: `${duration}ms` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
