import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SubscriptionClient } from "./SubscriptionClient";

export default async function SubscriptionPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const subscription = await prisma.subscriptions.findFirst({
    where:   { user_id: currentUser.userId },
    orderBy: { created_at: "desc" },
  });

  let trialDaysLeft: number | null = null;
  if (subscription?.status === "TRIAL" && subscription.trial_ends_at) {
    const msLeft = subscription.trial_ends_at.getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  }

  return (
    <SubscriptionClient
      currentStatus={subscription?.status ?? null}
      currentPlan={subscription?.plan_type ?? null}
      trialDaysLeft={trialDaysLeft}
      userId={currentUser.userId}
    />
  );
}
