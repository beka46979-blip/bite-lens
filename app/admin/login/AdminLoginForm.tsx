'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, CheckCircle, Send } from 'lucide-react';
import { Toast } from '@/app/components/Toast';

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'code'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminId, setAdminId] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'invalidCredentials') {
          showErrorToast('Неверный email или пароль');
        } else if (data.error === 'serverError') {
          showErrorToast(`Ошибка сервера: ${data.details || 'Неизвестная ошибка'}`);
        } else {
          showErrorToast('Ошибка сервера');
        }
        return;
      }

      setAdminId(data.adminId);
      setStep('code');
      
      if (data.code) {
        setDemoCode(data.code);
        setSuccess(`Telegram не настроен. Код для демо: ${data.code}`);
      } else {
        setSuccess('Код отправлен в Telegram');
      }

      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      console.error('Login error:', err);
      showErrorToast(`Ошибка подключения: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const codeString = code.join('');

    if (codeString.length !== 6) {
      setError('Введите все 6 цифр кода');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, code: codeString }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessages: Record<string, string> = {
          invalidCode: 'Неверный код',
          codeExpired: 'Код истек. Запросите новый',
          adminNotFound: 'Админ не найден',
        };
        setError(errorMessages[data.error] || 'Ошибка при проверке кода');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess('Вход выполнен успешно!');
      
      setTimeout(() => {
        router.push('/admin/dashboard');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'credentials') {
    return (
      <>
        {showToast && (
          <Toast
            message={toastMessage}
            type="error"
            onClose={() => setShowToast(false)}
            duration={4000}
          />
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email администратора
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                placeholder="admin@example.com"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Отправка кода...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Получить код в Telegram
              </>
            )}
          </button>
        </form>
      </>
    );
  }

  return (
    <form onSubmit={handleVerifyCode} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
        <p className="text-sm text-gray-700">
          📱 Код отправлен в Telegram на ваш аккаунт
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Введите код из Telegram
        </label>
        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 transition-all"
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || code.some(digit => digit === '')}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Проверка...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Войти
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setStep('credentials');
          setCode(['', '', '', '', '', '']);
          setError('');
          setSuccess('');
        }}
        className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        ← Вернуться к вводу пароля
      </button>
    </form>
  );
}
