'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '@/app/i18n';
import { useAuthTranslation } from '@/app/i18n/useTranslation';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { Toast } from '@/app/components/Toast';

interface LoginFormProps {
  locale: Locale;
}

export function LoginForm({ locale }: LoginFormProps) {
  const { t } = useAuthTranslation(locale);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowToast(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'googleAccount') {
          showErrorToast('Этот аккаунт зарегистрирован через Google. Используйте кнопку "Продолжить через Google" для входа.');
        } else {
          setError(t.login.errors[data.error as keyof typeof t.login.errors] || t.login.errors.serverError);
        }
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(t.login.errors.serverError);
    } finally {
      setIsLoading(false);
    }
  };

  const inp = (name: string, hasRight = false): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    padding: hasRight ? "13px 44px 13px 40px" : "13px 14px 13px 40px",
    background: "var(--lp-bg2)",
    border: `1px solid ${focused === name ? "var(--lp-green)" : "var(--lp-border)"}`,
    borderRadius: "var(--lp-radius-sm)",
    color: "var(--lp-text)",
    fontSize: 14,
    outline: "none",
    transition: "border-color .15s",
  });

  const iconStyle: React.CSSProperties = {
    position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
    color: "var(--lp-muted2)", pointerEvents: "none",
  };

  const eyeBtn: React.CSSProperties = {
    position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    color: "var(--lp-muted2)", padding: 0, display: "flex", lineHeight: 0,
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 500,
    color: "var(--lp-muted)", marginBottom: 7,
  };

  return (
    <>
      {showToast && (
        <Toast message={toastMessage} type="error" onClose={() => setShowToast(false)} duration={4000} />
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "var(--lp-radius-sm)", padding: "11px 14px",
            fontSize: 13, color: "#f87171",
          }}>
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label style={labelStyle}>{t.login.email}</label>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={iconStyle} />
            <input
              id="email" type="email" required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")}
              style={inp("email")}
              placeholder={t.login.emailPlaceholder}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>{t.login.password}</label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={iconStyle} />
            <input
              id="password" type={showPassword ? 'text' : 'password'} required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused("")}
              style={inp("password", true)}
              placeholder={t.login.passwordPlaceholder}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} style={eyeBtn}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <a
              href={formData.email ? `/forgot-password?email=${encodeURIComponent(formData.email)}` : '/forgot-password'}
              style={{ fontSize: 13, color: "var(--lp-green)", textDecoration: "none" }}
            >
              Забыли пароль?
            </a>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%", padding: "14px 0",
            background: "var(--lp-green)", color: "var(--lp-green-txt)",
            border: "none", borderRadius: 50,
            fontSize: 15, fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
          }}
        >
          {isLoading && <Loader2 size={18} className="animate-spin" />}
          {t.login.submit}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "var(--lp-border)" }} />
          <span style={{ fontSize: 12, color: "var(--lp-muted)", whiteSpace: "nowrap" }}>
            {t.login.orContinueWith}
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--lp-border)" }} />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => window.location.href = '/api/auth/google'}
          style={{
            width: "100%", padding: "13px 0",
            background: "transparent",
            border: "1px solid var(--lp-border)",
            borderRadius: "var(--lp-radius-sm)",
            color: "var(--lp-text)",
            fontSize: 14, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "background .15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--lp-bg3)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t.login.googleButton}
        </button>
      </form>
    </>
  );
}
