import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { uploadToS3, generateS3Key } from "@/lib/s3";

// Daily snap limits per plan type
const DAILY_LIMITS: Record<string, number | null> = {
  FREE: 3,
  TRIAL: 3,
  PREMIUM: 10,
  PRO: null, // unlimited
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Subscription / paywall gate ──────────────────────────────────────
    const subscription = await prisma.subscriptions.findFirst({
      where: { user_id: currentUser.userId },
      orderBy: { created_at: "desc" },
    });

    const now = new Date();

    if (
      !subscription ||
      subscription.status === "EXPIRED" ||
      subscription.status === "CANCELLED"
    ) {
      return NextResponse.json({ error: "no_subscription" }, { status: 402 });
    }

    if (
      subscription.status === "TRIAL" &&
      subscription.trial_ends_at &&
      subscription.trial_ends_at < now
    ) {
      return NextResponse.json({ error: "trial_expired" }, { status: 402 });
    }

    // Determine daily limit
    const planKey =
      subscription.status === "TRIAL" ? "TRIAL" : subscription.plan_type.toUpperCase();
    const dailyLimit = DAILY_LIMITS[planKey] ?? 3;

    if (dailyLimit !== null) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const snapsToday = await prisma.food_snaps.count({
        where: {
          user_id: currentUser.userId,
          created_at: { gte: todayStart },
        },
      });
      if (snapsToday >= dailyLimit) {
        return NextResponse.json(
          { error: "limit_reached", snapsUsed: snapsToday, dailyLimit },
          { status: 402 },
        );
      }
    }
    // ────────────────────────────────────────────────────────────────────

    const formData = await request.formData();
    const file = formData.get("image") as File;
    const scaleObject = (formData.get("scaleObject") as string) || "none";

    // Справочник размеров объектов масштаба
    const scaleObjectDescriptions: Record<string, string> = {
      spoon: "столовая ложка (длина ~20 см, ширина чашки ~5 см)",
      fork: "вилка (длина ~18–20 см)",
      coin: "монета (диаметр ~2–3 см)",
      card: "банковская карта (85 × 54 мм)",
      hand: "ладонь взрослого человека (~18–20 см в длину)",
      can: "алюминиевая банка 330 мл (высота 11 см, диаметр 6.5 см)",
      bottle: "пластиковая бутылка 0.5 л (высота ~22 см, диаметр 7 см)",
      chopsticks:
        "палочки для еды (длина ~23–25 см, тонкие, деревянные или пластиковые)",
    };
    const scaleHint =
      scaleObject !== "none" && scaleObjectDescriptions[scaleObject]
        ? `\n\n🔍 ОБЪЕКТ МАСШТАБА НА ФОТО: ${scaleObjectDescriptions[scaleObject]}. Используй его размер как опорную точку для точного определения размера тарелки и объёма порции. Это значительно улучшит точность оценки веса.`
        : "";

    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 },
      );
    }

    // Проверка типа файла
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 },
      );
    }

    // Проверка размера файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    // Конвертируем файл в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Загружаем изображение в S3
    const key = generateS3Key(file.name, "meals");
    const imageUrl = await uploadToS3(buffer, key, file.type);

    // Создаем base64 для отправки в OpenAI
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Анализируем изображение с помощью OpenAI GPT-4 Vision
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Ты — AI для анализа еды по фото. Твои пользователи преимущественно из Кыргызстана, поэтому большинство блюд относятся к кыргызской, узбекской, казахской, дунганской, уйгурской и русской кухне.

ЗАДАЧА:
1. Определять еду на изображении
2. Разделять блюда на отдельные ингредиенты если возможно
3. Оценивать примерный вес порции в граммах
4. Подсчитывать калории и БЖУ
5. Давать максимально реалистичный и осторожный ответ
6. Никогда не придумывать точные цифры если уверенность низкая

ПРАВИЛА АНАЛИЗА:
1. Анализируй ВСЕ продукты на фото отдельно — несколько блюд на фото = каждое анализируй в foods[]
2. Учитывай способ приготовления: жарка +30%, фритюр +50%, варка/пар базовый
3. Учитывай масло/соусы/гарниры/напитки если видны
4. Фастфуд = высокая калорийность; домашняя еда = средние значения
5. Кыргызская кухня жирнее европейских аналогов (курдючный жир, много мяса)
6. Если еда не видна полностью — сообщи что оценка примерная
7. Если невозможно точно определить блюдо — укажи несколько вероятных вариантов через "/" в dishName
8. Лучше немного завысить калории, чем занизить

КЫРГЫЗСКИЕ БЛЮДА (справочник):
Бешбармак, Манты, Лагман, Плов (ош), Самса, Шашлык, Куурдак, Чучук/Казы, Боорсок, Каттама, Ашлян-фу, Дымдама, Шорпо, Кесме, Чалап/Максым, Курут, Каймак, Айран, Кумыс, Нан/лепёшки, Ганфан/Цуйван, Чак-чак

ОЦЕНКА ВЕСА — ОБЯЗАТЕЛЬНО:
- Оценивай по размеру тарелки, количеству еды, видимым объектам масштаба
- Если виден ОДИН кусок/часть — оценивай только его, не всё блюдо целиком
- Стандартные порции:
  плов 300-400г, лагман 400-500г, манты 300-400г, шашлык 150-250г,
  бешбармак 400-600г, самса (1 шт) 120-180г, бургер 250-400г,
  пицца целая 700-900г, пицца 1 кусок 100-160г,
  паста/макароны 250-350г, суп/шорпо 300-500г,
  рис/каша 200-300г, салат 150-250г, яичница 2 яйца 150-200г,
  шоколад/батончик 40-100г, фрукт средний 150-200г
- Никогда не возвращай weightGram = 0. Минимум 50г.
- В weightNote ВСЕГДА объясни как определил вес (напр. "по размеру тарелки — стандартная порция", "виден 1 кусок из ~6")`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Проанализируй фото еды. Ответь СТРОГО в формате JSON без маркдаун и пояснений:
{
  "dishName": "название блюда (если несколько вариантов — перечисли через /, напр. 'Лагман / Шорпо')",
  "totalCalories": число (общая калорийность всей порции, примерно),
  "totalProteins": число (г белков, примерно),
  "totalFats": число (г жиров, примерно),
  "totalCarbs": число (г углеводов, примерно),
  "weightGram": число (оценка веса по визуальным признакам, мин 50г),
  "weightNote": "на чём основана оценка веса (напр. 'стандартная порция' или 'часть блюда не видна')",
  "confidence": число от 0 до 1 (уверенность распознавания; низкая значит неточность),
  "verdict": "полезное / умеренное / калорийное (одно слово)",
  "foods": [
    {
      "name": "название ингредиента / отдельного блюда",
      "calories": число,
      "proteins": число,
      "fats": число,
      "carbs": число,
      "weight": вес в граммах
    }
  ]
}

Калории всегда примерные. Не пиши цифры, которые явно невозможно знать точно. Если уверенность ниже 0.5 — отрази это в низком confidence.${scaleHint}`,
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // Парсим JSON ответ от AI
    let analysis;
    try {
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      analysis = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    // Возвращаем результаты анализа БЕЗ сохранения в БД
    return NextResponse.json({
      imageUrl,
      tokensUsed: completion.usage?.total_tokens || 0,
      ...analysis,
    });
  } catch (error: any) {
    console.error("Food analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 },
    );
  }
}
