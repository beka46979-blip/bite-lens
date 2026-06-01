'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

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

  const handleGoBack = async () => {
    // Сохраняем email в localStorage для автозаполнения на странице регистрации
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingEmail', email);
    }
    
    try {
      // Вызываем API для очистки tempToken
      await fetch('/api/auth/clear-temp-token', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Clear token error:', err);
    }
    
    // Перенаправляем на регистрацию с очисткой кеша
    window.location.replace('/register?t=' + Date.now());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "var(--lp-radius-sm)", padding: "11px 14px",
          fontSize: 13, color: "#f87171",
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "var(--lp-radius-sm)", padding: "11px 14px",
          fontSize: 13, color: "var(--lp-green)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Edit Button - Beautiful */}
      <button
        type="button"
        onClick={handleGoBack}
        style={{
          width: "100%", padding: "12px 16px",
          background: "transparent",
          border: "1px solid var(--lp-border)",
          borderRadius: "var(--lp-radius-sm)",
          color: "var(--lp-text)",
          fontSize: 14, fontWeight: 500,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all .2s",
        }}
        onMouseEnter={e => { 
          (e.currentTarget as HTMLElement).style.background = "var(--lp-bg3)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--lp-green)";
        }}
        onMouseLeave={e => { 
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--lp-border)";
        }}
      >
        <ArrowLeft size={16} />
        Изменить email или пароль
      </button>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{
            display: "block", fontSize: 13, fontWeight: 500,
            color: "var(--lp-muted)", marginBottom: 10, textAlign: "center",
          }}>
            Введите 6-значный код
          </label>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
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
                disabled={isLoading}
                style={{
                  width: 48, height: 56, textAlign: "center",
                  fontSize: 24, fontWeight: 700,
                  background: "var(--lp-bg2)",
                  border: `2px solid ${digit ? "var(--lp-green)" : "var(--lp-border)"}`,
                  borderRadius: "var(--lp-radius-sm)",
                  color: "var(--lp-text)",
                  outline: "none",
                  transition: "border-color .15s",
                  cursor: isLoading ? "not-allowed" : "text",
                  opacity: isLoading ? 0.6 : 1,
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || code.some(digit => digit === '')}
          style={{
            width: "100%", padding: "14px 0",
            background: "var(--lp-green)", color: "var(--lp-green-txt)",
            border: "none", borderRadius: 50,
            fontSize: 15, fontWeight: 600,
            cursor: (isLoading || code.some(digit => digit === '')) ? "not-allowed" : "pointer",
            opacity: (isLoading || code.some(digit => digit === '')) ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
          }}
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Проверка...</>
          ) : 'Подтвердить'}
        </button>
      </form>
    </div>
  );
}
