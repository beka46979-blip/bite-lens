import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";
import { ProfileHeader } from "./ProfileHeader";
import { OnboardingWizard } from "./OnboardingWizard";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { getLocaleFromCookie } from "@/app/i18n/cookies";
import Link from "next/link";
import { LogOut, LayoutDashboard, ArrowLeft } from "lucide-react";

export default async function ProfilePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const user = await prisma.users.findUnique({
    where: { id: currentUser.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      gender: true,
      birth_date: true,
      height_cm: true,
      weight_start: true,
      weight_goal: true,
      activity_level: true,
      daily_kcal_target: true,
      onboarding_completed: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    gender: user.gender,
    birthDate: user.birth_date,
    heightCm: user.height_cm ? Number(user.height_cm) : null,
    weightStart: user.weight_start ? Number(user.weight_start) : null,
    weightGoal: user.weight_goal ? Number(user.weight_goal) : null,
    activityLevel: user.activity_level,
    dailyKcalTarget: user.daily_kcal_target
      ? Number(user.daily_kcal_target)
      : null,
    onboardingCompleted: user.onboarding_completed,
  };

  const locale = await getLocaleFromCookie();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800"
      >
        <div style={{ maxWidth: 1024, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64,
            }}
          >
            {/* Left: Back + User */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              {userData.onboardingCompleted && (
                <Link
                  href="/dashboard"
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    color: "var(--lp-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ArrowLeft style={{ width: 20, height: 20 }} />
                </Link>
              )}
              <ProfileHeader
                initialAvatar={userData.avatar}
                userName={userData.name || ""}
                userEmail={userData.email}
              />
            </div>

            {/* Right: Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <ThemeToggle />
              {userData.onboardingCompleted && (
                <Link
                  href="/dashboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    background: "var(--lp-green)",
                    color: "#fff",
                    borderRadius: 8,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <LayoutDashboard style={{ width: 16, height: 16 }} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}
              <Link
                href="/force-logout"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  color: "#f87171",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                <LogOut style={{ width: 16, height: 16 }} />
                <span className="hidden sm:inline">Выйти</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1024, margin: "0 auto", padding: "40px 24px" }}>
        {/* Page heading */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
              fontWeight: 800,
              color: "var(--lp-text)",
              letterSpacing: "-0.025em",
            }}
          >
            {userData.onboardingCompleted ? "Профиль" : "Завершите настройку"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--lp-muted)", marginTop: 4 }}>
            {userData.onboardingCompleted
              ? "Управляйте своими данными для точных AI-рекомендаций"
              : "Несколько шагов и приложение подстроится под вас"}
          </p>
        </div>

        {/* Form Container - убрана белая карточка */}
        {userData.onboardingCompleted ? (
          <div>
            <ProfileForm user={userData} locale={locale} />
          </div>
        ) : (
          <div
            style={{
              background: "var(--lp-card)",
              borderRadius: 16,
              border: "1px solid var(--lp-border)",
              overflow: "hidden",
            }}
          >
            <OnboardingWizard user={userData} />
          </div>
        )}
      </main>
    </div>
  );
}
