'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Locale } from '@/app/i18n';
import { useAuthTranslation } from '@/app/i18n/useTranslation';
import { Mail, Lock, Loader2, Check, X, Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  locale: Locale;
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const { t } = useAuthTranslation(locale);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Автозаполнение email из localStorage (если пользователь вернулся со страницы верификации)
  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingEmail');
    if (pendingEmail) {
      setFormData(prev => ({ ...prev, email: pendingEmail }));
      localStorage.removeItem('pendingEmail'); // Удаляем после использования
    }
  }, []);

  // Проверка требований к паролю
  const req = {
    length:    formData.password.length >= 8,
    letter:    /[a-zA-Z]/.test(formData.password),
    number:    /[0-9]/.test(formData.password),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError(t.register.errors.passwordTooShort);
      return;
    }

    const hasLetter      = /[a-zA-Z]/.test(formData.password);
    const hasNumber      = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

    if (!hasLetter || !hasNumber || !hasSpecialChar) {
      setError('Пароль должен содержать: буквы, цифры и специальные символы (!@#$%^&* и т.д.)');
      return;
    }

    const commonPasswords = ['12345678', 'password', 'qwerty123', 'abc12345', '11111111'];
    if (commonPasswords.includes(formData.password.toLowerCase())) {
      setError('Этот пароль слишком простой. Пожалуйста, используйте более сложный пароль');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t.register.errors.passwordsNotMatch);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Отправка запроса на регистрацию...');
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await response.json();
      
      console.log('📦 Ответ от сервера:', { status: response.ok, data });

      if (!response.ok) {
        console.error('❌ Ошибка регистрации:', data.error);
        setError(t.register.errors[data.error as keyof typeof t.register.errors] || t.register.errors.serverError);
        return;
      }

      console.log('✅ Регистрация успешна, перенаправление на /verify-email');
      // Используем window.location.href вместо router.push для гарантии установки cookie
      window.location.href = '/verify-email';
    } catch (err) {
      console.error('❌ Ошибка сети:', err);
      setError(t.register.errors.serverError);
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

  const label: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 500,
    color: "var(--lp-muted)", marginBottom: 7,
  };

  return (
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
        <label style={label}>{t.register.email}</label>
        <div style={{ position: "relative" }}>
          <Mail size={16} style={iconStyle} />
          <input
            id="email" type="email" required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
            style={inp("email")}
            placeholder={t.register.emailPlaceholder}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label style={label}>{t.register.password}</label>
        <div style={{ position: "relative" }}>
          <Lock size={16} style={iconStyle} />
          <input
            id="password" type={showPassword ? 'text' : 'password'} required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused("")}
            style={inp("password", true)}
            placeholder={t.register.passwordPlaceholder}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} style={eyeBtn}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Password requirements */}
        {formData.password && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              { ok: req.length,    label: "Пароль должен содержать не менее 8 символов" },
              { ok: req.letter && req.number, label: "Пароль должен содержать буквы и цифры" },
              { ok: req.special,   label: "Пароль должен включать специальный символ" },
            ].map(({ ok, label: lbl }) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                {ok
                  ? <Check size={13} style={{ color: "var(--lp-green)", flexShrink: 0 }} />
                  : <X     size={13} style={{ color: "#f87171",         flexShrink: 0 }} />}
                <span style={{ color: ok ? "var(--lp-green)" : "var(--lp-muted)" }}>{lbl}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label style={label}>{t.register.confirmPassword}</label>
        <div style={{ position: "relative" }}>
          <Lock size={16} style={iconStyle} />
          <input
            id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            onFocus={() => setFocused("confirmPassword")}
            onBlur={() => setFocused("")}
            style={inp("confirmPassword", true)}
            placeholder={t.register.confirmPasswordPlaceholder}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1} style={eyeBtn}>
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
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
        {isLoading ? (
          <><Loader2 size={18} className="animate-spin" /> Регистрация...</>
        ) : t.register.submit}
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "var(--lp-border)" }} />
        <span style={{ fontSize: 12, color: "var(--lp-muted)", whiteSpace: "nowrap" }}>
          {t.register.orContinueWith}
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
        {t.register.googleButton}
      </button>

      {/* Terms */}
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--lp-muted)", margin: 0 }}>
        {t.register.agreement}{' '}
        <a href="#" style={{ color: "var(--lp-green)", textDecoration: "none" }}>{t.register.terms}</a>
        {' '}{t.register.and}{' '}
        <a href="#" style={{ color: "var(--lp-green)", textDecoration: "none" }}>{t.register.privacy}</a>
      </p>
    </form>
  );
}
