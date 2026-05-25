# Настройка S3 хранилища

## Обзор

Проект настроен для использования S3-совместимого хранилища для всех изображений (аватары пользователей и фотографии еды).

## Конфигурация

### Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
S3_ENDPOINT="https://s3.twcstorage.ru"
S3_BUCKET_NAME="06af932f-0a50-4164-b902-ef55a33d377c"
S3_ACCESS_KEY="TXVDC2I2RV51LNZGY8E6"
S3_SECRET_KEY="9KtlHjemvfIFZHwuWbaAqekSTVBvXfIWLMTEKilb"
S3_REGION="us-east-1"
```

## Установленные зависимости

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Структура файлов

### `lib/s3.ts`

Утилиты для работы с S3:

- **`uploadToS3(file, key, contentType)`** - Загрузка файла в S3
- **`deleteFromS3(key)`** - Удаление файла из S3
- **`getSignedS3Url(key, expiresIn)`** - Получение подписанного URL для приватных файлов
- **`extractS3Key(url)`** - Извлечение ключа файла из URL
- **`generateS3Key(originalName, prefix)`** - Генерация уникального имени файла

## Использование

### Загрузка аватара пользователя

API: `POST /api/profile/avatar`

```typescript
// Клиентская часть
const formData = new FormData();
formData.append('avatar', file); // File object

const response = await fetch('/api/profile/avatar', {
  method: 'POST',
  body: formData,
});
```

**Серверная обработка:**
1. Проверка типа файла (JPEG, PNG, WebP)
2. Проверка размера (максимум 5MB)
3. Удаление старого аватара из S3 (если существует)
4. Загрузка нового файла в S3 в папку `avatars/`
5. Сохранение URL в базе данных

### Анализ фотографии еды

API: `POST /api/food/analyze`

```typescript
// Клиентская часть
const formData = new FormData();
formData.append('image', file); // File object
formData.append('mealType', 'BREAKFAST'); // BREAKFAST, LUNCH, DINNER, SNACK

const response = await fetch('/api/food/analyze', {
  method: 'POST',
  body: formData,
});
```

**Серверная обработка:**
1. Проверка типа файла (JPEG, PNG, WebP)
2. Проверка размера (максимум 10MB)
3. Загрузка файла в S3 в папку `meals/`
4. Конвертация в base64 для отправки в OpenAI
5. Анализ изображения с помощью GPT-4 Vision
6. Сохранение результатов в базе данных

## Организация файлов в S3

```
bucket/
├── avatars/
│   ├── 1234567890-abc123.jpg
│   ├── 1234567891-def456.png
│   └── ...
└── meals/
    ├── 1234567892-ghi789.jpg
    ├── 1234567893-jkl012.png
    └── ...
```

## Формат имен файлов

Все файлы автоматически получают уникальные имена:

```
{timestamp}-{randomString}.{extension}
```

Пример: `1715788800000-abc123def456.jpg`

## Безопасность

### Публичные файлы

Все загруженные файлы имеют ACL `public-read`, что означает:
- Файлы доступны по прямому URL
- Не требуется аутентификация для просмотра
- Подходит для аватаров и фотографий еды

### Приватные файлы (опционально)

Если нужно сделать файлы приватными:

1. Удалите `ACL: 'public-read'` из `uploadToS3()`
2. Используйте `getSignedS3Url()` для генерации временных ссылок

```typescript
// Пример использования подписанных URL
const signedUrl = await getSignedS3Url('meals/1234567890-abc123.jpg', 3600); // 1 час
```

## Ограничения

### Размеры файлов
- **Аватары**: максимум 5MB
- **Фотографии еды**: максимум 10MB

### Поддерживаемые форматы
- JPEG / JPG
- PNG
- WebP

## Миграция существующих данных

Если у вас есть существующие изображения в base64 или локальном хранилище:

1. Создайте скрипт миграции
2. Для каждого изображения:
   - Декодируйте base64 или прочитайте файл
   - Загрузите в S3 используя `uploadToS3()`
   - Обновите URL в базе данных

```typescript
// Пример скрипта миграции
import { prisma } from './lib/prisma';
import { uploadToS3, generateS3Key } from './lib/s3';

async function migrateImages() {
  const users = await prisma.users.findMany({
    where: {
      avatar: {
        startsWith: 'data:image/',
      },
    },
  });

  for (const user of users) {
    if (user.avatar) {
      // Декодируем base64
      const base64Data = user.avatar.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Определяем тип файла
      const mimeType = user.avatar.split(';')[0].split(':')[1];
      const extension = mimeType.split('/')[1];
      
      // Загружаем в S3
      const key = generateS3Key(`avatar.${extension}`, 'avatars');
      const url = await uploadToS3(buffer, key, mimeType);
      
      // Обновляем в БД
      await prisma.users.update({
        where: { id: user.id },
        data: { avatar: url },
      });
      
      console.log(`Migrated avatar for user ${user.id}`);
    }
  }
}
```

## Мониторинг и отладка

### Проверка загрузки

```typescript
// Тестовый запрос
const testUpload = async () => {
  const buffer = Buffer.from('test');
  const key = generateS3Key('test.txt', 'test');
  const url = await uploadToS3(buffer, key, 'text/plain');
  console.log('Uploaded to:', url);
};
```

### Логирование

Все операции с S3 логируются в консоль:
- Успешные загрузки
- Ошибки загрузки
- Удаления файлов

## Troubleshooting

### Ошибка: "Failed to upload file to S3"

Проверьте:
1. Правильность credentials (ACCESS_KEY, SECRET_KEY)
2. Доступность endpoint
3. Права доступа к бакету

### Ошибка: "Invalid file type"

Убедитесь, что загружаемый файл имеет правильный MIME тип:
- `image/jpeg`
- `image/png`
- `image/webp`

### Ошибка: "File size exceeds limit"

Проверьте размер файла:
- Аватары: максимум 5MB
- Фотографии еды: максимум 10MB

## Дополнительные возможности

### Оптимизация изображений

Для оптимизации изображений перед загрузкой можно использовать библиотеку `sharp`:

```bash
npm install sharp
```

```typescript
import sharp from 'sharp';

// Оптимизация изображения
const optimizedBuffer = await sharp(buffer)
  .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85 })
  .toBuffer();

await uploadToS3(optimizedBuffer, key, 'image/jpeg');
```

### Генерация thumbnails

```typescript
// Создание миниатюры
const thumbnail = await sharp(buffer)
  .resize(200, 200, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toBuffer();

const thumbnailKey = generateS3Key('thumbnail.jpg', 'thumbnails');
await uploadToS3(thumbnail, thumbnailKey, 'image/jpeg');
```
