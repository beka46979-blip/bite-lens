# Stage 1: Установка зависимостей
FROM node:20-alpine AS deps
WORKDIR /app

# Устанавливаем необходимые системные зависимости для Prisma
RUN apk add --no-cache libc6-compat openssl

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем все зависимости (включая dev для сборки)
RUN npm install --frozen-lockfile || npm install

# Генерируем Prisma Client
RUN npx prisma generate

# Stage 2: Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем node_modules из предыдущего stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Копируем исходный код
COPY . .

# Устанавливаем переменную окружения для сборки
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Собираем Next.js приложение
RUN npm run build

# Stage 3: Production образ
FROM node:20-alpine AS runner
WORKDIR /app

# Устанавливаем необходимые системные зависимости
RUN apk add --no-cache libc6-compat openssl

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Устанавливаем правильные права доступа
RUN chown -R nextjs:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nextjs

# Открываем порт 3000
EXPOSE 3000

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запускаем миграции и стартуем приложение
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
