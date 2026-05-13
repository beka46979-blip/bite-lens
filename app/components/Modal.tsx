'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      // Блокируем скролл и сохраняем текущую позицию
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Восстанавливаем скролл
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      // Очистка при размонтировании
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
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

  const modalContent = (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-[99999] flex items-center justify-center animate-in fade-in duration-200"
      style={{ position: 'fixed', inset: 0 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Modal */}
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200"
        style={{ position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="p-8 sm:p-10">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${colorScheme.icon}`}>
            <AlertCircle className="w-10 h-10" />
          </div>

          {/* Title */}
          {title && (
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              {title}
            </h3>
          )}

          {/* Message */}
          {message && (
            <p className="text-base sm:text-lg text-center text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {message}
            </p>
          )}

          {/* Custom Content or Default Button */}
          {children || (
            <button
              onClick={onClose}
              className={`w-full py-4 bg-gradient-to-r ${colorScheme.button} text-white rounded-xl font-semibold text-lg shadow-lg transition-all hover:scale-105`}
            >
              Понятно
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Рендерим модальное окно в body через Portal
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
