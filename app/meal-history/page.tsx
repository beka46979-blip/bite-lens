import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { MealHistoryClient } from './MealHistoryClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/app/components/ThemeToggle';

export default async function MealHistoryPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--lp-bg)",
      fontFamily: "var(--font-geist-sans), sans-serif",
      color: "var(--lp-text)",
    }}>
      {/* Header */}
      <div style={{
        background: "var(--lp-bg2)",
        borderBottom: "1px solid var(--lp-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1024, margin: "0 auto",
          padding: "16px 24px",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 10,
            background: "var(--lp-bg3)", border: "1px solid var(--lp-border)",
            color: "var(--lp-muted)", textDecoration: "none", transition: "all .2s",
            flexShrink: 0,
          }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: 20, fontWeight: 800,
              color: "var(--lp-text)", margin: 0, lineHeight: 1.2,
            }}>
              История приёмов пищи
            </h1>
            <p style={{ fontSize: 13, color: "var(--lp-muted)", margin: 0 }}>
              Все сохранённые приёмы и аналитика
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1024, margin: "0 auto", padding: "32px 24px" }}>
        <MealHistoryClient />
      </div>
    </div>
  );
}
