export default function GoogleSetupPage() {
  const redirectUri = 'http://localhost:3000/api/auth/google/callback';
  const consoleUrl = 'https://console.cloud.google.com/apis/credentials';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🔧 Настройка Google OAuth
          </h1>

          <div className="space-y-6">
            {/* Шаг 1 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Шаг 1: Откройте Google Cloud Console
              </h2>
              <a
                href={consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Открыть Google Console →
              </a>
            </div>

            {/* Шаг 2 */}
            <div className="border-l-4 border-green-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Шаг 2: Найдите OAuth Client ID
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Найдите в списке Client ID, который начинается с:
              </p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm">
                305798051928-...
              </code>
            </div>

            {/* Шаг 3 */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Шаг 3: Добавьте Redirect URI
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Нажмите на карандаш (редактировать), прокрутите до "Authorized redirect URIs" и добавьте:
              </p>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                <code className="text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                  {redirectUri}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(redirectUri)}
                  className="ml-3 px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
                >
                  Копировать
                </button>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-2 text-sm font-semibold">
                ⚠️ Важно: Без слеша в конце! Точно как показано выше.
              </p>
            </div>

            {/* Шаг 4 */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Шаг 4: Сохраните
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Нажмите кнопку "SAVE" внизу страницы и подождите 30 секунд.
              </p>
            </div>

            {/* Шаг 5 */}
            <div className="border-l-4 border-emerald-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Шаг 5: Проверьте
              </h2>
              <div className="flex gap-3">
                <a
                  href="/register"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Попробовать войти через Google
                </a>
                <a
                  href="/api/test-google-config"
                  target="_blank"
                  className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Проверить конфигурацию
                </a>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                💡 Что должно быть в Google Console:
              </h3>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>✓ Authorized JavaScript origins: <code>http://localhost:3000</code></li>
                <li>✓ Authorized redirect URIs: <code>{redirectUri}</code></li>
                <li>✓ Test users: добавьте ваш email (beka46979@gmail.com)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
