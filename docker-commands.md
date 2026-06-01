# 🐳 Docker команды для локального тестирования

## Перед началом

Убедитесь что у вас установлен Docker:
```bash
docker --version
```

## Сборка образа

### Основной Dockerfile (multi-stage)
```bash
docker build -t bite-lens:latest .
```

### Упрощенный Dockerfile
```bash
docker build -f Dockerfile.simple -t bite-lens:simple .
```

### Сборка с выводом всех логов
```bash
docker build --progress=plain -t bite-lens:latest .
```

## Запуск контейнера

### С файлом .env
```bash
docker run -p 3000:3000 --env-file .env bite-lens:latest
```

### С отдельными переменными
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  bite-lens:latest
```

### В фоновом режиме (detached)
```bash
docker run -d -p 3000:3000 --env-file .env --name bite-lens-app bite-lens:latest
```

### С автоматическим удалением после остановки
```bash
docker run --rm -p 3000:3000 --env-file .env bite-lens:latest
```

## Управление контейнерами

### Просмотр запущенных контейнеров
```bash
docker ps
```

### Просмотр всех контейнеров (включая остановленные)
```bash
docker ps -a
```

### Остановка контейнера
```bash
docker stop bite-lens-app
```

### Запуск остановленного контейнера
```bash
docker start bite-lens-app
```

### Удаление контейнера
```bash
docker rm bite-lens-app
```

### Принудительное удаление запущенного контейнера
```bash
docker rm -f bite-lens-app
```

## Просмотр логов

### Все логи
```bash
docker logs bite-lens-app
```

### Последние 100 строк
```bash
docker logs --tail 100 bite-lens-app
```

### В реальном времени (follow)
```bash
docker logs -f bite-lens-app
```

### С временными метками
```bash
docker logs -t bite-lens-app
```

## Отладка

### Войти в запущенный контейнер
```bash
docker exec -it bite-lens-app sh
```

### Проверить переменные окружения внутри контейнера
```bash
docker exec bite-lens-app env
```

### Проверить файлы внутри контейнера
```bash
docker exec bite-lens-app ls -la /app
```

### Проверить процессы внутри контейнера
```bash
docker exec bite-lens-app ps aux
```

## Управление образами

### Список образов
```bash
docker images
```

### Удалить образ
```bash
docker rmi bite-lens:latest
```

### Удалить все неиспользуемые образы
```bash
docker image prune -a
```

### Информация об образе
```bash
docker inspect bite-lens:latest
```

### Размер образа
```bash
docker images bite-lens:latest
```

## Очистка

### Удалить все остановленные контейнеры
```bash
docker container prune
```

### Удалить все неиспользуемые образы
```bash
docker image prune -a
```

### Полная очистка (контейнеры, образы, сети, volumes)
```bash
docker system prune -a --volumes
```

## Тестирование

### Проверка health check
```bash
curl http://localhost:3000/api/health
```

### Проверка главной страницы
```bash
curl http://localhost:3000
```

### Проверка с выводом заголовков
```bash
curl -I http://localhost:3000
```

## Docker Compose (опционально)

Если хотите использовать Docker Compose для локальной разработки с БД:

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/bite_lens

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bite_lens
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Запуск:
```bash
docker-compose up
```

## Полезные алиасы

Добавьте в ваш `.bashrc` или `.zshrc`:

```bash
# Docker алиасы для bite-lens
alias dbl-build='docker build -t bite-lens:latest .'
alias dbl-run='docker run --rm -p 3000:3000 --env-file .env bite-lens:latest'
alias dbl-logs='docker logs -f bite-lens-app'
alias dbl-stop='docker stop bite-lens-app'
alias dbl-clean='docker system prune -a'
```

## NPM скрипты (уже добавлены в package.json)

```bash
# Сборка Docker образа
npm run docker:build

# Запуск Docker контейнера
npm run docker:run

# Сборка упрощенного образа
npm run docker:build:simple
```

## Проверка перед деплоем

1. **Соберите образ локально:**
   ```bash
   npm run docker:build
   ```

2. **Запустите контейнер:**
   ```bash
   npm run docker:run
   ```

3. **Проверьте работу:**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **Проверьте логи:**
   ```bash
   docker logs bite-lens-app
   ```

5. **Если всё работает - готово к деплою на Timeweb!**

## Troubleshooting

### Ошибка: "port is already allocated"
```bash
# Найдите процесс на порту 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Остановите процесс или используйте другой порт
docker run -p 3001:3000 --env-file .env bite-lens:latest
```

### Ошибка: "no space left on device"
```bash
# Очистите Docker
docker system prune -a --volumes
```

### Ошибка при сборке: "failed to solve"
```bash
# Попробуйте без кэша
docker build --no-cache -t bite-lens:latest .
```

### Контейнер сразу останавливается
```bash
# Проверьте логи
docker logs bite-lens-app

# Запустите в интерактивном режиме
docker run -it --env-file .env bite-lens:latest sh
```
