import { Currency } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function initPlans() {
  console.log('🚀 Инициализация тарифных планов...\n');

  try {
    const plans = [
      {
        planType: 'FREE',
        nameRu: 'Бесплатный',
        nameEn: 'Free',
        nameKg: 'Акысыз',
        descriptionRu: 'Базовые функции для начала работы с приложением',
        descriptionEn: 'Basic features to get started with the app',
        descriptionKg: 'Колдонмо менен иштөө үчүн негизги функциялар',
        priceMonthly: 0,
        priceYearly: 0,
        currency: Currency.USD,
        dailyAiAnalysisLimit: 3,
        hasGamification: false,
        hasAdvancedAnalytics: false,
        hasMealPlanning: false,
        hasPrioritySupport: false,
        isActive: true,
        sortOrder: 1,
      },
      {
        planType: 'PRO',
        nameRu: 'Профессиональный',
        nameEn: 'Professional',
        nameKg: 'Профессионалдык',
        descriptionRu: 'Расширенные возможности для серьезного подхода к питанию',
        descriptionEn: 'Advanced features for serious nutrition tracking',
        descriptionKg: 'Тамактануу үчүн кеңейтилген мүмкүнчүлүктөр',
        priceMonthly: 9.99,
        priceYearly: 99.99,
        currency: Currency.USD,
        dailyAiAnalysisLimit: null, // безлимит
        hasGamification: true,
        hasAdvancedAnalytics: true,
        hasMealPlanning: true,
        hasPrioritySupport: false,
        isActive: true,
        sortOrder: 2,
      },
      {
        planType: 'PREMIUM',
        nameRu: 'Премиум',
        nameEn: 'Premium',
        nameKg: 'Премиум',
        descriptionRu: 'Все возможности + приоритетная поддержка',
        descriptionEn: 'All features + priority support',
        descriptionKg: 'Бардык мүмкүнчүлүктөр + артыкчылыктуу колдоо',
        priceMonthly: 19.99,
        priceYearly: 199.99,
        currency: Currency.USD,
        dailyAiAnalysisLimit: null, // безлимит
        hasGamification: true,
        hasAdvancedAnalytics: true,
        hasMealPlanning: true,
        hasPrioritySupport: true,
        isActive: true,
        sortOrder: 3,
      },
    ];

    for (const plan of plans) {
      const existing = await prisma.subscription_plans.findUnique({
        where: { plan_type: plan.planType },
      });

      if (existing) {
        console.log(`⚠️  План ${plan.nameRu} уже существует, пропускаем...`);
        continue;
      }

      await prisma.subscription_plans.create({
        data: {
          plan_type: plan.planType,
          name_ru: plan.nameRu,
          name_en: plan.nameEn,
          name_kg: plan.nameKg,
          description_ru: plan.descriptionRu,
          description_en: plan.descriptionEn,
          description_kg: plan.descriptionKg,
          price_monthly: plan.priceMonthly,
          price_yearly: plan.priceYearly,
          currency: plan.currency,
          daily_ai_analysis_limit: plan.dailyAiAnalysisLimit,
          has_gamification: plan.hasGamification,
          has_advanced_analytics: plan.hasAdvancedAnalytics,
          has_meal_planning: plan.hasMealPlanning,
          has_priority_support: plan.hasPrioritySupport,
          is_active: plan.isActive,
          sort_order: plan.sortOrder,
        },
      });

      console.log(`✅ Создан план: ${plan.nameRu}`);
      console.log(`   💰 Цена: $${plan.priceMonthly}/мес, $${plan.priceYearly}/год`);
      console.log(`   📸 Лимит ИИ: ${plan.dailyAiAnalysisLimit || 'безлимит'} фото/день`);
      console.log(`   🎮 Геймификация: ${plan.hasGamification ? 'Да' : 'Нет'}`);
      console.log('');
    }

    console.log('✅ Инициализация завершена!');
    console.log('\n📊 Текущие планы:');
    
    const allPlans = await prisma.subscription_plans.findMany({
      orderBy: { sort_order: 'asc' },
    });

    allPlans.forEach(plan => {
      console.log(`\n${plan.name_ru} (${plan.plan_type}):`);
      console.log(`  💰 $${plan.price_monthly}/мес, $${plan.price_yearly}/год`);
      console.log(`  📸 ${plan.daily_ai_analysis_limit || '∞'} фото/день`);
      console.log(`  🎮 Геймификация: ${plan.has_gamification ? '✓' : '✗'}`);
      console.log(`  📊 Аналитика: ${plan.has_advanced_analytics ? '✓' : '✗'}`);
      console.log(`  🍽️  Планирование: ${plan.has_meal_planning ? '✓' : '✗'}`);
      console.log(`  🎯 Поддержка: ${plan.has_priority_support ? '✓' : '✗'}`);
    });

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initPlans();
