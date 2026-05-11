'use client';

import { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: 'error' | 'warning' | 'info';
  children?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, message, type = 'warning', children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = {
    error: {
      bg: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
      border: 'border-red-500',
      icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      button: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
    },
    warning: {
      bg: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      border: 'border-yellow-500',
      icon: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      button: 'from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    },
    info: {
      bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      border: 'border-blue-500',
      icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      button: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
    },
  };

  const colorScheme = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorScheme.icon}`}>
            <AlertCircle className="w-8 h-8" />
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
              {title}
            </h3>
          )}

          {/* Message */}
          {message && (
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {message}
            </p>
          )}

          {/* Custom Content or Default Button */}
          {children || (
            <button
              onClick={onClose}
              className={`w-full py-3.5 bg-gradient-to-r ${colorScheme.button} text-white rounded-xl font-semibold shadow-lg transition-all hover:scale-105`}
            >
              Понятно
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
