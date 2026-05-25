import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { FoodScanForm } from "./FoodScanForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default async function ScanFoodPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const [recentMeals, subscription] = await Promise.all([
    prisma.food_snaps.findMany({
      where:   { user_id: currentUser.userId },
      orderBy: { created_at: "desc" },
      take:    3,
      select:  { id: true, dish_name: true, calories: true, created_at: true, image_url: true },
    }),
    prisma.subscriptions.findFirst({
      where:   { user_id: currentUser.userId },
      orderBy: { created_at: "desc" },
    }),
  ]);

  // Calculate trial days remaining (null if not on trial)
  let trialDaysLeft: number | null = null;
  if (subscription?.status === "TRIAL" && subscription.trial_ends_at) {
    const msLeft = subscription.trial_ends_at.getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--scan-page-bg)", color: "var(--scan-text-1)" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background:   "var(--scan-header-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--scan-header-border)",
        }}
      >
        <div className="max-w-lg mx-auto px-4">
          <div className="relative flex items-center justify-center h-16">

            {/* Back button */}
            <Link
              href="/dashboard"
              className="absolute left-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
              style={{
                background: "var(--scan-tag-bg)",
                border:     "1px solid var(--scan-tag-border)",
              }}
            >
              <ArrowLeft className="w-4 h-4" style={{ color: "var(--scan-text-1)" }} />
            </Link>

            {/* Centered title */}
            <div className="text-center">
              <h1 className="text-[15px] font-bold leading-tight" style={{ color: "var(--scan-text-1)" }}>
                Сканировать еду
              </h1>
              <p className="text-[11px] font-medium" style={{ color: "var(--scan-accent)" }}>
                Загрузите фото для анализа калорий
              </p>
            </div>

            {/* Theme toggle */}
            <div className="absolute right-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ── AI badge ───────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-4 pb-1">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold tracking-widest"
          style={{
            background: "var(--scan-accent-bg)",
            border:     "1px solid var(--scan-accent-border)",
            color:      "var(--scan-accent)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
            style={{ background: "var(--scan-accent)", boxShadow: "0 0 6px var(--scan-accent)" }}
          />
          AI-АНАЛИЗ АКТИВЕН
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-lg mx-auto px-4 py-3 pb-10">
        <FoodScanForm
          userId={currentUser.userId}
          recentMeals={recentMeals}
          trialDaysLeft={trialDaysLeft}
        />
      </div>
    </div>
  );
}
