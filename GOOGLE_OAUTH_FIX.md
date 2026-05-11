# Исправление Google OAuth

## Проблема
Ошибка: `redirect_uri_mismatch` - Google не может найти правильный redirect URI.

## Решение

### 1. Откройте Google Cloud Console
https://console.cloud.google.com/apis/credentials

### 2. Найдите ваш OAuth 2.0 Client ID
Client ID: `305798051928-b2o5h6bsirfokl7b2n0pjd5bbsbk2b1k.apps.googleusercontent.com`

### 3. Нажмите на него для редактирования

### 4. В разделе "Authorized redirect URIs" добавьте ТОЧНО этот URL:
```
http://localhost:3000/api/auth/google/callback
```

**ВАЖНО:**
- Без trailing slash (/)
- Точно `http://` (не https для localhost)
- Точно порт `:3000`
- Точно путь `/api/auth/google/callback`

### 5. Нажмите "SAVE"

### 6. Подождите 1-2 минуты
Google нужно время для обновления конфигурации.

### 7. Проверьте
Откройте http://localhost:3000/register и нажмите "Войти через Google"

## Если все еще не работает

### Проверьте NEXT_PUBLIC_APP_URL в .env:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Проверьте что в Google Console добавлены оба URL:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/google/callback
```

## Альтернативное решение

Если проблема сохраняется, попробуйте создать новый OAuth Client ID:

1. В Google Console → Credentials
2. Create Credentials → OAuth client ID
3. Application type: Web application
4. Name: `Bite Lens Local`
5. Authorized JavaScript origins: `http://localhost:3000`
6. Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
7. Create
8. Скопируйте новые Client ID и Client Secret в .env
9. Перезапустите dev сервер: `npm run dev`
