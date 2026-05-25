// lib/finik.ts
import https from 'node:https';

// Выбор окружения (beta или prod)
const FINIK_ENV = process.env.FINIK_ENV || 'beta';
const BASE_URL = FINIK_ENV === 'prod'
  ? 'https://api.acquiring.averspay.kg'
  : 'https://beta.api.acquiring.averspay.kg';
const HOST = FINIK_ENV === 'prod'
  ? 'api.acquiring.averspay.kg'
  : 'beta.api.acquiring.averspay.kg';

// Finik credentials
const FINIK_API_KEY = process.env.FINIK_API_KEY;
const FINIK_ACCOUNT_ID = process.env.FINIK_ACCOUNT_ID;
const FINIK_PRIVATE_KEY = process.env.FINIK_PRIVATE_KEY?.trim();

// Публичные ключи Finik для верификации webhook
const FINIK_PUBLIC_KEYS = {
  prod: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuF/PUmhMPPidcMxhZBPb
BSGJoSphmCI+h6ru8fG8guAlcPMVlhs+ThTjw2LHABvciwtpj51ebJ4EqhlySPyT
hqSfXI6Jp5dPGJNDguxfocohaz98wvT+WAF86DEglZ8dEsfoumojFUy5sTOBdHEu
g94B4BbrJvjmBa1YIx9Azse4HFlWhzZoYPgyQpArhokeHOHIN2QFzJqeriANO+wV
aUMta2AhRVZHbfyJ36XPhGO6A5FYQWgjzkI65cxZs5LaNFmRx6pjnhjIeVKKgF99
4OoYCzhuR9QmWkPl7tL4Kd68qa/xHLz0Psnuhm0CStWOYUu3J7ZpzRK8GoEXRcr8
tQIDAQAB
-----END PUBLIC KEY-----`,
  beta: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwlrlKz/8gLWd1ARWGA/8
o3a3Qy8G+hPifyqiPosiTY6nCHovANMIJXk6DH4qAqqZeLu8pLGxudkPbv8dSyG7
F9PZEAryMPzjoB/9P/F6g0W46K/FHDtwTM3YIVvstbEbL19m8yddv/xCT9JPPJTb
LsSTVZq5zCqvKzpupwlGS3Q3oPyLAYe+ZUn4Bx2J1WQrBu3b08fNaR3E8pAkCK27
JqFnP0eFfa817VCtyVKcFHb5ij/D0eUP519Qr/pgn+gsoG63W4pPHN/pKwQUUiAy
uLSHqL5S2yu1dffyMcMVi9E/Q2HCTcez5OvOllgOtkNYHSv9pnrMRuws3u87+hNT
ZwIDAQAB
-----END PUBLIC KEY-----`
};

// Интерфейс для данных платежа
export interface CreatePaymentData {
  amount: number;
  workId: string;
  workTopic: string;
  userId: string;
}

// Интерфейс для webhook данных
export interface FinikWebhookData {
  id: string;
  transactionId: string;
  status: 'succeeded' | 'failed' | 'SUCCEEDED' | 'FAILED';
  amount: number;
  transactionDate: number;
  clientId: string;
  fields: {
    transactionType?: string;
    amount?: number;
    webhook_url?: string;
    paymentId?: string;
    success_redirect_url?: string;
    qrComment?: string;
    name?: string;
    qrTransactionId?: string;
    url?: string;
    [key: string]: unknown;
  };
  data: {
    accountId?: string;
    description?: string;
    metadata?: string | Record<string, unknown>;
    webhookUrl?: string;
    merchantCategoryCode?: string;
    name_en?: string;
    [key: string]: unknown;
  };
}

/**
 * Вспомогательная функция: HTTPS POST с ручной обработкой Location-заголовка.
 * Использует node:https напрямую, чтобы избежать проблем с fetch-обёрткой Next.js.
 */
function httpsPost(
  url: string,
  reqHeaders: Record<string, string>,
  body: string,
): Promise<{ status: number; location: string | null; text: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: { ...reqHeaders, 'content-length': Buffer.byteLength(body).toString() },
      },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { text += chunk; });
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            location: Array.isArray(res.headers.location)
              ? res.headers.location[0]
              : (res.headers.location ?? null),
            text,
          });
        });
      },
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Создает платеж в Finik Acquiring API
 */
export async function createFinikPayment(data: CreatePaymentData): Promise<string> {
  // Проверка наличия credentials
  if (!FINIK_API_KEY || !FINIK_ACCOUNT_ID) {
    throw new Error('Finik credentials are not configured (FINIK_API_KEY and FINIK_ACCOUNT_ID required)');
  }

  // В продакшене требуется приватный ключ
  if (FINIK_ENV === 'prod' && !FINIK_PRIVATE_KEY) {
    throw new Error('FINIK_PRIVATE_KEY is required for production environment');
  }

  const timestamp = Date.now().toString();
  const paymentId = crypto.randomUUID();

  // Получаем APP_URL из переменных окружения
  const APP_URL = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  // Тело запроса согласно документации Finik
  const body = {
    Amount: data.amount,
    CardType: 'FINIK_QR',
    PaymentId: paymentId,
    RedirectUrl: `${APP_URL}/subscription?payment=success`,
    Data: {
      accountId: FINIK_ACCOUNT_ID,
      merchantCategoryCode: '0742',
      name_en: 'BiteLens',
      description: `Подписка ${data.workTopic}`,
      webhookUrl: `${APP_URL}/api/finik/webhook`,
      metadata: JSON.stringify({
        userId: data.userId,
        workId: data.workId,
        paymentId: paymentId,
      }),
    },
  };

  const reqHeaders: Record<string, string> = {
    'content-type': 'application/json',
    'host': HOST,
    'x-api-key': FINIK_API_KEY,
    'x-api-timestamp': timestamp,
  };

  // Генерация подписи (только для продакшена)
  if (FINIK_ENV === 'prod' && FINIK_PRIVATE_KEY) {
    try {
      // Динамический импорт — пакет загружается только в prod-режиме
      const { Signer } = await import('@mancho.devs/authorizer');
      const requestData = {
        httpMethod: 'POST',
        path: '/v1/payment',
        headers: { Host: HOST, 'x-api-key': FINIK_API_KEY, 'x-api-timestamp': timestamp },
        queryStringParameters: undefined,
        body,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signature = await new Signer(requestData as any).sign(FINIK_PRIVATE_KEY);
      reqHeaders['signature'] = signature;
    } catch (error) {
      console.error('❌ Signature error:', error);
      throw new Error('Failed to generate signature');
    }
  }

  // Отправка запроса через node:https (без Next.js fetch-обёртки)
  const bodyString = JSON.stringify(body);
  const result = await httpsPost(`${BASE_URL}/v1/payment`, reqHeaders, bodyString);

  // Finik возвращает 302 с URL платежной страницы
  if (result.status === 302) {
    if (!result.location) {
      throw new Error('Payment URL not found in redirect response');
    }
    if (result.location.includes('status=failed')) {
      console.error('Payment URL contains status=failed');
    }
    return result.location;
  }

  // Обработка ошибок
  console.error('Finik payment creation failed:', result.status, result.text);
  throw new Error(`Payment creation failed (${result.status}): ${result.text}`);
}

/**
 * Верифицирует подпись webhook от Finik
 */
export async function verifyFinikWebhook(
  signature: string,
  timestamp: string,
  body: Record<string, unknown>,
  headers: Record<string, string>,
  webhookPath: string = '/api/finik/webhook'
): Promise<boolean> {
  try {
    const env: 'prod' | 'beta' = FINIK_ENV === 'prod' ? 'prod' : 'beta';
    const publicKey = FINIK_PUBLIC_KEYS[env];

    if (!publicKey) {
      console.error('Finik public key is not configured for environment:', env);
      return false;
    }

    // Динамический импорт — не нагружаем модуль лишними зависимостями
    const { Signer } = await import('@mancho.devs/authorizer');

    const requestData = {
      httpMethod: 'POST',
      path: webhookPath,
      headers: {
        'Host': headers['host'] || headers['Host'] || '',
        'x-api-timestamp': timestamp,
      },
      queryStringParameters: undefined,
      body: body,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isValid = await new Signer(requestData as any).verify(publicKey, signature);
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
}

/**
 * Проверяет timestamp на актуальность (защита от replay атак)
 */
export function isTimestampValid(timestamp: string, maxAgeMinutes: number = 5): boolean {
  try {
    const requestTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const diffMinutes = (currentTime - requestTime) / 1000 / 60;
    return Math.abs(diffMinutes) <= maxAgeMinutes;
  } catch {
    return false;
  }
}
