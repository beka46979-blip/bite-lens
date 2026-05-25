# S3 Integration Summary

## ✅ Что было сделано

### 1. Установлены зависимости
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Добавлены переменные окружения

**`.env`:**
```env
S3_ENDPOINT="https://s3.twcstorage.ru"
S3_BUCKET_NAME="06af932f-0a50-4164-b902-ef55a33d377c"
S3_ACCESS_KEY="TXVDC2I2RV51LNZGY8E6"
S3_SECRET_KEY="9KtlHjemvfIFZHwuWbaAqekSTVBvXfIWLMTEKilb"
S3_REGION="us-east-1"
```

### 3. Создана утилита для работы с S3

**`lib/s3.ts`** - Основные функции:
- `uploadToS3()` - Загрузка файлов
- `deleteFromS3()` - Удаление файлов
- `getSignedS3Url()` - Генерация подписанных URL
- `extractS3Key()` - Извлечение ключа из URL
- `generateS3Key()` - Генерация уникальных имен файлов

### 4. Обновлены API endpoints

#### **`app/api/profile/avatar/route.ts`**
- ✅ Изменен с JSON на FormData
- ✅ Добавлена валидация типов файлов (JPEG, PNG, WebP)
- ✅ Добавлена проверка размера (максимум 5MB)
- ✅ Загрузка в S3 в папку `avatars/`
- ✅ Автоматическое удаление старого аватара при загрузке нового
- ✅ Удаление из S3 при DELETE запросе

#### **`app/api/food/analyze/route.ts`**
- ✅ Изменен с JSON (base64) на FormData
- ✅ Добавлена валидация типов файлов (JPEG, PNG, WebP)
- ✅ Добавлена проверка размера (максимум 10MB)
- ✅ Загрузка в S3 в папку `meals/`
- ✅ Сохранение URL из S3 в базе данных
- ✅ Конвертация в base64 для OpenAI (временно)

### 5. Создана документация

- **`S3_SETUP.md`** - Полная документация по настройке и использованию
- **`FRONTEND_S3_USAGE.md`** - Примеры использования на фронтенде
- **`S3_INTEGRATION_SUMMARY.md`** - Этот файл

### 6. Создан тестовый скрипт

**`test-s3-connection.mjs`** - Проверка подключения к S3:
```bash
node test-s3-connection.mjs
```

## 📁 Структура файлов в S3

```
bucket: 06af932f-0a50-4164-b902-ef55a33d377c/
├── avatars/
│   ├── 1715788800000-abc123.jpg
│   ├── 1715788801000-def456.png
│   └── ...
└── meals/
    ├── 1715788802000-ghi789.jpg
    ├── 1715788803000-jkl012.png
    └── ...
```

## 🔄 Изменения в API

### До (Base64):
```typescript
// Клиент
const response = await fetch('/api/profile/avatar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ avatar: base64String }),
});

// Сервер
const { avatar } = await request.json();
await prisma.users.update({
  data: { avatar }, // Сохраняем base64 в БД
});
```

### После (S3):
```typescript
// Клиент
const formData = new FormData();
formData.append('avatar', file);

const response = await fetch('/api/profile/avatar', {
  method: 'POST',
  body: formData,
});

// Сервер
const file = formData.get('avatar') as File;
const buffer = Buffer.from(await file.arrayBuffer());
const key = generateS3Key(file.name, 'avatars');
const url = await uploadToS3(buffer, key, file.type);

await prisma.users.update({
  data: { avatar: url }, // Сохраняем URL из S3
});
```

## ✨ Преимущества

### 1. **Производительность**
- ❌ **До**: Base64 увеличивает размер на ~33%
- ✅ **После**: Оригинальный размер файла

### 2. **База данных**
- ❌ **До**: Большие записи в БД (base64 строки)
- ✅ **После**: Только URL (короткие строки)

### 3. **Масштабируемость**
- ❌ **До**: Файлы в БД или на сервере
- ✅ **После**: Отдельное S3 хранилище

### 4. **CDN и кэширование**
- ❌ **До**: Невозможно использовать CDN
- ✅ **После**: Можно настроить CDN перед S3

### 5. **Управление**
- ❌ **До**: Сложно управлять файлами
- ✅ **После**: Централизованное хранилище

## 🧪 Тестирование

### 1. Проверка подключения к S3
```bash
node test-s3-connection.mjs
```

**Ожидаемый результат:**
```
✅ Successfully connected to S3!
✅ File uploaded successfully!
✅ File downloaded successfully!
✅ File deleted successfully!
🎉 All tests passed!
```

### 2. Тестирование загрузки аватара

```bash
# Используйте Postman или curl
curl -X POST http://localhost:3000/api/profile/avatar \
  -H "Cookie: your-auth-cookie" \
  -F "avatar=@/path/to/image.jpg"
```

### 3. Тестирование анализа еды

```bash
curl -X POST http://localhost:3000/api/food/analyze \
  -H "Cookie: your-auth-cookie" \
  -F "image=@/path/to/food.jpg" \
  -F "mealType=LUNCH"
```

## 🔒 Безопасность

### Текущая конфигурация
- ✅ Файлы публично доступны (`ACL: 'public-read'`)
- ✅ Валидация типов файлов
- ✅ Ограничение размера файлов
- ✅ Уникальные имена файлов (предотвращает перезапись)

### Для приватных файлов (опционально)
Если нужно сделать файлы приватными:

1. Удалите `ACL: 'public-read'` из `lib/s3.ts`
2. Используйте подписанные URL:

```typescript
import { getSignedS3Url } from '@/lib/s3';

// Генерация временной ссылки (1 час)
const signedUrl = await getSignedS3Url('meals/file.jpg', 3600);
```

## 📊 Мониторинг

### Логирование
Все операции с S3 логируются:
- ✅ Успешные загрузки
- ✅ Ошибки загрузки
- ✅ Удаления файлов

### Проверка в консоли S3
Вы можете проверить загруженные файлы:
- URL: `https://s3.twcstorage.ru/06af932f-0a50-4164-b902-ef55a33d377c/`
- Или через S3 клиент/панель управления

## 🚀 Следующие шаги

### Рекомендуемые улучшения:

1. **Оптимизация изображений**
   ```bash
   npm install sharp
   ```
   - Автоматическое изменение размера
   - Конвертация в WebP
   - Генерация thumbnails

2. **CDN**
   - Настройте CloudFlare или другой CDN перед S3
   - Улучшит скорость загрузки по всему миру

3. **Очистка неиспользуемых файлов**
   - Создайте cron job для удаления orphaned файлов
   - Файлы, на которые нет ссылок в БД

4. **Миграция существующих данных**
   - Если есть base64 изображения в БД
   - Создайте скрипт миграции (пример в `S3_SETUP.md`)

5. **Мониторинг использования**
   - Отслеживайте размер хранилища
   - Мониторинг количества запросов

## 📝 Обновление фронтенда

Необходимо обновить все компоненты, которые загружают изображения:

### Файлы для обновления:
- [ ] Компонент загрузки аватара
- [ ] Компонент анализа еды
- [ ] Профиль пользователя
- [ ] История приемов пищи

### Изменения:
1. Заменить JSON на FormData
2. Добавить валидацию на клиенте
3. Показывать прогресс загрузки
4. Обрабатывать ошибки

Примеры см. в `FRONTEND_S3_USAGE.md`

## ❓ Troubleshooting

### Ошибка: "Failed to upload file to S3"
**Решение:**
1. Проверьте credentials в `.env`
2. Убедитесь, что endpoint доступен
3. Проверьте права доступа к бакету

### Ошибка: "Invalid file type"
**Решение:**
Убедитесь, что файл имеет правильный MIME тип:
- `image/jpeg`
- `image/png`
- `image/webp`

### Ошибка: "File size exceeds limit"
**Решение:**
- Аватары: максимум 5MB
- Фотографии еды: максимум 10MB
- Используйте сжатие на клиенте

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи: `console.log` в API routes
2. Запустите тест: `node test-s3-connection.mjs`
3. Проверьте переменные окружения
4. Убедитесь, что S3 endpoint доступен

## ✅ Checklist

- [x] Установлены зависимости
- [x] Добавлены переменные окружения
- [x] Создана утилита S3
- [x] Обновлен API для аватаров
- [x] Обновлен API для анализа еды
- [x] Создана документация
- [x] Протестировано подключение к S3
- [ ] Обновлен фронтенд
- [ ] Проведено end-to-end тестирование
- [ ] Настроен мониторинг
- [ ] Миграция существующих данных (если нужно)

---

**Дата интеграции:** 15 мая 2026  
**Версия:** 1.0.0  
**Статус:** ✅ Готово к использованию
