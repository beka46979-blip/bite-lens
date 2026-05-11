import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth/admin';

// GET - получить один план
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const plan = await prisma.subscription_plans.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json({ error: 'notFound' }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Get plan error:', error);
    return NextResponse.json({ error: 'serverError' }, { status: 500 });
  }
}

// PATCH - обновить план
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const plan = await prisma.subscription_plans.update({
      where: { id },
      data: {
        name_ru: data.nameRu,
        name_en: data.nameEn,
        name_kg: data.nameKg,
        description_ru: data.descriptionRu,
        description_en: data.descriptionEn,
        description_kg: data.descriptionKg,
        price_monthly: data.priceMonthly,
        price_yearly: data.priceYearly,
        currency: data.currency,
        daily_ai_analysis_limit: data.dailyAiAnalysisLimit,
        has_gamification: data.hasGamification,
        has_advanced_analytics: data.hasAdvancedAnalytics,
        has_meal_planning: data.hasMealPlanning,
        has_priority_support: data.hasPrioritySupport,
        is_active: data.isActive,
        sort_order: data.sortOrder,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Update plan error:', error);
    return NextResponse.json({ error: 'serverError' }, { status: 500 });
  }
}

// DELETE - удалить план
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.subscription_plans.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    return NextResponse.json({ error: 'serverError' }, { status: 500 });
  }
}
