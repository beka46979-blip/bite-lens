'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';

interface VerifyEmailFormProps {
  email: string;
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Автоматически отправляем код при загрузке страницы
  useEffect(() => {
    const sendCode = async () => {
      try {
        const response = await fetch('/api/auth/verify-email/send-code', {
          method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error === 'Email already verified' 
            ? 'Email уже подтвержден'
            : 'Ошибка при отправке кода');
          return;
        }

        if (data.code) {
          // Если SMTP не настроен, показываем код
          setSuccess(`Email не настроен. Код для демо: ${data.code}`);
        } else {
          setSuccess('Код отправлен на ваш email');
        }

        // Фокус на первое поле
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } catch (err) {
        setError('Ошибка сервера');
      }
    };

    sendCode();
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    // Разрешаем только цифры
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Автоматический переход к следующему полю
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Автоматическая отправка при заполнении всех полей
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
      
      // Автоматическая отправка
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessages: Record<string, string> = {
          'Invalid code': 'Неверный код',
          'Code expired': 'Код истек. Запросите новый',
          'Email already verified': 'Email уже подтвержден',
          'No verification code found': 'Код не найден. Отправьте новый',
        };
        setError(errorMessages[data.error] || 'Ошибка при проверке кода');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess('Email успешно подтвержден!');
      
      // Перенаправление в профиль через 1 секунду
      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('Ошибка сервера');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Введите все 6 цифр');
      return;
    }

    handleVerify(verificationCode);
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('Отправка кода...');

    try {
      const response = await fetch('/api/auth/verify-email/send-code', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError('Ошибка при отправке кода');
        setSuccess('');
        return;
      }

      if (data.code) {
        setSuccess(`Email не настроен. Код для демо: ${data.code}`);
      } else {
        setSuccess('Код отправлен повторно на ваш email');
      }
    } catch (err) {
      setError('Ошибка сервера');
      setSuccess('');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
            Введите 6-значный код
          </label>
          <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white transition-all"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || code.some(digit => digit === '')}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Проверка...
            </>
          ) : (
            'Подтвердить'
          )}
        </button>

        <button
          type="button"
          onClick={handleResendCode}
          className="w-full text-emerald-600 dark:text-emerald-400 hover:underline text-sm"
        >
          Отправить код повторно
        </button>
      </form>
    </div>
  );
}
