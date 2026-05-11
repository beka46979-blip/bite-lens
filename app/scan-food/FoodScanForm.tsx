'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2, X, Check, Utensils } from 'lucide-react';
import Image from 'next/image';

interface Props {
  userId: string;
}

export function FoodScanForm({ userId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем, мобильное ли устройство
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Размер файла не должен превышать 10MB');
      return;
    }

    setImageFile(file);
    setError('');
    setSuccess('');
    setAnalysisResult(null);

    // Создаем preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Конвертируем изображение в base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const response = await fetch('/api/food/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            userId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка при анализе изображения');
        }

        setAnalysisResult(data);
        setSuccess('Анализ завершен успешно!');
      };

      reader.onerror = () => {
        throw new Error('Ошибка при чтении файла');
      };
    } catch (err: any) {
      setError(err.message || 'Ошибка при анализе изображения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/food/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          analysisId: analysisResult.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сохранении');
      }

      setSuccess('Прием пищи сохранен!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setAnalysisResult(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Сообщения */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-l-4 border-red-500 p-4 rounded-2xl shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 p-4 rounded-2xl shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-green-800 dark:text-green-200 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Загрузка изображения */}
      {!selectedImage ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 hover:shadow-xl">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
                <Camera className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white text-xl">+</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Загрузите фото еды
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Сделайте фото или выберите из галереи для анализа
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              {isMobile ? (
                <>
                  {/* Кнопка камеры для мобильных */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Сделать фото
                  </button>

                  {/* Кнопка галереи для мобильных */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-700 border-2 border-emerald-500 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                    Выбрать из галереи
                  </button>
                </>
              ) : (
                /* Только галерея для десктопа */
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Upload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                  Выбрать изображение
                </button>
              )}
            </div>

            {/* Input для галереи */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Input для камеры (только мобильные) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                📸 Поддерживаются: JPG, PNG, WEBP • Максимум 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview изображения */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Выбранное фото
              </h3>
              <button
                onClick={handleReset}
                className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110 group"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-lg ring-2 ring-emerald-100 dark:ring-emerald-900/30">
              <Image
                src={selectedImage}
                alt="Selected food"
                fill
                className="object-contain"
              />
            </div>

            {!analysisResult && (
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full mt-6 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Анализируем...
                  </>
                ) : (
                  <>
                    <Utensils className="w-6 h-6" />
                    Анализировать
                  </>
                )}
              </button>
            )}
          </div>

          {/* Результаты анализа */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Фото и основные калории - красивое расположение */}
              <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
                {/* Декоративные элементы */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative grid md:grid-cols-2 gap-6 items-center">
                  {/* Фото слева */}
                  <div className="relative">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/30">
                      <Image
                        src={selectedImage!}
                        alt="Analyzed food"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Калории справа */}
                  <div className="text-white space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Результаты анализа</h3>
                        <p className="text-white/80 text-sm">Пищевая ценность</p>
                      </div>
                    </div>

                    {/* Главная карточка калорий */}
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
                      <p className="text-white/90 text-sm font-medium mb-2">Общая калорийность</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl sm:text-6xl font-bold">
                          {analysisResult.totalCalories || 0}
                        </p>
                        <p className="text-2xl font-semibold text-white/80">ккал</p>
                      </div>
                    </div>

                    {/* Макронутриенты в ряд */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                        <p className="text-white/80 text-xs mb-1">Белки</p>
                        <p className="text-2xl font-bold">{analysisResult.totalProteins || 0}</p>
                        <p className="text-white/70 text-xs">г</p>
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                        <p className="text-white/80 text-xs mb-1">Жиры</p>
                        <p className="text-2xl font-bold">{analysisResult.totalFats || 0}</p>
                        <p className="text-white/70 text-xs">г</p>
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                        <p className="text-white/80 text-xs mb-1">Углеводы</p>
                        <p className="text-2xl font-bold">{analysisResult.totalCarbs || 0}</p>
                        <p className="text-white/70 text-xs">г</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Список продуктов */}
              {analysisResult.foods && analysisResult.foods.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-emerald-600" />
                    </div>
                    Обнаруженные продукты
                  </h4>
                  <div className="space-y-3">
                    {analysisResult.foods.map((food: any, index: number) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-emerald-50/30 hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <span className="text-xl">🍽️</span>
                          </div>
                          <span className="font-semibold text-gray-900">{food.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">{food.calories}</p>
                          <p className="text-xs text-gray-500">ккал</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопка сохранения */}
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    Сохранить прием пищи
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
