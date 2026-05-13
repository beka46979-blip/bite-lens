'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Trash2, Eye, Upload } from 'lucide-react';
import { ImageViewerModal } from '@/app/components/ImageViewerModal';
import { Modal } from '@/app/components/Modal';

interface ProfileHeaderProps {
  initialAvatar: string | null;
  userName: string;
  userEmail: string;
}

export function ProfileHeader({ initialAvatar, userName, userEmail }: ProfileHeaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleAvatarClick = () => {
    if (avatar) {
      setShowMenu(!showMenu);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleViewImage = () => {
    setShowMenu(false);
    setShowImageViewer(true);
  };

  const handleChangePhoto = () => {
    setShowMenu(false);
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);

    try {
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

  const handleDeleteAvatar = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvatar(null);
        setShowDeleteConfirm(false);
        router.refresh();
      } else {
        alert('Не удалось удалить фото');
      }
    } catch (error) {
      alert('Произошла ошибка при удалении фото');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        type="warning"
        message="Вы уверены, что хотите удалить фото профиля? Это действие нельзя отменить."
      >
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isDeleting}
            className="flex-1 px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold text-base"
          >
            Отмена
          </button>
          <button
            onClick={handleDeleteAvatar}
            disabled={isDeleting}
            className="flex-1 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-base"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Удалить
              </>
            )}
          </button>
        </div>
      </Modal>

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
        {/* Avatar with Menu */}
        <div className="relative" ref={menuRef}>
          <div 
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-4 ring-emerald-100 dark:ring-emerald-900/30 cursor-pointer transition-all hover:ring-emerald-200 dark:hover:ring-emerald-800/50 hover:scale-105"
            onClick={handleAvatarClick}
            title={avatar ? "Управление фото" : "Загрузить фото"}
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

            {/* Camera Icon Overlay */}
            {!isUploading && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          {showMenu && avatar && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={handleViewImage}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">Просмотреть</span>
              </button>
              <button
                onClick={handleChangePhoto}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <Upload className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-base font-medium text-gray-700 dark:text-gray-300">Изменить фото</span>
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <button
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
              >
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="text-base font-medium text-red-600 dark:text-red-400">Удалить фото</span>
              </button>
            </div>
          )}

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
