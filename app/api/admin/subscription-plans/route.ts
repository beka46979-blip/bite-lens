import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth/admin';

// GET - получить все тарифные планы
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const plans = await prisma.subscription_plans.findMany({
      orderBy: { sort_order: 'asc' },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json({ error: 'serverError' }, { status: 500 });
  }
}

// POST - создать новый тарифный план
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Проверяем, существует ли план с таким типом
    const existing = await prisma.subscription_plans.findUnique({
      where: { plan_type: data.planType },
    });

    if (existing) {
      return NextResponse.json({ error: 'duplicate' }, { status: 400 });
    }

    const plan = await prisma.subscription_plans.create({
      data: {
        plan_type: data.planType,
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
    console.error('Create plan error:', error);
    return NextResponse.json({ error: 'serverError' }, { status: 500 });
  }
}
