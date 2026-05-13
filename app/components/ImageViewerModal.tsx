'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  userName: string;
}

export function ImageViewerModal({ isOpen, onClose, imageUrl, userName }: ImageViewerModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Блокируем скролл и сохраняем текущую позицию
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Восстанавливаем скролл
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      // Очистка при размонтировании
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed top-0 left-0 right-0 bottom-0 z-[99999] animate-in fade-in duration-200" 
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
    >
      {/* Blurred Background */}
      <div className="absolute inset-0 bg-black/95" style={{ position: 'absolute', inset: 0 }}>
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover blur-3xl scale-110 opacity-20"
        />
      </div>

      {/* Clickable backdrop */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full transition-all hover:scale-110 shadow-lg"
        style={{ position: 'fixed', top: '1rem', right: '1rem' }}
        title="Закрыть (ESC)"
      >
        <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </button>

      {/* Centered Image - Full screen with aspect ratio preserved */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-10" 
        style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img
          src={imageUrl}
          alt={userName}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            minWidth: 'min(600px, 90vw)',
            minHeight: 'min(600px, 90vh)'
          }}
          draggable={false}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Bottom Hint - positioned absolutely at bottom */}
      <div 
        className="absolute bottom-8 sm:bottom-10 left-0 right-0 z-20 flex justify-center px-4"
        style={{ position: 'fixed', bottom: '2rem', left: 0, right: 0 }}
      >
        <div className="bg-black/70 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
          <p className="text-white/90 text-xs sm:text-sm">
            Нажмите ESC или кликните вне изображения
          </p>
        </div>
      </div>
    </div>
  );

  // Render modal in body using portal
  return createPortal(modalContent, document.body);
}
