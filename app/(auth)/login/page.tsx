import { getLocaleFromCookie } from '@/app/i18n/cookies';
import { LoginForm } from './LoginForm';
import { getTranslations } from '@/app/i18n';
import Link from 'next/link';

export default async function LoginPage() {
  const locale = await getLocaleFromCookie();
  const t = getTranslations(locale, 'auth') as any;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--lp-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "var(--font-geist-sans), sans-serif",
      color: "var(--lp-text)",
    }}>
      {/* Glow blobs */}
      <div style={{
        position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 500, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse, var(--lp-green-mid) 0%, transparent 65%)",
      }} />
      <div style={{
        position: "absolute", bottom: "5%", right: "8%",
        width: 350, height: 350, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse, var(--lp-purple-soft) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32, textDecoration: "none",
        }}>
          <span style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 900, fontSize: 24, color: "var(--lp-text)",
          }}>
            Bite Lens
          </span>
        </Link>

        {/* Card */}
        <div style={{
          background: "var(--lp-card)",
          border: "1px solid var(--lp-border)",
          borderRadius: "var(--lp-radius)",
          padding: "36px",
          boxShadow: "var(--lp-shadow-md)",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: 26, fontWeight: 800, letterSpacing: -0.5,
              color: "var(--lp-text)", margin: "0 0 8px",
            }}>
              {t.login.title}
            </h1>
            <p style={{ fontSize: 14, color: "var(--lp-muted)", fontWeight: 300, margin: 0 }}>
              {t.login.subtitle}
            </p>
          </div>

          <LoginForm locale={locale} />

          <p style={{ textAlign: "center", fontSize: 14, color: "var(--lp-muted)", marginTop: 20, marginBottom: 0 }}>
            {t.login.noAccount}{' '}
            <Link href="/register" style={{ color: "var(--lp-green)", fontWeight: 600, textDecoration: "none" }}>
              {t.login.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
