'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, CheckCircle } from 'lucide-react';
import { getPasswordRequirements } from '@/lib/auth/password-validation';

interface ForgotPasswordFormProps {
  initialEmail?: string;
}

export function ForgotPasswordForm({ initialEmail = '' }: ForgotPasswordFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'password'>(initialEmail ? 'code' : 'email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifiedCode, setVerifiedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Проверка требований к паролю
  const passwordRequirements = getPasswordRequirements(newPassword);

  // Автоматически отправляем код, если email передан
  useEffect(() => {
    if (initialEmail && step === 'code') {
      sendCode(initialEmail);
    }
  }, [initialEmail]);

  const sendCode = async (emailToSend: string) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при отправке кода');
        setStep('email');
        return;
      }

      if (data.code) {
        setSuccess(`Email не настроен. Код для демо: ${data.code}`);
      } else {
        setSuccess('Код отправлен на ваш email');
      }

      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError('Ошибка сервера');
      setStep('email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('code');
    await sendCode(email);
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

    // Сохраняем код и переходим к вводу пароля
    setVerifiedCode(codeString);
    setStep('password');
    setSuccess('Код принят! Теперь введите новый пароль');
  };

  const validatePassword = (password: string): { valid: boolean; error?: string } => {
    const reqs = getPasswordRequirements(password);
    
    if (!reqs.minLength) {
      return { valid: false, error: 'Пароль должен содержать минимум 8 символов' };
    }
    
    if (!reqs.hasLowerCase) {
      return { valid: false, error: 'Пароль должен содержать хотя бы одну строчную букву' };
    }
    
    if (!reqs.hasUpperCase) {
      return { valid: false, error: 'Пароль должен содержать хотя бы одну заглавную букву' };
    }
    
    if (!reqs.hasNumber) {
      return { valid: false, error: 'Пароль должен содержать хотя бы одну цифру' };
    }
    
    if (!reqs.hasSpecialChar) {
      return { valid: false, error: 'Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)' };
    }
    
    return { valid: true };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Валидация сложного пароля
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || 'Пароль не соответствует требованиям');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verifiedCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessages: Record<string, string> = {
          'Invalid or expired code': 'Неверный или истекший код',
          'Code expired': 'Код истек. Запросите новый',
          'Invalid code': 'Неверный код',
          'Password must be at least 8 characters': 'Пароль должен содержать минимум 8 символов',
          'Password must contain at least one lowercase letter': 'Пароль должен содержать хотя бы одну строчную букву',
          'Password must contain at least one uppercase letter': 'Пароль должен содержать хотя бы одну заглавную букву',
          'Password must contain at least one number': 'Пароль должен содержать хотя бы одну цифру',
          'Password must contain at least one special character': 'Пароль должен содержать хотя бы один специальный символ',
        };
        setError(errorMessages[data.error] || 'Ошибка при сбросе пароля');
        return;
      }

      setSuccess('Пароль успешно изменен! Перенаправление в профиль...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setCode(['', '', '', '', '', '']);
    await sendCode(email);
  };

  // Шаг 1: Ввод email
  if (step === 'email') {
    return (
      <form onSubmit={handleSendCode} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="your@email.com"
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Отправка кода...
            </>
          ) : (
            'Отправить код'
          )}
        </button>
      </form>
    );
  }

  // Шаг 2: Ввод кода
  if (step === 'code') {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-6">
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

        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Код отправлен на: <strong className="text-gray-900 dark:text-white">{email}</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
            Введите код из email
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
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
            >
              Отправить код повторно
            </button>
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
            'Продолжить'
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep('email');
            setCode(['', '', '', '', '', '']);
            setError('');
            setSuccess('');
          }}
          className="w-full text-sm text-gray-600 dark:text-gray-400 hover:underline"
        >
          Изменить email
        </button>
      </form>
    );
  }

  // Шаг 3: Ввод нового пароля
  return (
    <form onSubmit={handleResetPassword} className="space-y-6">
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

      <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg border border-green-200 dark:border-green-800">
        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Код подтвержден для: <strong>{email}</strong>
        </p>
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Новый пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={() => setShowPasswordRequirements(true)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Минимум 8 символов, буквы, цифры, спецсимволы"
            minLength={8}
            autoFocus
          />
        </div>
        
        {/* Индикатор требований к паролю */}
        {showPasswordRequirements && newPassword && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Требования к паролю:</p>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 text-xs ${passwordRequirements.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <CheckCircle className={`w-3 h-3 ${passwordRequirements.minLength ? 'opacity-100' : 'opacity-30'}`} />
                <span>Минимум 8 символов</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <CheckCircle className={`w-3 h-3 ${passwordRequirements.hasLowerCase ? 'opacity-100' : 'opacity-30'}`} />
                <span>Строчная буква (a-z)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <CheckCircle className={`w-3 h-3 ${passwordRequirements.hasUpperCase ? 'opacity-100' : 'opacity-30'}`} />
                <span>Заглавная буква (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <CheckCircle className={`w-3 h-3 ${passwordRequirements.hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                <span>Цифра (0-9)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRequirements.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                <CheckCircle className={`w-3 h-3 ${passwordRequirements.hasSpecialChar ? 'opacity-100' : 'opacity-30'}`} />
                <span>Спецсимвол (!@#$%^&*)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Подтвердите пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Повторите пароль"
            minLength={8}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Сброс пароля...
          </>
        ) : (
          'Сбросить пароль'
        )}
      </button>
    </form>
  );
}
