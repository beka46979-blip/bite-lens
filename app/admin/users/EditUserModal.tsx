'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Shield, User as UserIcon } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  email_verified: boolean;
  two_factor_enabled: boolean;
  height_cm: number | null;
  weight_start: number | null;
  weight_goal: number | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserModal({ user, isOpen, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    role: user.role,
    email_verified: user.email_verified,
    height_cm: user.height_cm?.toString() || '',
    weight_start: user.weight_start?.toString() || '',
    weight_goal: user.weight_goal?.toString() || '',
  });

  // Предотвращаем скролл body когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          email_verified: formData.email_verified,
          height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
          weight_start: formData.weight_start ? parseFloat(formData.weight_start) : null,
          weight_goal: formData.weight_goal ? parseFloat(formData.weight_goal) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при сохранении');
      }

      setSuccess('Пользователь успешно обновлен!');
      
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Редактирование пользователя
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {user.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Информация о пользователе */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Имя:</p>
                  <p className="font-medium text-gray-900">{user.name || 'Не указано'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email:</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Пол:</p>
                  <p className="font-medium text-gray-900">
                    {user.gender === 'MALE' ? 'Мужской' : user.gender === 'FEMALE' ? 'Женский' : 'Не указано'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Дата регистрации:</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">2FA:</p>
                  <p className="font-medium text-gray-900">
                    {user.two_factor_enabled ? 'Включен' : 'Выключен'}
                  </p>
                </div>
              </div>
            </div>

            {/* Физические параметры */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Физические параметры</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Рост (см)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текущий вес (кг)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight_start}
                    onChange={(e) => setFormData({ ...formData, weight_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Целевой вес (кг)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight_goal}
                    onChange={(e) => setFormData({ ...formData, weight_goal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="65"
                  />
                </div>
              </div>
            </div>

            {/* Роль */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Роль пользователя
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                  <input
                    type="radio"
                    name="role"
                    value="USER"
                    checked={formData.role === 'USER'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">Пользователь</p>
                      <p className="text-xs text-gray-600">Обычный доступ</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50">
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={formData.role === 'ADMIN'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Администратор</p>
                      <p className="text-xs text-gray-600">Полный доступ</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Email подтверждение */}
            <div>
              <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.email_verified}
                  onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">Email подтвержден</p>
                  <p className="text-xs text-gray-600">
                    Пользователь подтвердил свой email адрес
                  </p>
                </div>
              </label>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Сохранить
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
