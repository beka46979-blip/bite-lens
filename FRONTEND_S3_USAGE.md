# Использование S3 на фронтенде

## Загрузка аватара

### React компонент для загрузки аватара

```tsx
'use client';

import { useState } from 'react';

export default function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла на клиенте
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Только JPEG, PNG и WebP файлы разрешены');
      return;
    }

    // Проверка размера файла (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка загрузки');
      }

      const data = await response.json();
      setAvatarUrl(data.user.avatar);
      alert('Аватар успешно загружен!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить аватар?')) return;

    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка удаления');
      }

      setAvatarUrl(null);
      alert('Аватар успешно удален!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        
        <div>
          <label className="block">
            <span className="sr-only">Выберите аватар</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
          </label>
          
          {avatarUrl && (
            <button
              onClick={handleDelete}
              disabled={uploading}
              className="mt-2 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Удалить аватар
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <p className="text-sm text-gray-600">Загрузка...</p>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

## Загрузка фотографии еды

### React компонент для анализа еды

```tsx
'use client';

import { useState } from 'react';

interface FoodAnalysis {
  id: string;
  mealId: string;
  imageUrl: string;
  dishName: string;
  totalCalories: number;
  totalProteins: number;
  totalFats: number;
  totalCarbs: number;
  weightGram: number;
  confidence: number;
  verdict: string;
  foods: Array<{
    name: string;
    calories: number;
    proteins: number;
    fats: number;
    carbs: number;
    weight: number;
  }>;
}

export default function FoodAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Только JPEG, PNG и WebP файлы разрешены');
      return;
    }

    // Проверка размера файла (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Размер файла не должен превышать 10MB');
      return;
    }

    // Показываем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mealType', 'SNACK'); // или выбор пользователя

      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка анализа');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Загрузите фото еды
          </span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={analyzing}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100
              disabled:opacity-50"
          />
        </label>
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-md rounded-lg shadow-lg"
          />
          {analyzing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p>Анализируем...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {analysis && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {analysis.dishName}
            </h3>
            <p className="text-sm text-gray-600">{analysis.verdict}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Калории</p>
              <p className="text-2xl font-bold text-blue-600">
                {analysis.totalCalories} ккал
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Вес</p>
              <p className="text-2xl font-bold text-green-600">
                {analysis.weightGram} г
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Белки</p>
              <p className="text-lg font-semibold">{analysis.totalProteins}г</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Жиры</p>
              <p className="text-lg font-semibold">{analysis.totalFats}г</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Углеводы</p>
              <p className="text-lg font-semibold">{analysis.totalCarbs}г</p>
            </div>
          </div>

          {analysis.foods && analysis.foods.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Состав блюда:
              </h4>
              <ul className="space-y-2">
                {analysis.foods.map((food, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{food.name}</span>
                    {' - '}
                    {food.calories} ккал, {food.weight}г
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Уверенность: {(analysis.confidence * 100).toFixed(0)}%
          </div>

          {analysis.imageUrl && (
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Изображение сохранено в S3
              </p>
              <a
                href={analysis.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Открыть оригинал
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Оптимизация изображений на клиенте

Для уменьшения размера файлов перед загрузкой можно использовать `browser-image-compression`:

```bash
npm install browser-image-compression
```

```tsx
import imageCompression from 'browser-image-compression';

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    // Опции сжатия
    const options = {
      maxSizeMB: 1, // Максимальный размер 1MB
      maxWidthOrHeight: 1920, // Максимальное разрешение
      useWebWorker: true,
    };

    // Сжимаем изображение
    const compressedFile = await imageCompression(file, options);
    
    console.log('Оригинальный размер:', file.size / 1024 / 1024, 'MB');
    console.log('Сжатый размер:', compressedFile.size / 1024 / 1024, 'MB');

    // Загружаем сжатое изображение
    const formData = new FormData();
    formData.append('avatar', compressedFile);

    const response = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    });

    // ... обработка ответа
  } catch (error) {
    console.error('Ошибка сжатия:', error);
  }
};
```

## Drag & Drop загрузка

```tsx
'use client';

import { useState, useCallback } from 'react';

export default function DragDropUpload() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (!imageFile) {
      alert('Пожалуйста, загрузите изображение');
      return;
    }

    // Загружаем файл
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('mealType', 'SNACK');

    try {
      const response = await fetch('/api/food/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Анализ:', data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }, []);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center
        transition-colors duration-200
        ${isDragging 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 bg-gray-50'
        }
      `}
    >
      <p className="text-gray-600">
        Перетащите изображение сюда или нажмите для выбора
      </p>
    </div>
  );
}
```

## Прогресс загрузки

```tsx
'use client';

import { useState } from 'react';

export default function UploadWithProgress() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const xhr = new XMLHttpRequest();

      // Отслеживаем прогресс
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Обрабатываем завершение
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log('Успешно загружено:', data);
        }
        setUploading(false);
      });

      xhr.open('POST', '/api/food/analyze');
      xhr.send(formData);
    } catch (error) {
      console.error('Ошибка:', error);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        disabled={uploading}
      />

      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {progress.toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
}
```
