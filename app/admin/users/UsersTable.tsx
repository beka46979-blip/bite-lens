'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Shield, 
  User as UserIcon, 
  Mail, 
  MailCheck,
  Edit,
  Trash2,
  Loader2,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { EditUserModal } from './EditUserModal';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  gender: string | null;
  height_cm: number | null;
  weight_start: number | null;
  weight_goal: number | null;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UsersTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = async (page: number, searchQuery: string, role: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(role && { role }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    fetchUsers(1, '', '');
  }, []);

  // Обновление при изменении поиска
  useEffect(() => {
    if (search !== '') {
      const timer = setTimeout(() => {
        fetchUsers(1, search, roleFilter);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [search]);

  // Обновление при изменении фильтра роли
  useEffect(() => {
    if (roleFilter !== '') {
      const timer = setTimeout(() => {
        fetchUsers(1, search, roleFilter);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [roleFilter]);

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Ошибка при удалении пользователя');
        return;
      }

      fetchUsers(1, search, roleFilter);
    } catch (error) {
      alert('Ошибка при удалении пользователя');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const getInitials = (email: string, name: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="p-6">
        {/* Фильтры */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по email или имени..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Все роли</option>
            <option value="USER">Пользователи</option>
            <option value="ADMIN">Администраторы</option>
          </select>
        </div>

        {/* Таблица */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto touch-pan-y" style={{ overscrollBehaviorX: 'contain' }}>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Пользователь
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Роль
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      2FA
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Дата регистрации
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(user.email, user.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || 'Без имени'}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 border border-purple-300 text-purple-700 rounded-full text-sm font-medium">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded-full text-sm font-medium">
                            <UserIcon className="w-3 h-3" />
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.email_verified ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <MailCheck className="w-4 h-4" />
                            <span className="text-sm">Подтвержден</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-400">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">Не подтвержден</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.two_factor_enabled ? (
                          <span className="text-green-600 text-sm font-medium">Включен</span>
                        ) : (
                          <span className="text-gray-400 text-sm">Выключен</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {showDeleteConfirm === user.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(user.id)}
                                disabled={deletingId === user.id}
                                className="inline-flex items-center justify-center w-10 h-10 bg-red-100 border border-red-300 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Подтвердить удаление"
                              >
                                {deletingId === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={deletingId === user.id}
                                className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                title="Отмена"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="inline-flex items-center justify-center w-10 h-10 bg-red-100 border border-red-300 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title="Удалить"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Показано {users.length} из {pagination.total} пользователей
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUsers(pagination.page - 1, search, roleFilter)}
                    disabled={pagination.page === 1}
                    className="inline-flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-sm text-gray-600">
                    Страница {pagination.page} из {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => fetchUsers(pagination.page + 1, search, roleFilter)}
                    disabled={pagination.page === pagination.totalPages}
                    className="inline-flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => fetchUsers(pagination.page, search, roleFilter)}
        />
      )}
    </>
  );
}
