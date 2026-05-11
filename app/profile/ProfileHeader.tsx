'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { ImageViewerModal } from '@/app/components/ImageViewerModal';

interface ProfileHeaderProps {
  initialAvatar: string | null;
  userName: string;
  userEmail: string;
}

export function ProfileHeader({ initialAvatar, userName, userEmail }: ProfileHeaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  const handleAvatarClick = () => {
    if (avatar) {
      setShowImageViewer(true);
    } else {
      // Если нет аватара, открываем выбор файла
      fileInputRef.current?.click();
    }
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Конвертируем в base64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        const base64Image = reader.result as string;

        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64Image }),
        });

        if (response.ok) {
          setAvatar(base64Image);
          router.refresh();
        } else {
          alert('Ошибка при загрузке фото');
        }
      };
    } catch (error) {
      alert('Ошибка при загрузке фото');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Image Viewer Modal */}
      {avatar && (
        <ImageViewerModal
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
          imageUrl={avatar}
          userName={userName}
        />
      )}

      <div className="flex items-center gap-4">
        {/* Avatar with Upload */}
        <div className="relative">
          <div 
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-4 ring-emerald-100 dark:ring-emerald-900/30 cursor-pointer transition-transform hover:scale-105"
            onClick={handleAvatarClick}
            title={avatar ? "Посмотреть фото" : "Загрузить фото"}
          >
            {avatar ? (
              <img 
                src={avatar} 
                alt={userName || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                {userName?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            
            {/* Loading Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Camera Button - Always Visible */}
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={isUploading}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 disabled:opacity-50 border-2 border-white dark:border-gray-800"
            title="Изменить фото"
          >
            <Camera className="w-4 h-4 text-white" />
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* User Info */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            {userName || 'Пользователь'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{userEmail}</p>
        </div>
      </div>
    </>
  );
}
