import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EditPlanForm } from './EditPlanForm';

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  const { id } = await params;

  const plan = await prisma.subscription_plans.findUnique({
    where: { id },
  });

  if (!plan) {
    redirect('/admin/subscription-plans');
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/subscription-plans"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Редактирование плана: {plan.name_ru}
            </h1>
            <p className="text-gray-600 text-sm">
              Измените параметры тарифного плана
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <EditPlanForm plan={plan} />
          </div>
        </div>
      </div>
    </div>
  );
}
