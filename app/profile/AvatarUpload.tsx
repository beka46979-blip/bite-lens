'use client';

import { useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface AvatarUploadProps {
  avatarPreview: string | null;
  userName: string;
  onAvatarChange: (file: File) => void;
  onRemoveAvatar: () => void;
}

export function AvatarUpload({ avatarPreview, userName, onAvatarChange, onRemoveAvatar }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="relative group">
      {/* Avatar Display */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden ring-4 ring-emerald-100 dark:ring-emerald-900/30">
        {avatarPreview ? (
          <img 
            src={avatarPreview} 
            alt={userName || 'User'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
            {userName?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-white hover:scale-110 transition-transform"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Online Indicator */}
      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-white dark:border-gray-800"></div>

      {/* Remove Button (only if avatar exists) */}
      {avatarPreview && (
        <button
          type="button"
          onClick={onRemoveAvatar}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
