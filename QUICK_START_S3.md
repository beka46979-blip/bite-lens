# 🚀 Quick Start - S3 Integration

## Что было сделано?

✅ S3 хранилище полностью настроено и готово к использованию!  
✅ Все изображения (аватары и фото еды) теперь хранятся в S3  
✅ API endpoints обновлены для работы с файлами вместо base64

## 🎯 Быстрый старт

### 1. Проверьте переменные окружения

Откройте `.env` и убедитесь, что добавлены:

```env
S3_ENDPOINT="https://s3.twcstorage.ru"
S3_BUCKET_NAME="06af932f-0a50-4164-b902-ef55a33d377c"
S3_ACCESS_KEY="TXVDC2I2RV51LNZGY8E6"
S3_SECRET_KEY="9KtlHjemvfIFZHwuWbaAqekSTVBvXfIWLMTEKilb"
S3_REGION="us-east-1"
```

✅ **Уже добавлено!**

### 2. Проверьте зависимости

```bash
npm install
```

✅ **Уже установлено:** `@aws-sdk/client-s3` и `@aws-sdk/s3-request-presigner`

### 3. Протестируйте подключение

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

✅ **Тест пройден успешно!**

### 4. Запустите приложение

```bash
npm run dev
```

## 📝 Что изменилось в API?

### Загрузка аватара

**Было (Base64):**
```javascript
fetch('/api/profile/avatar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ avatar: base64String })
});
```

**Стало (FormData):**
```javascript
const formData = new FormData();
formData.append('avatar', file); // File object

fetch('/api/profile/avatar', {
  method: 'POST',
  body: formData
});
```

### Анализ еды

**Было (Base64):**
```javascript
fetch('/api/food/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    image: base64String,
    mealType: 'LUNCH'
  })
});
```

**Стало (FormData):**
```javascript
const formData = new FormData();
formData.append('image', file); // File object
formData.append('mealType', 'LUNCH');

fetch('/api/food/analyze', {
  method: 'POST',
  body: formData
});
```

## 🔧 Обновление фронтенда

### Минимальные изменения

Найдите все места, где используется:
- `JSON.stringify({ avatar: ... })`
- `JSON.stringify({ image: ... })`

Замените на:
- `FormData` с `append('avatar', file)`
- `FormData` с `append('image', file)`

### Пример компонента

```tsx
'use client';

import { useState } from 'react';

export default function AvatarUpload() {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log('Avatar URL:', data.user.avatar);
      alert('Аватар загружен!');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  return (
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleFileChange}
      disabled={uploading}
    />
  );
}
```

## 📚 Документация

### Основные файлы:

1. **`S3_INTEGRATION_SUMMARY.md`** - Полный обзор интеграции
2. **`S3_SETUP.md`** - Детальная настройка и использование
3. **`FRONTEND_S3_USAGE.md`** - Примеры для фронтенда
4. **`QUICK_START_S3.md`** - Этот файл

### Код:

- **`lib/s3.ts`** - Утилиты для работы с S3
- **`app/api/profile/avatar/route.ts`** - API загрузки аватара
- **`app/api/food/analyze/route.ts`** - API анализа еды
- **`test-s3-connection.mjs`** - Тест подключения

## ✅ Checklist для разработчика

### Backend (✅ Готово)
- [x] Установлены зависимости
- [x] Настроены переменные окружения
- [x] Создана утилита S3
- [x] Обновлен API для аватаров
- [x] Обновлен API для анализа еды
- [x] Протестировано подключение

### Frontend (⚠️ Требуется обновление)
- [ ] Обновить компонент загрузки аватара
- [ ] Обновить компонент анализа еды
- [ ] Добавить валидацию на клиенте
- [ ] Добавить индикатор прогресса
- [ ] Протестировать загрузку файлов

## 🎨 Преимущества новой системы

### 1. Производительность
- **До:** Base64 увеличивает размер на 33%
- **После:** Оригинальный размер файла

### 2. База данных
- **До:** Огромные записи с base64
- **После:** Короткие URL строки

### 3. Масштабируемость
- **До:** Файлы в БД
- **После:** Отдельное S3 хранилище

### 4. Управление
- **До:** Сложно управлять файлами
- **После:** Централизованное хранилище

## 🔍 Проверка работы

### 1. Проверьте S3 подключение
```bash
node test-s3-connection.mjs
```

### 2. Загрузите тестовый аватар
```bash
curl -X POST http://localhost:3000/api/profile/avatar \
  -H "Cookie: your-auth-cookie" \
  -F "avatar=@test-image.jpg"
```

### 3. Проверьте URL в ответе
Должен быть формата:
```
https://s3.twcstorage.ru/06af932f-0a50-4164-b902-ef55a33d377c/avatars/1715788800000-abc123.jpg
```

### 4. Откройте URL в браузере
Изображение должно загрузиться!

## 🆘 Помощь

### Ошибка подключения к S3
```bash
# Проверьте переменные окружения
cat .env | grep S3

# Проверьте доступность endpoint
curl https://s3.twcstorage.ru
```

### Ошибка загрузки файла
- Проверьте тип файла (только JPEG, PNG, WebP)
- Проверьте размер (аватары ≤5MB, еда ≤10MB)
- Проверьте права доступа к бакету

### Нужна помощь?
Смотрите детальную документацию:
- `S3_SETUP.md` - Полная настройка
- `FRONTEND_S3_USAGE.md` - Примеры кода

## 🎉 Готово!

S3 интеграция завершена и протестирована.  
Теперь все изображения хранятся в облачном хранилище!

**Следующий шаг:** Обновите фронтенд компоненты для работы с новым API.

---

**Статус:** ✅ Backend готов | ⚠️ Frontend требует обновления  
**Дата:** 15 мая 2026  
**Версия:** 1.0.0
