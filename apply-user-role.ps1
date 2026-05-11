# PowerShell скрипт для добавления роли пользователя

Write-Host "🔧 Добавление роли пользователя в таблицу users..." -ForegroundColor Cyan
Write-Host ""

# Читаем DATABASE_URL из .env
$envContent = Get-Content .env
$databaseUrl = ($envContent | Where-Object { $_ -match '^DATABASE_URL=' }) -replace 'DATABASE_URL=', '' -replace '"', ''

if (-not $databaseUrl) {
    Write-Host "❌ DATABASE_URL не найден в .env файле" -ForegroundColor Red
    exit 1
}

# Парсим DATABASE_URL
if ($databaseUrl -match 'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)') {
    $user = $matches[1]
    $password = $matches[2]
    $host = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "📊 Подключение к базе данных:" -ForegroundColor Yellow
    Write-Host "   Host: $host"
    Write-Host "   Port: $port"
    Write-Host "   Database: $database"
    Write-Host "   User: $user"
    Write-Host ""
    
    # Устанавливаем переменную окружения для пароля
    $env:PGPASSWORD = $password
    
    # Выполняем SQL
    Write-Host "⚙️  Выполнение SQL..." -ForegroundColor Yellow
    
    $sql = Get-Content add-user-role.sql -Raw
    
    $sql | & psql -h $host -p $port -U $user -d $database
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Роль пользователя успешно добавлена!" -ForegroundColor Green
        Write-Host ""
        Write-Host "💡 Доступные роли:" -ForegroundColor Cyan
        Write-Host "   - USER (обычный пользователь)"
        Write-Host "   - PREMIUM_USER (премиум пользователь)"
        Write-Host "   - VIP (VIP пользователь)"
    } else {
        Write-Host ""
        Write-Host "❌ Ошибка при выполнении SQL" -ForegroundColor Red
        Write-Host "💡 Возможно, psql не установлен или поле уже существует" -ForegroundColor Yellow
    }
    
    # Очищаем переменную окружения
    Remove-Item Env:\PGPASSWORD
} else {
    Write-Host "❌ Неверный формат DATABASE_URL" -ForegroundColor Red
    exit 1
}
