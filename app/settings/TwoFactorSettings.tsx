'use client';

import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface TwoFactorSettingsProps {
  userId: string;
  email: string;
  twoFactorEnabled: boolean;
}

export function TwoFactorSettings({ userId, email, twoFactorEnabled: initialEnabled }: TwoFactorSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleToggle2FA = async () => {
    if (enabled) {
      // Отключить 2FA
      if (!confirm('Вы уверены, что хотите отключить двухфакторную аутентификацию?')) {
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/auth/2fa/disable', {
          method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Ошибка при отключении 2FA');
          return;
        }

        setEnabled(false);
        setSuccess('2FA успешно отключена');
      } catch (err) {
        setError('Ошибка сервера');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Включить 2FA - показать форму настройки
      setShowSetup(true);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Отправляем код на email
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Неверный код');
        return;
      }

      setEnabled(true);
      setShowSetup(false);
      setSuccess('2FA успешно включена!');
      setVerificationCode('');
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/2fa/send-code', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при отправке кода');
        return;
      }

      if (data.code) {
        // Если SMTP не настроен, показываем код
        setSuccess(`Email не настроен. Код для демо: ${data.code}`);
      } else {
        setSuccess(`Код отправлен на ${email}`);
      }
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {!showSetup ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-3">
            {enabled ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {enabled ? '2FA включена' : '2FA отключена'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {enabled 
                  ? 'Ваш аккаунт защищен двухфакторной аутентификацией'
                  : 'Включите 2FA для дополнительной защиты'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle2FA}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
              enabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : enabled ? (
              'Отключить'
            ) : (
              'Включить'
            )}
          </button>
        </div>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Настройка 2FA
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Мы отправим код подтверждения на ваш email: <strong>{email}</strong>
          </p>

          <button
            onClick={handleSendCode}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Отправить код на email
          </button>

          <form onSubmit={handleEnable2FA} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Введите код из email
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-center text-2xl tracking-widest"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSetup(false);
                  setVerificationCode('');
                  setError('');
                  setSuccess('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Подтвердить
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
