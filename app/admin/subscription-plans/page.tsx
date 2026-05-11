import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { SubscriptionPlansClient } from './SubscriptionPlansClient';

export default async function SubscriptionPlansPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  const plansRaw = await prisma.subscription_plans.findMany({
    orderBy: { sort_order: 'asc' },
  });

  // Преобразуем Decimal в обычные числа и Date в строки для клиентского компонента
  const plans = plansRaw.map(plan => ({
    ...plan,
    price_monthly: Number(plan.price_monthly),
    price_yearly: Number(plan.price_yearly),
    created_at: plan.created_at.toISOString(),
    updated_at: plan.updated_at.toISOString(),
  }));

  return <SubscriptionPlansClient plans={plans} />;
}
